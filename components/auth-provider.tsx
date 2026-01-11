"use client"

"use client"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { ApiKeyManager } from '@/lib/api-key-manager'

// function AuthSync({ children }: { children: React.ReactNode }) {
//     const { user, isLoaded, isSignedIn } = useAuth()

//     useEffect(() => {
//         // Sync user profile to Firestore when authenticated
//         if (isLoaded && isSignedIn && user) {
//             const syncUserProfile = async () => {
//                 try {
//                     const uid = user.uid
//                     const email = user.email

//                     if (uid) {
//                         try {
//                             await fetch(`/api/profile/${uid}`, {
//                                 method: 'POST',
//                                 headers: { 'Content-Type': 'application/json' },
//                                 body: JSON.stringify({
//                                     uid,
//                                     email: email || '',
//                                     name: user.displayName || '',
//                                     displayName: user.displayName || '',
//                                     photoURL: user.photoURL || '',
//                                 }),
//                             })
//                         } catch (e) {
//                             console.error('Error syncing user profile to server API:', e)
//                         }
//                     }
//                 } catch (error) {
//                     console.error('Error syncing user profile:', error)
//                 }
//             }

//             syncUserProfile()
//             // Load server-stored API keys into local storage when user signs in
//             try {
//                 ApiKeyManager.loadServerKeys().catch(() => { })
//             } catch (e) {
//                 // ignore
//             }
//         }
//     }, [user, isLoaded, isSignedIn])

//     return <>{children}</>
// }

function AuthSync({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn } = useAuth()

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            const syncUserProfile = async () => {
                try {
                    const uid = user.uid
                    const email = user.email

                    if (uid) {
                        const token = await user.getIdToken()
                        await fetch(`/api/profile/${uid}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                uid,
                                email: email || '',
                                name: user.displayName || '',
                                displayName: user.displayName || '',
                                photoURL: user.photoURL || '',
                            }),
                        })
                    }
                } catch (error) {
                    console.error('Error syncing user profile:', error)
                }
            }

            syncUserProfile()
            try {
                user.getIdToken().then(token => {
                    ApiKeyManager.loadServerKeys(token).catch(() => { })
                })
            } catch (e) { }
        }
    }, [user, isLoaded, isSignedIn])

    return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthSync>{children}</AuthSync>
    )
}
