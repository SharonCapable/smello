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

async function getSessionUid() {
  const { userId } = await auth()
  return userId || null
}

export async function GET(_req: Request, { params }: { params: { uid: string } }) {
  try {
    initAdmin()

    // Validate session and ensure requester is the same user
    const sessionUid = await getSessionUid()
    if (!sessionUid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const uid = params.uid
    if (!uid) return NextResponse.json({ error: 'missing_uid' }, { status: 400 })
    if (uid !== sessionUid) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const db = admin.firestore()
    const doc = await db.collection('users').doc(uid).get()

    // Also fetch usage stats to keep UI in sync
    const statsDoc = await db.collection('usageStats').doc(uid).get()
    const usageCount = statsDoc.exists ? (statsDoc.data()?.operationCount || 0) : 0
    const usageLimit = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)

    if (!doc.exists) {
      // Even if user doc doesn't exist, might be useful to return partial info or null?
      // Existing behavior returns null. Let's keep it null for now or return a basic structure if needed? 
      // Returning null forces client to handle "no profile". 
      return NextResponse.json(null)
    }

    return NextResponse.json({
      ...doc.data(),
      usageCount,
      usageLimit
    })
  } catch (e: any) {
    console.error('profile api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { uid: string } }) {
  try {
    initAdmin()

    const sessionUid = await getSessionUid()
    if (!sessionUid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // Use session-derived uid for writes; ignore supplied param to prevent impersonation
    const uid = sessionUid

    const body = await req.json()
    // Whitelist allowed fields
    const allowed: Record<string, any> = {}
    const keys = ['email', 'name', 'displayName', 'photoURL', 'role', 'selectedPath', 'onboardingCompleted']
    for (const k of keys) {
      if (body[k] !== undefined) allowed[k] = body[k]
    }

    const db = admin.firestore()
    const userRef = db.collection('users').doc(uid)
    const doc = await userRef.get()

    const payload = {
      ...allowed,
      uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (doc.exists) {
      await userRef.update(payload)
    } else {
      // Set default onboardingCompleted to false for new users if not provided
      const newUserData: any = {
        ...payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      if (newUserData.onboardingCompleted === undefined) {
        newUserData.onboardingCompleted = false
      }
      await userRef.set(newUserData)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('profile POST api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
