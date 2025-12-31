import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import admin, { initAdmin } from '@/lib/firebase-admin'

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
