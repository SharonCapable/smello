/**
 * AI Service Manager
 * Handles tiered access to AI services:
 * 1. User's Google AI account (if signed in and linked)
 * 2. User's custom API keys (from settings)
 * 3. ENV default keys (with usage limits)
 */

import { ApiKeyManager } from "./api-key-manager"
import { GlobalUsageCounter } from "./global-usage-counter"

export type AIProvider = 'gemini' | 'anthropic'

export interface AIServiceConfig {
    provider: AIProvider
    apiKey: string
    source: 'google-account' | 'user-api-key' | 'env-default'
    hasLimits: boolean
}

export class AIServiceManager {
    /**
     * Get the best available AI service configuration
     * Priority: Google Account > User API Key > ENV Default
     */
    static async getServiceConfig(
        provider: AIProvider,
        userSession?: any
    ): Promise<AIServiceConfig> {
        // 1. Try Google Account access (if signed in and provider is Gemini)
        if (userSession?.accessToken && provider === 'gemini') {
            const hasGoogleAI = await this.checkGoogleAIAccess(userSession.accessToken)
            if (hasGoogleAI) {
                return {
                    provider: 'gemini',
                    apiKey: userSession.accessToken,
                    source: 'google-account',
                    hasLimits: false,
                }
            }
        }

        // 2. Try user's custom API key
        const userApiKey = ApiKeyManager.getApiKey(provider)
        if (userApiKey && !ApiKeyManager.isUsingDefaultKey(provider)) {
            return {
                provider,
                apiKey: userApiKey,
                source: 'user-api-key',
                hasLimits: false,
            }
        }

        // 3. Fall back to ENV default key (with limits)
        const envKey = ApiKeyManager.getApiKey(provider)
        if (envKey) {
            return {
                provider,
                apiKey: envKey,
                source: 'env-default',
                hasLimits: true,
            }
        }

        throw new Error(`No ${provider} API access available. Please sign in or add an API key.`)
    }

    /**
     * Check if user has access to Google AI via their Google account
     */
    static async checkGoogleAIAccess(accessToken: string): Promise<boolean> {
        try {
            // Try to make a simple request to Google AI API
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/models',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            )
            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Check if operation should be counted against limits
     */
    static shouldCountOperation(config: AIServiceConfig): boolean {
        return config.hasLimits && config.source === 'env-default'
    }

    /**
     * Check if user can perform an AI operation
     */
    static canPerformOperation(config: AIServiceConfig): {
        allowed: boolean
        reason?: string
    } {
        // Client should not block operations; server enforces quota.
        // Return allowed so UI can attempt operations and surface server responses.
        return { allowed: true }
    }

    /**
     * Get user-friendly service source description
     */
    static getSourceDescription(source: AIServiceConfig['source']): string {
        switch (source) {
            case 'google-account':
                return 'Using your Google AI account'
            case 'user-api-key':
                return 'Using your custom API key'
            case 'env-default':
                return 'Using free tier (limited)'
            default:
                return 'Unknown source'
        }
    }

    /**
     * Get remaining operations for current configuration
     */
    static getRemainingOperations(config: AIServiceConfig): number | null {
        if (!config.hasLimits) {
            return null // Unlimited
        }
        return GlobalUsageCounter.getRemainingOperations()
    }
}
