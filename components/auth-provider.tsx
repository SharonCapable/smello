"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"
import { ApiKeyManager } from '@/lib/api-key-manager'
// Use server-side profile API to avoid client Firestore permission issues

function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    useEffect(() => {
        // Sync user profile to Firestore when authenticated
        if (status === "authenticated" && session?.user) {
            const syncUserProfile = async () => {
                try {
                    const uid = (session.user as any).uid || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')

                    if (uid) {
                        // Persist basic profile server-side via admin SDK
                        try {
                            await fetch(`/api/profile/${uid}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    uid,
                                    email: session.user.email || '',
                                    name: session.user.name || '',
                                    displayName: session.user.name || '',
                                    photoURL: session.user.image || '',
                                    onboardingCompleted: false,
                                }),
                            })
                        } catch (e) {
                            console.error('Error syncing user profile to server API:', e)
                        }
                    }
                } catch (error) {
                    console.error('Error syncing user profile:', error)
                }
            }

            syncUserProfile()
            // Load server-stored API keys into local storage when user signs in
            try {
                ApiKeyManager.loadServerKeys().catch(() => {})
            } catch (e) {
                // ignore
            }
        }
    }, [session, status])

    return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthSync>{children}</AuthSync>
        </SessionProvider>
    )
}
