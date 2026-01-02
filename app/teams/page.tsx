"use client"

import { useState, useEffect } from "react"
import { TeamDashboard } from "@/components/team-dashboard"
import { JoinOrganization } from "@/components/teams/join-organization"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function TeamsPage() {
    const { user, isLoaded, isSignedIn } = useUser()
    const router = useRouter()
    const [onboardingData, setOnboardingData] = useState<any>(null)
    const [isCheckingData, setIsCheckingData] = useState(true)

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
        setIsCheckingData(false)
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded || isCheckingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Redirecting to login...</p>
            </div>
        )
    }

    // User is signed in but hasn't joined an organization yet
    // Show the join organization search interface
    if (onboardingData && !onboardingData.organizationId) {
        const handleJoinSuccess = (orgId: string, teamId: string, orgName: string, teamName: string) => {
            // Update localStorage with organization data
            const updatedData = {
                ...onboardingData,
                usageType: "team",
                organizationId: orgId,
                teamId: teamId,
                organizationName: orgName,
                teamName: teamName
            }
            localStorage.setItem("smello-user-onboarding", JSON.stringify(updatedData))
            setOnboardingData(updatedData)

            // Also update the server profile
            if (user) {
                fetch(`/api/profile/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        selectedPath: "team",
                        organizationId: orgId,
                        teamId: teamId,
                        organizationName: orgName
                    }),
                }).catch(err => console.error("Failed to update profile:", err))
            }
        }

        const handleBackToPM = () => {
            // Switch back to PM mode
            const data = JSON.parse(localStorage.getItem("smello-user-onboarding") || "{}")
            data.usageType = "personal"
            localStorage.setItem("smello-user-onboarding", JSON.stringify(data))
            router.push("/")
        }

        return (
            <JoinOrganization
                onJoinSuccess={handleJoinSuccess}
                onBackToPM={handleBackToPM}
            />
        )
    }

    // User has an organization, show the Team Dashboard
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
