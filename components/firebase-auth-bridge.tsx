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
                    // This requires the 'firebase' JWT template to be set up in Clerk Dashboard
                    const token = await getToken({ template: "firebase" })
                    if (token) {
                        await signInWithCustomToken(firebaseAuth, token)
                        console.log("Firebase authenticated via Clerk")
                    }
                } catch (error) {
                    console.error("Error syncing Clerk auth with Firebase:", error)
                }
            }
        }

        syncAuth()
    }, [isSignedIn, getToken])

    return null
}
