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

export async function POST(req: Request, { params }: { params: { uid: string } }) {
  try {
    initAdmin()
    const uid = params.uid
    if (!uid) return NextResponse.json({ error: 'missing_uid' }, { status: 400 })

    const body = await req.json()
    const db = admin.firestore()

    const payload = {
      ...body,
      uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const userRef = db.collection('users').doc(uid)
    const doc = await userRef.get()
    if (doc.exists) {
      await userRef.update(payload)
    } else {
      await userRef.set({
        ...payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('profile POST api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
