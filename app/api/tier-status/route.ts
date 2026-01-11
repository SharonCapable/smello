import { NextResponse } from 'next/server'
import admin, { initAdmin, adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import { decryptText } from '@/lib/crypto'

export interface TierStatus {
    // Current active tier
    activeTier: 'free' | 'oauth' | 'personal_key' | 'none'

    // Free tier status
    free: {
        available: boolean
        used: number
        limit: number
        remaining: number
        resetsAt: string | null
    }

    // OAuth tier status (Google account for Gemini)
    oauth: {
        available: boolean
        provider: 'google' | null
        hasGeminiScope: boolean
    }

    // Personal API key tier status
    personalKey: {
        available: boolean
        hasGemini: boolean
        hasClaude: boolean
    }

    // Recommendation for the user
    recommendation: string
}

async function getSessionUid() {
    const headersList = await headers()
    const authHeader = headersList.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1]
        try {
            const decodedToken = await adminAuth().verifyIdToken(token)
            return decodedToken.uid
        } catch (e) {
            console.warn('Firebase token verification failed', e)
        }
    }
    return null
}

export async function GET() {
    try {
        const userId = await getSessionUid()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()

        // Initialize tier status
        const tierStatus: TierStatus = {
            activeTier: 'none',
            free: {
                available: false,
                used: 0,
                limit: 6,
                remaining: 0,
                resetsAt: null
            },
            oauth: {
                available: false,
                provider: null,
                hasGeminiScope: false
            },
            personalKey: {
                available: false,
                hasGemini: false,
                hasClaude: false
            },
            recommendation: ''
        }

        // Check free tier usage
        const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
        const hasServerKey = !!(process.env.GEMINI_API_KEY || process.env.CLAUDE_API_KEY)

        if (hasServerKey) {
            const statsRef = db.collection('usageStats').doc(userId)
            const statsSnap = await statsRef.get()

            let used = 0
            let lastReset: Date | null = null

            if (statsSnap.exists) {
                const data = statsSnap.data()
                used = data?.operationCount || 0
                lastReset = data?.lastReset?.toDate() || data?.updatedAt?.toDate() || null
            }

            // Check if 24 hours have passed since last reset
            const now = new Date()
            let shouldReset = false

            if (lastReset) {
                const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
                if (hoursSinceReset >= 24) {
                    shouldReset = true
                }
            }

            if (shouldReset) {
                // Reset the counter
                await statsRef.set({
                    userId,
                    operationCount: 0,
                    lastReset: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                used = 0
            }

            tierStatus.free.available = used < FREE_LIMIT
            tierStatus.free.used = used
            tierStatus.free.limit = FREE_LIMIT
            tierStatus.free.remaining = Math.max(0, FREE_LIMIT - used)

            // Calculate reset time (24 hours from last reset)
            if (lastReset && !shouldReset) {
                const resetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000)
                tierStatus.free.resetsAt = resetTime.toISOString()
            }
        }

        // OAuth status - Removed Clerk dependency
        // In this implementation, we don't assume OAuth capabilities for Gemini directly
        // tierStatus.oauth remains unavailable by default


        // Check personal API keys
        try {
            const keysDoc = await db.collection('apiKeys').doc(userId).get()

            if (keysDoc.exists) {
                const data = keysDoc.data()

                if (data?.geminiKey) {
                    try {
                        decryptText(data.geminiKey) // Just verify it's valid
                        tierStatus.personalKey.hasGemini = true
                        tierStatus.personalKey.available = true
                    } catch { }
                }

                if (data?.claudeKey) {
                    try {
                        decryptText(data.claudeKey)
                        tierStatus.personalKey.hasClaude = true
                        tierStatus.personalKey.available = true
                    } catch { }
                }
            }
        } catch (e) {
            console.log('API key check failed:', e)
        }

        // Determine active tier (priority order)
        if (tierStatus.free.available && hasServerKey) {
            tierStatus.activeTier = 'free'
        } else if (tierStatus.oauth.available && tierStatus.oauth.hasGeminiScope) {
            tierStatus.activeTier = 'oauth'
        } else if (tierStatus.personalKey.available) {
            tierStatus.activeTier = 'personal_key'
        } else {
            tierStatus.activeTier = 'none'
        }

        // Generate recommendation
        if (tierStatus.activeTier === 'none') {
            tierStatus.recommendation = 'Add your Gemini or Claude API key in Settings to use AI features.'
        } else if (tierStatus.activeTier === 'free' && tierStatus.free.remaining <= 2) {
            tierStatus.recommendation = `Only ${tierStatus.free.remaining} free uses left. Consider adding your own API key for unlimited access.`
        } else if (tierStatus.activeTier === 'free') {
            tierStatus.recommendation = `You have ${tierStatus.free.remaining} free AI generations remaining today.`
        } else if (tierStatus.activeTier === 'oauth') {
            tierStatus.recommendation = 'Using your Google account for Gemini AI access.'
        } else {
            tierStatus.recommendation = 'Using your personal API key for unlimited AI access.'
        }

        return NextResponse.json(tierStatus)
    } catch (error: any) {
        console.error('Error fetching tier status:', error)
        return NextResponse.json({ error: error.message || 'server_error' }, { status: 500 })
    }
}
