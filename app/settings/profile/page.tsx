"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Briefcase, ArrowLeft, Save, Upload, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

const PREDEFINED_ROLES = [
    "Product Manager",
    "Product Owner",
    "Founder / CEO",
    "CTO / Technical Lead",
    "Designer",
    "Developer / Engineer",
    "Business Analyst",
    "Project Manager",
    "Consultant",
    "Student",
    "Other",
]

export default function ProfilePage() {
    const router = useRouter()
    const { user } = useUser()
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profileData, setProfileData] = useState<any>(null)
    const [editedData, setEditedData] = useState<any>(null)

    useEffect(() => {
        const data = localStorage.getItem("smello-user-onboarding")
        if (data) {
            const parsed = JSON.parse(data)
            setProfileData(parsed)
            setEditedData(parsed)
        }
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Save to localStorage
            localStorage.setItem("smello-user-onboarding", JSON.stringify(editedData))

            // Save to Firestore
            if (user) {
                await fetch(`/api/profile/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: editedData.name,
                        role: editedData.role,
                        selectedPath: editedData.usageType === 'team' ? 'team' : 'pm',
                        productDescription: editedData.productDescription,
                        onboardingCompleted: true
                    })
                })
            }

            setProfileData(editedData)
            setIsEditing(false)

            toast({
                title: "Profile Updated",
                description: "Your profile has been saved successfully.",
            })
        } catch (error) {
            console.error("Failed to save profile:", error)
            toast({
                title: "Error",
                description: "Failed to save profile. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedData(profileData)
        setIsEditing(false)
    }

    if (!profileData) {
        return (
            <div className="w-full h-full p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    const userInitials = (profileData.name || user?.fullName || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()

    return (
        <div className="w-full min-h-screen p-6 space-y-6 bg-background">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="gap-2">
                            <User className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your personal information and preferences</p>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Avatar Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Your profile picture from your Google account</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar className="w-24 h-24 border-4 border-border">
                            <AvatarImage src={user?.imageUrl || ""} alt={profileData.name || "User"} />
                            <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-bold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">
                                Your profile picture is managed through your Google account.
                            </p>
                            <Button variant="outline" size="sm" disabled className="gap-2">
                                <Upload className="w-4 h-4" />
                                Change Picture (Coming Soon)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your basic profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            {isEditing ? (
                                <Input
                                    id="name"
                                    value={editedData.name || ""}
                                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{profileData.name || user?.fullName || "Not set"}</span>
                                </div>
                            )}
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{user?.primaryEmailAddress?.emailAddress || "Not set"}</span>
                                <Badge variant="secondary" className="ml-auto">Verified</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Email is managed through your Google account</p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Professional Role</Label>
                            {isEditing ? (
                                <Select value={editedData.role} onValueChange={(val) => setEditedData({ ...editedData, role: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREDEFINED_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{profileData.role || "Not set"}</span>
                                </div>
                            )}
                        </div>

                        {/* Problem/Goal Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">What problem are you solving?</Label>
                            {isEditing ? (
                                <Textarea
                                    id="description"
                                    value={editedData.productDescription || ""}
                                    onChange={(e) => setEditedData({ ...editedData, productDescription: e.target.value })}
                                    placeholder="Describe the problem you're trying to solve or the outcome you want to achieve"
                                    rows={4}
                                />
                            ) : (
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <p className="text-sm">{profileData.productDescription || "Not specified"}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Workspace Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace Settings</CardTitle>
                        <CardDescription>Your workspace configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-medium">Workspace Type</p>
                                <p className="text-sm text-muted-foreground">Your current workspace mode</p>
                            </div>
                            <Badge variant={profileData.usageType === "team" ? "default" : "secondary"} className="text-sm px-4 py-2">
                                {profileData.usageType === "team" ? "Team Collaboration" : "Individual PM Tools"}
                            </Badge>
                        </div>

                        {profileData.organizationName && (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">Organization</p>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-sm text-muted-foreground">{profileData.organizationName}</p>
                                {profileData.teamName && (
                                    <p className="text-xs text-muted-foreground">Team: {profileData.teamName}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account status and details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/50 rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                                <Badge variant="default">Active</Badge>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                                <p className="text-xs font-mono truncate">{user?.id || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
