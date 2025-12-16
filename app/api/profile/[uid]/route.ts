import { NextResponse } from 'next/server'
import admin from 'firebase-admin'

function initAdmin() {
  if (admin.apps && admin.apps.length) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) })
}

export async function GET(_req: Request, { params }: { params: { uid: string } }) {
  try {
    initAdmin()
    const uid = params.uid
    if (!uid) return NextResponse.json({ error: 'missing_uid' }, { status: 400 })

    const db = admin.firestore()
    const doc = await db.collection('users').doc(uid).get()
    if (!doc.exists) return NextResponse.json(null)
    return NextResponse.json(doc.data())
  } catch (e: any) {
    console.error('profile api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
