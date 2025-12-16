"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useEffect } from "react"
import { createOrUpdateUserProfile } from "@/lib/firestore-service"

function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    useEffect(() => {
        // Sync user profile to Firestore when authenticated
        if (status === "authenticated" && session?.user) {
            const syncUserProfile = async () => {
                try {
                    const uid = (session.user as any).uid || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')

                    if (uid) {
                        await createOrUpdateUserProfile(uid, {
                            uid,
                            email: session.user.email || '',
                            name: session.user.name || '',
                            displayName: session.user.name || '',
                            photoURL: session.user.image || '',
                            onboardingCompleted: false, // Will be updated during onboarding
                        })
                    }
                } catch (error) {
                    console.error('Error syncing user profile:', error)
                }
            }

            syncUserProfile()
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
