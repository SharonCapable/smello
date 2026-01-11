import { NextResponse } from 'next/server'
import admin, { initAdmin, adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'

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

export async function POST() {
    try {
        const userId = await getSessionUid()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()
        const statsRef = db.collection('usageStats').doc(userId)

        // Reset the usage counter
        await statsRef.set({
            userId: userId,
            operationCount: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })

        return NextResponse.json({
            success: true,
            message: 'Usage counter reset successfully',
            userId
        })
    } catch (e: any) {
        console.error('reset-usage error', e)
        return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const userId = await getSessionUid()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()
        const statsRef = db.collection('usageStats').doc(userId)
        const statsSnap = await statsRef.get()

        const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
        const current = statsSnap.exists ? (statsSnap.data()?.operationCount || 0) : 0

        return NextResponse.json({
            userId,
            currentUsage: current,
            freeLimit: FREE_LIMIT,
            remaining: Math.max(0, FREE_LIMIT - current),
            limitExceeded: current >= FREE_LIMIT
        })
    } catch (e: any) {
        console.error('get-usage error', e)
        return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
    }
}
