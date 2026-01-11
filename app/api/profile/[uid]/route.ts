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

export async function GET(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    initAdmin()

    // Validate session and ensure requester is the same user
    const sessionUid = await getSessionUid()
    if (!sessionUid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    const { uid } = await params;
    if (!uid) {
      console.error('Profile API error: UID is missing from params');
      return NextResponse.json({ error: 'missing_uid' }, { status: 400 })
    }

    if (uid !== sessionUid) {
      // Allow if admin? For now strict ownership.
      console.error(`Profile API error: Forbidden. Session UID: ${sessionUid}, Param UID: ${uid}`);
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const db = admin.firestore()
    const doc = await db.collection('users').doc(uid).get()

    // Also fetch usage stats to keep UI in sync
    const statsDoc = await db.collection('usageStats').doc(uid).get()
    const usageCount = statsDoc.exists ? (statsDoc.data()?.operationCount || 0) : 0
    const usageLimit = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)

    if (!doc.exists) {
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

export async function POST(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    initAdmin()
    const { uid: _uid } = await params; // Await params for compatibility

    const sessionUid = await getSessionUid()
    if (!sessionUid) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // Use session-derived uid for writes; ignore supplied param to prevent impersonation
    const uid = sessionUid

    const body = await req.json()
    // Whitelist allowed fields
    const allowed: Record<string, any> = {}
    const keys = ['email', 'name', 'displayName', 'photoURL', 'role', 'selectedPath', 'onboardingCompleted', 'organizationId', 'teamId', 'organizationName']
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
