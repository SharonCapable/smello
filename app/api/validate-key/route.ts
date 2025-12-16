import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { provider, apiKey } = await req.json()

        if (!apiKey) {
            return NextResponse.json({ valid: false, error: "API key is required" }, { status: 400 })
        }

        if (provider === "gemini") {
            // Validate Gemini Key by making a small generation request using header-based API key
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Validate key" }] }],
                        generationConfig: { temperature: 0.0, maxOutputTokens: 1 },
                    }),
                }
            )

            if (response.ok) {
                return NextResponse.json({ valid: true })
            } else {
                const data = await response.json().catch(() => ({}))
                return NextResponse.json({ valid: false, error: data.error?.message || "Invalid Gemini API key" })
            }
        } else if (provider === "anthropic") {
            // Validate Claude Key
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1,
                    messages: [{ role: "user", content: "Hi" }],
                }),
            })

            if (response.ok) {
                return NextResponse.json({ valid: true })
            } else {
                const data = await response.json().catch(() => ({}))
                return NextResponse.json({ valid: false, error: data.error?.message || "Invalid Claude API key" })
            }
        } else {
            return NextResponse.json({ valid: false, error: "Invalid provider" }, { status: 400 })
        }
    } catch (error) {
        console.error("API Key Validation Error:", error)
        return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 })
    }
}
