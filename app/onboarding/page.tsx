"use client"

import { useEffect, useState, Suspense } from "react"
import { useUser } from "@clerk/nextjs"
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
    const { user, isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const isEditMode = searchParams.get("mode") === "edit"

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
                    const uid = user.id
                    if (uid) {
                        const res = await fetch(`/api/profile/${uid}`)
                        if (res.ok) {
                            const userProfile = await res.json()

                            // If in edit mode, populate initial data
                            if (isEditMode && userProfile) {
                                setInitialData({
                                    name: userProfile.name || user.fullName || "",
                                    role: userProfile.role || "",
                                    usageType: userProfile.selectedPath === "team" ? "team" : "personal"
                                    // productDescription isn't stored in profile currently, but could be added if needed
                                })
                            }
                            // Only redirect if NOT in edit mode and onboarding is already completed
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
    }, [user, isLoaded, isSignedIn, router, isEditMode])

    const handleOnboardingComplete = async (data: OnboardingData) => {
        if (!user) return

        try {
            const uid = user.id

            if (uid) {
                // Update user profile with onboarding data via server-side API
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

                // Redirect to home or show success message
                if (isEditMode) {
                    // Use replace to prevent back-button loop
                    router.replace("/settings")
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
