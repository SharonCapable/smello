"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Loader2 } from "lucide-react"

interface OnboardingData {
    name: string
    role: string
    usageType: "personal" | "team"
}

export default function OnboardingPage() {
    const { user, isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            if (!isLoaded) return

            if (!isSignedIn) {
                // Redirect to home if not authenticated
                router.push("/")
                return
            }

            if (user) {
                try {
                    const uid = user.id
                    if (uid) {
                        const res = await fetch(`/api/profile/${uid}`)
                        if (res.ok) {
                            const userProfile = await res.json()

                            if (userProfile?.onboardingCompleted) {
                                // Already completed onboarding, redirect to app
                                router.push("/")
                                return
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking onboarding status:", error)
                }

                setIsChecking(false)
            }
        }

        checkOnboardingStatus()
    }, [user, isLoaded, isSignedIn, router])

    const handleOnboardingComplete = async (data: OnboardingData) => {
        if (!user) return

        try {
            const uid = user.id

            if (uid) {
                // Update user profile with onboarding data via server-side API (firebase-admin)
                await fetch(`/api/profile/${uid}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.primaryEmailAddress?.emailAddress || '',
                        name: data.name,
                        displayName: data.name,
                        photoURL: user.imageUrl || '',
                        role: data.role,
                        selectedPath: data.usageType === "personal" ? "pm" : "team",
                        onboardingCompleted: true,
                    }),
                })

                // Clear any temporary onboarding data from localStorage
                localStorage.removeItem("smello-onboarding-temp")

                // Save permanent onboarding data so the home page knows state
                const permanentData = {
                    name: data.name,
                    role: data.role,
                    usageType: data.usageType
                }
                localStorage.setItem("smello-user-onboarding", JSON.stringify(permanentData))

                // Redirect to home (app/page.tsx handles the dashboard view)
                router.push("/")
            }
        } catch (error) {
            console.error("Error completing onboarding:", error)
        }
    }

    const handleBack = () => {
        router.push("/")
    }

    if (!isLoaded || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <OnboardingFlow
            onComplete={handleOnboardingComplete}
            isAuthenticated={isSignedIn}
            onBack={handleBack}
        />
    )
}
