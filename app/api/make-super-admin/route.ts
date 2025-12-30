import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import admin from 'firebase-admin'

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
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()
        const db = admin.firestore()
        const userRef = db.collection('users').doc(userId)
        const userSnap = await userRef.get()

        if (userSnap.exists) {
            const userData = userSnap.data()
            return NextResponse.json({
                userId,
                isSuperAdmin: userData?.isSuperAdmin || false,
                exists: true
            })
        } else {
            return NextResponse.json({
                userId,
                isSuperAdmin: false,
                exists: false,
                message: 'User document does not exist yet. POST to this endpoint to create it and become super admin.'
            })
        }
    } catch (e: any) {
        console.error('check-super-admin error', e)
        return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
    }
}
