
export async function refreshGoogleAccessToken(refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error('Missing Google OAuth client credentials')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText} - ${errorBody}`)
    }

    return response.json()
}
