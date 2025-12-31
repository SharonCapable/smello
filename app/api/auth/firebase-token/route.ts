import { NextResponse } from 'next/server'
import { auth as clerkAuth } from '@clerk/nextjs/server'
import { adminAuth, initAdmin } from '@/lib/firebase-admin'

export async function GET() {
    try {
        const { userId } = await clerkAuth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        initAdmin()

        // Mint a REAL Firebase Custom Token signed by your service account
        const firebaseToken = await adminAuth().createCustomToken(userId)

        return NextResponse.json({ token: firebaseToken })
    } catch (error: any) {
        console.error('Error minting Firebase token:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
