"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OnboardingData {
    name: string
    role: string
    usageType: "personal" | "team"
    productDescription?: string
    organizationId?: string
    teamId?: string
    organizationName?: string
}

function OnboardingContent() {
    const { user, isLoaded, isSignedIn } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const isEditMode = searchParams.get("mode") === "edit"
    const isTeamSetupMode = searchParams.get("mode") === "team-setup"

    const [isChecking, setIsChecking] = useState(true)
    const [initialData, setInitialData] = useState<Partial<OnboardingData>>({})

    useEffect(() => {
        const checkStatus = async () => {
            if (!isLoaded) return

            if (!isSignedIn) {
                router.push("/")
                return
            }

            if (user) {
                try {
                    const uid = user.uid
                    if (uid) {
                        const token = await user.getIdToken()
                        const res = await fetch(`/api/profile/${uid}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        if (res.ok) {
                            const userProfile = await res.json()

                            // If in team-setup mode, populate data and set to team mode
                            if (isTeamSetupMode && userProfile) {
                                setInitialData({
                                    name: userProfile.name || user.displayName || "",
                                    role: userProfile.role || "",
                                    usageType: "team" // Force team mode for this flow
                                })
                                // Don't redirect - let them complete team setup
                            }
                            // If in edit mode, populate initial data
                            else if (isEditMode && userProfile) {
                                setInitialData({
                                    name: userProfile.name || user.displayName || "",
                                    role: userProfile.role || "",
                                    usageType: userProfile.selectedPath === "team" ? "team" : "personal"
                                    // productDescription isn't stored in profile currently, but could be added if needed
                                })
                            }
                            // Only redirect if NOT in edit mode, NOT in team-setup mode, and onboarding is already completed
                            else if (userProfile?.onboardingCompleted) {
                                router.push("/")
                                return
                            }
                        }
                    }

                    // Also check for temporary onboarding data from before sign-in
                    const tempRaw = localStorage.getItem("smello-onboarding-temp")
                    if (tempRaw) {
                        const tempData = JSON.parse(tempRaw)
                        setInitialData(prev => ({ ...prev, ...tempData }))
                    }
                } catch (error) {
                    console.error("Error checking status:", error)
                }

                setIsChecking(false)
            }
        }

        checkStatus()
    }, [user, isLoaded, isSignedIn, router, isEditMode, isTeamSetupMode])

    const handleOnboardingComplete = async (data: OnboardingData) => {
        if (!user) return

        try {
            const uid = user.uid

            if (uid) {
                const token = await user.getIdToken()
                // Update user profile with onboarding data via server-side API
                await fetch(`/api/profile/${uid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: user.email || '',
                        name: data.name,
                        displayName: data.name,
                        photoURL: user.photoURL || '',
                        role: data.role,
                        selectedPath: data.usageType === "personal" ? "pm" : "team",
                        onboardingCompleted: true,
                        organizationId: data.organizationId,
                        teamId: data.teamId,
                        organizationName: data.organizationName
                    }),
                })

                // Clear temp data
                localStorage.removeItem("smello-onboarding-temp")

                // Save permanent onboarding data
                const permanentData = {
                    name: data.name,
                    role: data.role,
                    usageType: data.usageType,
                    organizationId: data.organizationId,
                    teamId: data.teamId,
                    organizationName: data.organizationName
                }
                localStorage.setItem("smello-user-onboarding", JSON.stringify(permanentData))

                // Redirect to appropriate destination
                if (isEditMode) {
                    // Use replace to prevent back-button loop
                    router.replace("/settings")
                } else if (isTeamSetupMode || data.usageType === "team") {
                    // After team setup, go to teams dashboard
                    router.replace("/teams")
                } else {
                    router.replace("/")
                }
            }
        } catch (error: any) {
            console.error("Error completing onboarding:", error)
            toast({
                title: "Profile Sync Error",
                description: error.message || "We couldn't sync your profile to the server.",
                variant: "destructive"
            })
        }
    }

    const handleBack = () => {
        if (isEditMode) {
            router.push("/settings")
        } else if (isTeamSetupMode) {
            // Go back to home (PM Tools) if canceling team setup
            router.push("/")
        } else {
            router.push("/")
        }
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
            initialData={initialData}
            isEditMode={isEditMode}
            initialStep={isTeamSetupMode ? 5 : undefined}
        />
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    )
}
