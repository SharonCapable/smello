"use client"

import { useState, useEffect } from "react"
import { TeamDashboard } from "@/components/team-dashboard"
import { useUser } from "@clerk/nextjs"
import { AppHeader } from "@/components/app-header"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { useRouter } from "next/navigation"

export default function TeamsPage() {
    const { user, isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [onboardingData, setOnboardingData] = useState<any>(null)

    useEffect(() => {
        const data = localStorage.getItem("smello-user-onboarding")
        if (data) {
            const parsed = JSON.parse(data)
            setOnboardingData(parsed)

            // Sync usageType to team if reaching this page
            if (parsed.usageType !== "team") {
                parsed.usageType = "team"
                localStorage.setItem("smello-user-onboarding", JSON.stringify(parsed))
            }
        } else if (isLoaded && !isSignedIn) {
            router.push("/")
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded) return null

    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Redirecting to login...</p>
            </div>
        )
    }

    if (onboardingData && !onboardingData.organizationId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold">Team Setup Required</h2>
                <p className="text-muted-foreground">You need to set up an organization before accessing the Team Dashboard.</p>
                <button
                    onClick={() => router.push("/onboarding")}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Complete Setup
                </button>
            </div>
        )
    }

    return (
        <TeamDashboard
            organizationId={onboardingData?.organizationId}
            teamId={onboardingData?.teamId}
            organizationName={onboardingData?.organizationName}
            onBack={() => {
                // Return to individual mode
                const data = JSON.parse(localStorage.getItem("smello-user-onboarding") || "{}")
                data.usageType = "personal"
                localStorage.setItem("smello-user-onboarding", JSON.stringify(data))
                window.location.href = "/"
            }}
        />
    )
}
