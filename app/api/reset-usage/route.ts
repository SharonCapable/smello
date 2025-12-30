import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { auth } from '@clerk/nextjs/server'

function initAdmin() {
    if (admin.apps && admin.apps.length) return
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
    const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) })
}

export async function POST() {
    try {
        const { userId } = await auth()
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
        const { userId } = await auth()
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
