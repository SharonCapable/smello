"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Loader2 } from "lucide-react"

interface OnboardingData {
    name: string
    role: string
    usageType: "personal" | "team"
}

export default function OnboardingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            if (status === "loading") return

            if (status === "unauthenticated") {
                // Redirect to home if not authenticated
                router.push("/")
                return
            }

            if (session?.user) {
                try {
                    const uid = (session.user as any).uid || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')
                    if (uid) {
                        const res = await fetch(`/api/profile/${uid}`)
                        if (res.ok) {
                            const userProfile = await res.json()

                            if (userProfile?.onboardingCompleted) {
                                // Already completed onboarding, redirect to app
                                if (userProfile.selectedPath === "team") {
                                    router.push("/teams")
                                } else {
                                    router.push("/desktop")
                                }
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
    }, [session, status, router])

    const handleOnboardingComplete = async (data: OnboardingData) => {
        if (!session?.user) return

        try {
            const uid = (session.user as any).uid || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')

            if (uid) {
                // Update user profile with onboarding data via server-side API (firebase-admin)
                await fetch(`/api/profile/${uid}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: session.user.email || '',
                        name: data.name,
                        displayName: data.name,
                        photoURL: session.user.image || '',
                        role: data.role,
                        selectedPath: data.usageType === "personal" ? "pm" : "team",
                        onboardingCompleted: true,
                    }),
                })

                // Clear any temporary onboarding data from localStorage
                localStorage.removeItem("smello-onboarding-temp")

                // Redirect to appropriate app section
                if (data.usageType === "team") {
                    router.push("/teams")
                } else {
                    router.push("/desktop")
                }
            }
        } catch (error) {
            console.error("Error completing onboarding:", error)
        }
    }

    const handleBack = () => {
        router.push("/")
    }

    if (status === "loading" || isChecking) {
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
            isAuthenticated={status === "authenticated"}
            onBack={handleBack}
        />
    )
}
