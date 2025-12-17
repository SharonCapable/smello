import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { decryptText } from '@/lib/crypto'
import { refreshGoogleAccessToken } from '@/lib/oauth'

function initAdmin() {
  if (admin.apps && admin.apps.length) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) })
}

async function getSession() {
  try {
    return await getServerSession(authOptions as any)
  } catch (e) {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { provider, prompt, model, apiKey: clientApiKey } = body

    if (!provider || !prompt) return NextResponse.json({ error: 'missing_parameters' }, { status: 400 })

    // Attempt to resolve per-provider API key following priority:
    // 1) Server env key
    // 2) Authenticated user's Google OAuth access token (for Gemini)
    // 3) Per-user stored API key in Firestore (apiKeys collection)
    // 4) Client-provided key

    // Get session (require sign-in for generation)
    // Get session (require sign-in for generation)
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // Attempt to extract meaningful user ID, fallback to email or something stable. 
    // If we can't get a user ID, we can't enforce personalized limits properly, 
    // but blocking them might be worse. Let's try best effort.
    const sessionUser = (session as any).user || session.user
    const sessionUid = sessionUser?.uid || sessionUser?.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown_user'

    const sessionAccessToken = (session as any).accessToken || null
    const sessionRefreshToken = (session as any).refreshToken || null
    const sessionExpiresAt = (session as any).expiresAt || null

    // If user is authenticated we can attempt to fetch their stored keys
    let storedKeys: { geminiKey?: string; claudeKey?: string } | null = null
    if (sessionUid) {
      try {
        initAdmin()
        const db = admin.firestore()
        const doc = await db.collection('apiKeys').doc(sessionUid).get()
        if (doc.exists) {
          const d = doc.data() as any
          storedKeys = {
            geminiKey: d.geminiKey ? decryptText(d.geminiKey) : undefined,
            claudeKey: d.claudeKey ? decryptText(d.claudeKey) : undefined,
          }
        }
      } catch (e) {
        console.warn('failed to read stored api keys', e)
      }
    }

    if (provider === 'gemini') {
      // priority: process.env -> session.accessToken (bearer) -> storedKeys.geminiKey -> clientApiKey
      const envKey = process.env.GEMINI_API_KEY
      // If we'll use the server env key, enforce per-user free-operation limit
      if (envKey) {
        try {
          initAdmin()
          const db = admin.firestore()
          const statsRef = db.collection('usageStats').doc(sessionUid)
          const statsSnap = await statsRef.get()
          const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
          const current = statsSnap.exists ? (statsSnap.data()?.operationCount || 0) : 0
          if (current >= FREE_LIMIT) {
            console.log(`User ${sessionUid} exceeded free limit: ${current}/${FREE_LIMIT}`)
            return NextResponse.json({ error: 'free_limit_exceeded', remaining: 0 }, { status: 403 })
          }
          // increment counter by one for this generation action
          await statsRef.set({ userId: sessionUid, operationCount: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': envKey },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json({ error: errorData.error?.message || 'Gemini API Error' }, { status: response.status })
          }

          const data = await response.json()
          return NextResponse.json(data)
        } catch (e: any) {
          console.error('generate gemini server-key error', e)
          return NextResponse.json({ error: 'server_error' }, { status: 500 })
        }
      }

      // Use user's Google OAuth access token if available. If expired, attempt refresh with stored refresh token.
      if (sessionAccessToken) {
        let accessTokenToUse = sessionAccessToken
        try {
          const now = Math.floor(Date.now() / 1000)
          if (sessionExpiresAt && Number(sessionExpiresAt) <= now && sessionRefreshToken) {
            try {
              const refreshed = await refreshGoogleAccessToken(sessionRefreshToken)
              accessTokenToUse = refreshed.access_token
            } catch (e) {
              console.warn('google refresh failed', e)
            }
          }

          const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessTokenToUse}` },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json({ error: errorData.error?.message || 'Gemini API Error' }, { status: response.status })
          }

          const data = await response.json()
          return NextResponse.json(data)
        } catch (e: any) {
          console.error('generate gemini with oauth error', e)
          // Fallthrough to next key sources (stored key / client key)
        }
      }

      // Stored user key
      const storedKey = storedKeys?.geminiKey || null
      if (storedKey) {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': storedKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          return NextResponse.json({ error: errorData.error?.message || 'Gemini API Error' }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
      }

      // Fallback: client-provided key
      const apiKey = clientApiKey
      if (!apiKey) return NextResponse.json({ error: 'server_missing_gemini_key' }, { status: 500 })

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json({ error: errorData.error?.message || 'Gemini API Error' }, { status: response.status })
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    if (provider === 'anthropic') {
      // priority: process.env -> stored user key -> client provided
      const envKey = process.env.CLAUDE_API_KEY
      const storedKey = storedKeys?.claudeKey || null

      // If using server env key, enforce per-user free-operation limit
      if (envKey) {
        try {
          initAdmin()
          const db = admin.firestore()
          const statsRef = db.collection('usageStats').doc(sessionUid)
          const statsSnap = await statsRef.get()
          const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
          const current = statsSnap.exists ? (statsSnap.data()?.operationCount || 0) : 0
          if (current >= FREE_LIMIT) {
            return NextResponse.json({ error: 'free_limit_exceeded', remaining: 0 }, { status: 403 })
          }
          // increment counter by one for this generation action
          await statsRef.set({ userId: sessionUid, operationCount: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': envKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({ model: model || 'claude-sonnet-4-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json({ error: errorData.error?.message || 'Claude API Error' }, { status: response.status })
          }

          const data = await response.json()
          return NextResponse.json(data)
        } catch (e: any) {
          console.error('generate anthropic server-key error', e)
          return NextResponse.json({ error: 'server_error' }, { status: 500 })
        }
      }

      // Stored user key
      if (storedKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': storedKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({ model: model || 'claude-sonnet-4-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          return NextResponse.json({ error: errorData.error?.message || 'Claude API Error' }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
      }

      // Fallback: client-provided key
      const apiKey = clientApiKey
      if (!apiKey) return NextResponse.json({ error: 'server_missing_claude_key' }, { status: 500 })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: model || 'claude-sonnet-4-5', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json({ error: errorData.error?.message || 'Claude API Error' }, { status: response.status })
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'unsupported_provider' }, { status: 400 })
  } catch (e: any) {
    console.error('generate api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
