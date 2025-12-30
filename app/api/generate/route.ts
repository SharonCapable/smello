import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { auth } from '@clerk/nextjs/server'
import { decryptText } from '@/lib/crypto'
import { refreshGoogleAccessToken } from '@/lib/oauth'

function initAdmin() {
  if (admin.apps && admin.apps.length) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) })
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
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

    // Attempt to extract meaningful user ID, fallback to email or something stable. 
    // If we can't get a user ID, we can't enforce personalized limits properly, 
    // but blocking them might be worse. Let's try best effort.
    const sessionUid = userId

    // Clerk's auth() does not directly provide sessionAccessToken, sessionRefreshToken, sessionExpiresAt.
    // These would typically come from a database lookup or a custom session management if needed with Clerk.
    // For now, setting them to null to avoid breaking existing logic that might rely on them being defined,
    // but the Google OAuth refresh logic will likely need to be re-evaluated or removed if these are not available.
    const sessionAccessToken = null
    const sessionRefreshToken = null
    const sessionExpiresAt = null

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

      let serverKeyLimitExceeded = false
      const envKey = process.env.GEMINI_API_KEY

      // 1. Try Server Key (with limit enforcement)
      if (envKey) {
        try {
          initAdmin()
          const db = admin.firestore()
          const statsRef = db.collection('usageStats').doc(sessionUid)
          const statsSnap = await statsRef.get()
          const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
          const current = statsSnap.exists ? (statsSnap.data()?.operationCount || 0) : 0

          if (current >= FREE_LIMIT) {
            console.log(`User ${sessionUid} exceeded free limit (server key skipped): ${current}/${FREE_LIMIT}`)
            serverKeyLimitExceeded = true
            // Don't return yet - try user's own keys first
          } else {
            // Increment and Use
            await statsRef.set({ userId: sessionUid, operationCount: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-goog-api-key': envKey },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
            })

            if (!response.ok) {
              // If server key fails for some API reason, maybe we shouldn't fallback? Or maybe we should?
              // For now, let's treat API failure as final if we attempted it.
              const errorData = await response.json().catch(() => ({}))
              return NextResponse.json({ error: errorData.error?.message || 'Gemini API Error' }, { status: response.status })
            }

            const data = await response.json()
            return NextResponse.json(data)
          }
        } catch (e: any) {
          console.error('generate gemini server-key error', e)
          // If error is internal system error, skip to next method
        }
      }

      // 2. OAuth Token (Gemini specific)
      // Only runs if server key was missing or limit exceeded

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

      // 3. Stored user key
      const storedKey = storedKeys?.geminiKey || null
      if (storedKey) {
        try {
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
        } catch (e: any) {
          console.error('generate gemini with stored key error', e)
          // Fallthrough to client key
        }
      }

      // 4. Fallback: client-provided key
      const apiKey = clientApiKey
      if (apiKey) {
        try {
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
        } catch (e: any) {
          console.error('generate gemini with client key error', e)
        }
      }

      // No API key available at all
      if (serverKeyLimitExceeded) {
        // User hit the free limit and has no personal API key configured
        const statsRef = admin.firestore().collection('usageStats').doc(sessionUid)
        const statsSnap = await statsRef.get()
        const current = statsSnap.exists ? (statsSnap.data()?.operationCount || 0) : 0
        const FREE_LIMIT = Number(process.env.FREE_AI_OPERATIONS_LIMIT || 6)
        return NextResponse.json({
          error: 'free_limit_exceeded',
          remaining: Math.max(0, FREE_LIMIT - current),
          message: 'Free trial limit exceeded. Please add your own API key in Settings to continue.'
        }, { status: 403 })
      } else {
        // No keys configured at all
        return NextResponse.json({
          error: 'missing_gemini_key',
          message: 'No Gemini API key configured. Please add your API key in Settings.'
        }, { status: 500 })
      }
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
            body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
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
          body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
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
        body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }),
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
