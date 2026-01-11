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
import { User, Mail, Briefcase, Save, Upload, CheckCircle2, Loader2, Pencil } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
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
    const { user } = useAuth()
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
                const token = await user.getIdToken()
                await fetch(`/api/profile/${user.uid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
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

    const userInitials = (profileData.name || user?.displayName || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()

    return (
        <div className="w-full h-full p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User & Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal details and workspace preferences.</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleCancel}>
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

            {/* Content Grid */}
            <div className="grid gap-8">
                {/* ID & Avatar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identity</CardTitle>
                        <CardDescription>Your digital identity across Smello.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Avatar className="w-20 h-20 border-2 border-muted">
                            <AvatarImage src={user?.photoURL || ""} alt={profileData.name || "User"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg">{profileData.name || user?.displayName || "User"}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <Button variant="outline" size="sm" disabled className="mt-2 h-8 text-xs gap-2">
                                <Upload className="w-3 h-3" />
                                Change Avatar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                {isEditing ? (
                                    <Input
                                        id="name"
                                        value={editedData.name || ""}
                                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                                    />
                                ) : (
                                    <div className="p-2.5 bg-muted/40 rounded-md text-sm border border-transparent">
                                        {profileData.name || user?.displayName || "Not set"}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                {isEditing ? (
                                    <Select value={editedData.role} onValueChange={(val) => setEditedData({ ...editedData, role: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PREDEFINED_ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="p-2.5 bg-muted/40 rounded-md text-sm border border-transparent flex items-center gap-2">
                                        <Briefcase className="w-3 h-3 text-muted-foreground" />
                                        {profileData.role || "Not set"}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mission</Label>
                            {isEditing ? (
                                <Textarea
                                    id="description"
                                    value={editedData.productDescription || ""}
                                    onChange={(e) => setEditedData({ ...editedData, productDescription: e.target.value })}
                                    placeholder="What are you building?"
                                    rows={3}
                                />
                            ) : (
                                <div className="p-3 bg-muted/40 rounded-md text-sm text-muted-foreground min-h-[80px]">
                                    {profileData.productDescription || "No mission statement set."}
                                </div>
                            )}
                            <p className="text-[0.8rem] text-muted-foreground">What problem are you solving?</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Workspace */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace</CardTitle>
                        <CardDescription>Configuration for your current workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                            <div>
                                <div className="font-medium mb-1">Active Mode</div>
                                <div className="text-sm text-muted-foreground">Determines the toolset available in your dashboard.</div>
                            </div>
                            <Badge variant={profileData.usageType === "team" ? "default" : "outline"} className="px-3 py-1">
                                {profileData.usageType === "team" ? "Team Collaboration" : "PM Toolkit"}
                            </Badge>
                        </div>
                        {profileData.organizationName && (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <div className="font-medium mb-1">Organization</div>
                                    <div className="text-sm text-muted-foreground">{profileData.organizationName}</div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
