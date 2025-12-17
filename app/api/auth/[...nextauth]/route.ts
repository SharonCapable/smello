import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    // Request access to Google AI services
                    scope: "openid email profile https://www.googleapis.com/auth/generative-language.retriever",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            // This runs on successful sign-in
            // We'll create/update user profile in Firestore on client side
            return true
        },
        async jwt({ token, account, profile, user }: any) {
            // Persist the OAuth access_token and user ID to the token right after signin
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
            }
            if (user) {
                token.uid = user.id
            }
            return token
        },
        async session({ session, token }: any) {
            // Send properties to the client
            session.accessToken = token.accessToken
            session.refreshToken = token.refreshToken
            session.expiresAt = token.expiresAt
            session.user.uid = token.uid || token.sub // Use sub as fallback (NextAuth's default user ID)
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    // Events for analytics/monitoring can be added here without logging sensitive data
    events: {},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
