import { NextResponse } from 'next/server'
import admin, { initAdmin, adminAuth } from '@/lib/firebase-admin'
import { headers } from 'next/headers'
import { encryptText, decryptText } from '@/lib/crypto'

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
    initAdmin()
    const uid = await getSessionUid()
    if (!uid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const db = admin.firestore()
    const doc = await db.collection('apiKeys').doc(uid).get()
    if (!doc.exists) return NextResponse.json({}, { status: 200 })

    const data = doc.data() as any
    const result: any = {}
    if (data.geminiKey) {
      try { result.geminiKey = decryptText(data.geminiKey) } catch { result.geminiKey = undefined }
    }
    if (data.claudeKey) {
      try { result.claudeKey = decryptText(data.claudeKey) } catch { result.claudeKey = undefined }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (e: any) {
    console.error('api/keys GET error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    initAdmin()
    const uid = await getSessionUid()
    if (!uid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const body = await req.json()
    const allowed: any = {}
    if (body.geminiKey) allowed.geminiKey = encryptText(String(body.geminiKey))
    if (body.claudeKey) allowed.claudeKey = encryptText(String(body.claudeKey))

    if (Object.keys(allowed).length === 0) return NextResponse.json({ error: 'missing_keys' }, { status: 400 })

    const db = admin.firestore()
    await db.collection('apiKeys').doc(uid).set({ ...allowed, userId: uid, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('api/keys POST error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    initAdmin()
    const uid = await getSessionUid()
    if (!uid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const db = admin.firestore()
    await db.collection('apiKeys').doc(uid).delete()

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('api/keys DELETE error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
