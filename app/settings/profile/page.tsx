"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Briefcase, ArrowLeft, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function ProfilePage() {
    const router = useRouter()
    const { user } = useUser()
    const [profileData, setProfileData] = useState<any>(null)

    useEffect(() => {
        const data = localStorage.getItem("smello-user-onboarding")
        if (data) {
            setProfileData(JSON.parse(data))
        }
    }, [])

    if (!profileData) {
        return (
            <div className="w-full h-full p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/settings')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Settings
                    </Button>
                </div>
                <Button onClick={() => router.push('/onboarding?mode=edit')} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                </Button>
            </div>

            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                    <User className="w-8 h-8 text-accent" />
                    Profile Overview
                </h1>
                <p className="text-muted-foreground mb-6">View your account information and preferences</p>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your basic profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-base font-semibold">{profileData.name || user?.fullName || "Not set"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base font-semibold">{user?.primaryEmailAddress?.emailAddress || "Not set"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <p className="text-base font-semibold">{profileData.role || "Not set"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Workspace Type</p>
                                    <Badge variant={profileData.usageType === "team" ? "default" : "secondary"} className="mt-1">
                                        {profileData.usageType === "team" ? "Team Collaboration" : "Individual PM Tools"}
                                    </Badge>
                                </div>
                            </div>

                            {profileData.productDescription && (
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Problem/Goal</p>
                                        <p className="text-base">{profileData.productDescription}</p>
                                    </div>
                                </div>
                            )}

                            {profileData.organizationName && (
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Organization</p>
                                        <p className="text-base font-semibold">{profileData.organizationName}</p>
                                        {profileData.teamName && (
                                            <p className="text-sm text-muted-foreground mt-1">Team: {profileData.teamName}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
