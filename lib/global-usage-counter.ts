/**
 * Global AI Usage Counter
 * Tracks all AI operations across the application
 * Enforces free tier limits (6 operations per 24-hour session)
 */

const USAGE_STORAGE_KEY = "smello-global-usage"
const FREE_TIER_LIMIT = 6
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export type AIOperationType =
    | "idea-generation"
    | "epic-generation"
    | "story-generation"
    | "prd-section"
    | "blueprint-architecture"
    | "blueprint-database"
    | "blueprint-api"
    | "user-journey"
    | "market-research"
    | "competitor-analysis"
    | "persona-generation"

export interface AIOperation {
    type: AIOperationType
    timestamp: string
    projectId?: string
    details?: string
}

export interface UsageStats {
    sessionStart: string
    totalOperations: number
    operations: AIOperation[]
}

export class GlobalUsageCounter {
    private static getStats(): UsageStats {
        if (typeof window === "undefined") {
            return { sessionStart: new Date().toISOString(), totalOperations: 0, operations: [] }
        }

        const stored = localStorage.getItem(USAGE_STORAGE_KEY)
        if (!stored) {
            const newStats: UsageStats = {
                sessionStart: new Date().toISOString(),
                totalOperations: 0,
                operations: [],
            }
            localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newStats))
            return newStats
        }

        try {
            const stats: UsageStats = JSON.parse(stored)

            // Check if session has expired (24 hours)
            const sessionAge = Date.now() - new Date(stats.sessionStart).getTime()
            if (sessionAge > SESSION_DURATION_MS) {
                // Reset session
                const newStats: UsageStats = {
                    sessionStart: new Date().toISOString(),
                    totalOperations: 0,
                    operations: [],
                }
                localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newStats))
                return newStats
            }

            return stats
        } catch {
            return { sessionStart: new Date().toISOString(), totalOperations: 0, operations: [] }
        }
    }

    private static saveStats(stats: UsageStats): void {
        if (typeof window === "undefined") return
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(stats))
    }

    /**
     * Check if user has remaining free operations
     */
    static hasRemainingOperations(): boolean {
        const stats = this.getStats()
        return stats.totalOperations < FREE_TIER_LIMIT
    }

    /**
     * Get remaining free operations count
     */
    static getRemainingOperations(): number {
        const stats = this.getStats()
        return Math.max(0, FREE_TIER_LIMIT - stats.totalOperations)
    }

    /**
     * Get total operations used in current session
     */
    static getTotalOperations(): number {
        const stats = this.getStats()
        return stats.totalOperations
    }

    /**
     * Record an AI operation
     * Returns true if operation was recorded, false if limit exceeded
     */
    static recordOperation(
        type: AIOperationType,
        projectId?: string,
        details?: string
    ): boolean {
        const stats = this.getStats()

        // Check if limit exceeded
        if (stats.totalOperations >= FREE_TIER_LIMIT) {
            return false
        }

        const operation: AIOperation = {
            type,
            timestamp: new Date().toISOString(),
            projectId,
            details,
        }

        stats.operations.push(operation)
        stats.totalOperations++

        this.saveStats(stats)
        return true
    }

    /**
     * Get time until session reset
     */
    static getTimeUntilReset(): number {
        const stats = this.getStats()
        const sessionAge = Date.now() - new Date(stats.sessionStart).getTime()
        return Math.max(0, SESSION_DURATION_MS - sessionAge)
    }

    /**
     * Get formatted time until reset (e.g., "5h 30m")
     */
    static getFormattedTimeUntilReset(): string {
        const ms = this.getTimeUntilReset()
        const hours = Math.floor(ms / (60 * 60 * 1000))
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    /**
     * Get all operations in current session
     */
    static getOperations(): AIOperation[] {
        const stats = this.getStats()
        return stats.operations
    }

    /**
     * Reset the usage counter (for testing or admin purposes)
     */
    static reset(): void {
        if (typeof window === "undefined") return
        localStorage.removeItem(USAGE_STORAGE_KEY)
    }

    /**
     * Check if user should be prompted to add API key
     */
    static shouldPromptForApiKey(): boolean {
        return this.getRemainingOperations() === 0
    }
}
