"use client"

"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { ApiKeyManager } from '@/lib/api-key-manager'

function AuthSync({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn } = useUser()

    useEffect(() => {
        // Sync user profile to Firestore when authenticated
        if (isLoaded && isSignedIn && user) {
            const syncUserProfile = async () => {
                try {
                    const uid = user.id
                    const email = user.primaryEmailAddress?.emailAddress

                    if (uid) {
                        try {
                            await fetch(`/api/profile/${uid}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    uid,
                                    email: email || '',
                                    name: user.fullName || '',
                                    displayName: user.fullName || '',
                                    photoURL: user.imageUrl || '',
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
                ApiKeyManager.loadServerKeys().catch(() => { })
            } catch (e) {
                // ignore
            }
        }
    }, [user, isLoaded, isSignedIn])

    return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthSync>{children}</AuthSync>
    )
}
