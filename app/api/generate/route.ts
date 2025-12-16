import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { provider, prompt, model, apiKey: clientApiKey } = body

    if (!provider || !prompt) return NextResponse.json({ error: 'missing_parameters' }, { status: 400 })

    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'server_missing_gemini_key' }, { status: 500 })

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } }),
      })

      const data = await response.json()
      return NextResponse.json(data)
    }

    if (provider === 'anthropic') {
      const apiKey = process.env.CLAUDE_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'server_missing_claude_key' }, { status: 500 })

      const response = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ model: model || 'claude-3-haiku-20240307', prompt }),
      })

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'unsupported_provider' }, { status: 400 })
  } catch (e: any) {
    console.error('generate api error', e)
    return NextResponse.json({ error: e.message || 'server_error' }, { status: 500 })
  }
}
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { provider, prompt, model, apiKey } = await req.json()

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 })
        }

        if (provider === "anthropic") {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    model: model || "claude-sonnet-4-5",
                    max_tokens: 4096,
                    messages: [{ role: "user", content: prompt }],
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return NextResponse.json({ error: errorData.error?.message || "Claude API Error" }, { status: response.status })
            }

            const data = await response.json()
            return NextResponse.json({ text: data.content[0].text })
        }

        if (provider === "gemini") {
            // Use x-goog-api-key header instead of query param for better security
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apiKey
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7 }
                    }),
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return NextResponse.json({ error: errorData.error?.message || "Gemini API Error" }, { status: response.status })
            }

            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            return NextResponse.json({ text })
        }

        return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    } catch (error) {
        // Log error without exposing sensitive data
        console.error("Generation API Error:", error instanceof Error ? error.message : "Unknown error")
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
