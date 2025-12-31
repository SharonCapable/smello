"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { signInWithCustomToken } from "firebase/auth"
import { auth as firebaseAuth } from "@/lib/firebase"

export function FirebaseAuthBridge() {
    const { getToken, isSignedIn } = useAuth()

    useEffect(() => {
        const syncAuth = async () => {
            if (isSignedIn && firebaseAuth) {
                try {
                    // 1. Fetch the real Firebase Custom Token from our backend
                    const response = await fetch('/api/auth/firebase-token')
                    const { token, error } = await response.json()

                    if (error) throw new Error(error)

                    if (token) {
                        console.log("Attempting Firebase sign-in with real custom token")
                        await signInWithCustomToken(firebaseAuth, token)
                        console.log("Firebase authenticated successfully")
                    } else {
                        console.warn("No token received from exchange API")
                    }
                } catch (error: any) {
                    console.error("Error syncing auth:", error)
                }
            }
        }

        syncAuth()
    }, [isSignedIn, getToken])

    return null
}
