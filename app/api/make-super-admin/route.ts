import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import admin, { initAdmin, adminAuth } from '@/lib/firebase-admin'

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
        const userRef = db.collection('users').doc(userId)

        // Set user as super admin
        await userRef.set({
            isSuperAdmin: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })

        return NextResponse.json({
            success: true,
            message: 'You are now a super admin!',
            userId
        })
    } catch (e: any) {
        console.error('make-super-admin error', e)
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
        const userRef = db.collection('users').doc(userId)

        // Just set the status regardless of existence to make it easy
        await userRef.set({
            isSuperAdmin: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })

        return NextResponse.json({
            success: true,
            message: 'You are now a super admin (via GET)!',
            userId,
            isSuperAdmin: true
        })
    } catch (e: any) {
        console.error('make-super-admin GET error', e)
        return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
    }
}
