import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

/**
 * Get the current user's Google OAuth access token from Clerk
 * This enables using their Google account for Gemini API access
 */
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
        }

        const client = await clerkClient()

        // Get the user's OAuth access tokens
        const tokens = await client.users.getUserOauthAccessToken(userId, 'google')

        if (!tokens || tokens.data.length === 0) {
            return NextResponse.json({
                hasGoogleOAuth: false,
                message: 'User has not connected Google account with required scopes'
            })
        }

        const googleToken = tokens.data[0]

        // Check if token has the required scopes for Gemini API
        // The Generative Language API requires specific scopes
        const requiredScopes = ['https://www.googleapis.com/auth/generative-language']
        const hasRequiredScopes = requiredScopes.some(scope =>
            googleToken.scopes?.includes(scope)
        )

        return NextResponse.json({
            hasGoogleOAuth: true,
            accessToken: googleToken.token,
            expiresAt: googleToken.externalAccountId, // Clerk doesn't expose expiry directly
            scopes: googleToken.scopes,
            hasGeminiScope: hasRequiredScopes,
            provider: 'google'
        })
    } catch (error: any) {
        console.error('Error fetching Google OAuth token:', error)

        // Handle specific Clerk errors
        if (error.message?.includes('OAuth')) {
            return NextResponse.json({
                hasGoogleOAuth: false,
                message: 'Google OAuth not configured or user not connected'
            })
        }

        return NextResponse.json({ error: error.message || 'server_error' }, { status: 500 })
    }
}
