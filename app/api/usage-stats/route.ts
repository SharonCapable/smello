import { NextResponse } from 'next/server'
import admin, { initAdmin } from '@/lib/firebase-admin'
import { auth } from '@clerk/nextjs/server'

/**
 * Reset AI usage stats for the current user
 * POST to reset your own usage counter (for testing)
 */
export async function POST() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()
        const statsRef = db.collection('usageStats').doc(userId)

        await statsRef.set({
            userId,
            operationCount: 0,
            lastReset: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })

        return NextResponse.json({
            success: true,
            message: 'Usage stats reset successfully. You now have 6 free generations.'
        })
    } catch (error: any) {
        console.error('Error resetting usage stats:', error)
        return NextResponse.json({ error: error.message || 'server_error' }, { status: 500 })
    }
}

/**
 * GET current usage stats
 */
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()
        const statsRef = db.collection('usageStats').doc(userId)
        const statsSnap = await statsRef.get()

        const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)

        if (!statsSnap.exists) {
            return NextResponse.json({
                used: 0,
                limit: FREE_LIMIT,
                remaining: FREE_LIMIT,
                lastReset: null
            })
        }

        const data = statsSnap.data()
        const used = data?.operationCount || 0

        return NextResponse.json({
            used,
            limit: FREE_LIMIT,
            remaining: Math.max(0, FREE_LIMIT - used),
            lastReset: data?.lastReset?.toDate()?.toISOString() || null,
            updatedAt: data?.updatedAt?.toDate()?.toISOString() || null
        })
    } catch (error: any) {
        console.error('Error fetching usage stats:', error)
        return NextResponse.json({ error: error.message || 'server_error' }, { status: 500 })
    }
}
