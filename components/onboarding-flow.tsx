"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User, Briefcase, ArrowRight, CheckCircle2, Lock, LogIn, Loader2, Building2, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createOrganization, createTeam } from "@/lib/firestore-service"
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

interface OnboardingData {
    name: string
    role: string
    productDescription?: string
    usageType: "personal" | "team"
    organizationName?: string
    teamName?: string
    organizationId?: string
    teamId?: string
}

interface OnboardingFlowProps {
    onComplete: (data: OnboardingData) => void
    isAuthenticated: boolean
    onBack: () => void
    initialData?: Partial<OnboardingData>
    isEditMode?: boolean
    initialStep?: 1 | 2 | 3 | 4 | 5
}

export function OnboardingFlow({ onComplete, isAuthenticated, onBack, initialData, isEditMode = false, initialStep }: OnboardingFlowProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(initialStep || 1)
    const { user, signInWithGoogle } = useAuth()

    // Auto-populate name from Clerk user
    const userName = user?.displayName || initialData?.name || ""

    const [data, setData] = useState<OnboardingData>({
        name: userName, // Use Clerk's name
        role: initialData?.role || "",
        productDescription: initialData?.productDescription || "",
        usageType: initialData?.usageType || "personal",
        organizationName: initialData?.organizationName || "",
        teamName: initialData?.teamName || ""
    })
    const [isPrivileged, setIsPrivileged] = useState(false)
    const [foundOrg, setFoundOrg] = useState<any>(null)
    const [orgTeams, setOrgTeams] = useState<any[]>([])
    const [isSearchingOrg, setIsSearchingOrg] = useState(false)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const { toast } = useToast()

    // Check if user is super admin
    useEffect(() => {
        const checkAdmin = async () => {
            if (user) {
                const { isSuperAdmin } = await import("@/lib/firestore-service")
                const result = await isSuperAdmin(user.uid)
                setIsPrivileged(result)
            }
        }
        checkAdmin()
    }, [user])

    // Search for organization when name changes (if not privileged)
    useEffect(() => {
        const searchOrg = async () => {
            if (!isPrivileged && data.organizationName && data.organizationName.length > 2 && step === 5) {
                setIsSearchingOrg(true)
                try {
                    const { findOrganizationByName, getOrganizationTeams } = await import("@/lib/firestore-service")
                    const org = await findOrganizationByName(data.organizationName)
                    setFoundOrg(org)
                    if (org) {
                        const teams = await getOrganizationTeams(org.id)
                        setOrgTeams(teams)
                    } else {
                        setOrgTeams([])
                    }
                } catch (e) {
                    console.error("Search failed", e)
                } finally {
                    setIsSearchingOrg(false)
                }
            } else {
                setFoundOrg(null)
                setOrgTeams([])
            }
        }
        const timer = setTimeout(searchOrg, 500)
        return () => clearTimeout(timer)
    }, [data.organizationName, isPrivileged, step])

    const handleNext = () => {
        // Step 1: Only require role (name is auto-populated from Clerk)
        if (step === 1 && data.role) {
            setStep(2)
        } else if (step === 2) {
            // Step 2 (Problem/Outcome) is now optional for faster setup
            setStep(4) // Skip step 3 (usage type selection) as it was picked in Path Selection
        } else if (step === 4) {
            if (data.usageType === "team") {
                setStep(5)
            } else {
                handleFinishSetup()
            }
        }
    }

    const handleSignIn = async () => {
        setIsSigningIn(true)
        localStorage.setItem("smello-onboarding-temp", JSON.stringify(data))
        try {
            await signInWithGoogle()
        } catch (e) {
            console.error("Sign in failed", e)
        } finally {
            setIsSigningIn(false)
        }
    }

    const handleFinishSetup = async () => {
        setIsCompleting(true)
        try {
            let resultData = { ...data }

            if (data.usageType === "team" && user) {
                const { createOrganization, createTeam, joinOrganizationWithTeam } = await import("@/lib/firestore-service")

                if (isPrivileged) {
                    // Create real Org and Team in Firestore
                    console.log('Creating organization:', data.organizationName)
                    const orgId = await createOrganization(
                        user.uid,
                        data.organizationName!,
                        user.email || "",
                        user.displayName || "User"
                    )
                    console.log('Organization created:', orgId)

                    console.log('Creating team:', data.teamName)
                    const teamId = await createTeam(orgId, data.teamName!, "Initial team", user.uid)
                    console.log('Team created:', teamId)

                    resultData = {
                        ...resultData,
                        organizationId: orgId,
                        teamId: teamId
                    }
                } else if (foundOrg && data.teamId) {
                    // Join existing Org and Team
                    console.log('Joining organization:', foundOrg.name)
                    await joinOrganizationWithTeam(
                        foundOrg.id,
                        data.teamId,
                        user.uid,
                        user.email || "",
                        user.displayName || "User"
                    )

                    resultData = {
                        ...resultData,
                        organizationId: foundOrg.id,
                        organizationName: foundOrg.name,
                        teamId: data.teamId,
                        teamName: orgTeams.find(t => t.id === data.teamId)?.name || ""
                    }
                } else {
                    throw new Error("Only super admins can create organizations. Please select an existing organization and team to join.")
                }
            }

            // Artificial delay for UX polish
            await new Promise(r => setTimeout(r, 800))
            onComplete(resultData)
        } catch (error: any) {
            console.error("Failed to complete onboarding", error)
            toast({
                title: "Setup Error",
                description: error.message || "Failed to create your workspace. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsCompleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
            <Card className="max-w-xl w-full notched-card border shadow-2xl">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold">
                        {step === 1 ? (isEditMode ? "Update Your Profile" : "Welcome to SMELLO") :
                            step === 2 ? "What's the problem you're solving?" :
                                step === 4 ? (isAuthenticated ? (isEditMode ? "Confirm Updates" : "Identity Verified") : "Create Your Account") :
                                    (isPrivileged ? "Create Your Organization" : "Join Your Team")}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {step === 1 ? (isEditMode ? "Update your personal details" : "Let's get to know you better") :
                            step === 2 ? "Tell us the problem or outcome you want to achieve (Optional)" :
                                step === 4 ? (isAuthenticated ? (isEditMode ? "Ready to save your changes?" : "You're authenticated!") : "Secure your workspace to continue") :
                                    (isPrivileged ? "Define your organization and create your first team" : "Search for your organization and select a team to join")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                            {/* Show welcome message with user's name if available */}
                            {userName && (
                                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 mb-4">
                                    <p className="text-sm text-center">
                                        Welcome, <span className="font-semibold">{userName}</span>! 👋
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-base">What is your role?</Label>
                                <Select value={data.role} onValueChange={(val) => setData({ ...data, role: val })}>
                                    <SelectTrigger id="role" className="h-12 text-lg">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                                            <SelectValue placeholder="Select your role" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREDEFINED_ROLES.map((role) => (
                                            <SelectItem key={role} value={role} className="text-base">
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {data.role === "Other" && (
                                    <Input
                                        placeholder="Please specify your role..."
                                        className="h-10 mt-2"
                                        onChange={(e) => setData({ ...data, role: e.target.value || "Other" })}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="space-y-2">
                                <Label htmlFor="product" className="text-base">What problem are you trying to solve or what outcome do you want?</Label>
                                <Input
                                    id="product"
                                    placeholder="e.g., Reduce customer churn by 20% using personalized onboarding"
                                    className="h-12 text-lg"
                                    value={data.productDescription || ""}
                                    onChange={(e) => setData({ ...data, productDescription: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usecase" className="text-base">What's your primary use case?</Label>
                                <Select>
                                    <SelectTrigger className="h-12 text-lg">
                                        <SelectValue placeholder="Select your use case" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="saas">SaaS / Web App</SelectItem>
                                        <SelectItem value="mobile">Mobile App</SelectItem>
                                        <SelectItem value="enterprise">Enterprise Software</SelectItem>
                                        <SelectItem value="internal">Internal Tools</SelectItem>
                                        <SelectItem value="api">API / Backend</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <RadioGroup
                                value={data.usageType}
                                onValueChange={(val) => setData({ ...data, usageType: val as "personal" | "team" })}
                                className="grid gap-4"
                            >
                                <Label
                                    htmlFor="personal"
                                    className={`flex items-start space-x-4 border rounded-xl p-4 cursor-pointer transition-all hover:bg-accent/5 ${data.usageType === "personal" ? "border-accent ring-1 ring-accent bg-accent/5" : ""}`}
                                >
                                    <RadioGroupItem value="personal" id="personal" className="mt-1" />
                                    <div className="space-y-1">
                                        <div className="font-semibold text-lg flex items-center">
                                            Smello for PMs
                                            {data.usageType === "personal" && <CheckCircle2 className="w-4 h-4 text-accent ml-2" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            For individual product managers and solo founders building products from 0 to 1.
                                        </p>
                                    </div>
                                </Label>

                                <Label
                                    htmlFor="team"
                                    className={`flex items-start space-x-4 border rounded-xl p-4 cursor-pointer transition-all hover:bg-accent/5 ${data.usageType === "team" ? "border-accent ring-1 ring-accent bg-accent/5" : ""}`}
                                >
                                    <RadioGroupItem value="team" id="team" className="mt-1" />
                                    <div className="space-y-1">
                                        <div className="font-semibold text-lg flex items-center">
                                            Smello for Teams
                                            {data.usageType === "team" && <CheckCircle2 className="w-4 h-4 text-accent ml-2" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            For product teams collaborating on roadmaps, features, and strategy.
                                        </p>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in-up text-center">
                            {isAuthenticated ? (
                                // Authenticated View
                                <>
                                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-accent" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-medium">You're All Set!</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            Your account is ready. Let's start building your product!
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full h-12 text-base"
                                        onClick={data.usageType === "team" ? handleNext : handleFinishSetup}
                                        disabled={isCompleting}
                                    >
                                        {isCompleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Setting up your workspace...
                                            </>
                                        ) : (
                                            <>
                                                {data.usageType === "team" ? "Continue to Team Setup" : (isEditMode ? "Save Changes" : "Enter Smello")}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                // Not Authenticated View
                                <>
                                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-accent" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-medium">Authentication Required</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            To save your workspace settings and ensure secure access, please sign in to complete onboarding.
                                        </p>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Button
                                            size="lg"
                                            className="w-full h-12 text-base"
                                            onClick={handleSignIn}
                                            disabled={isSigningIn}
                                        >
                                            {isSigningIn ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Securely Signing In...
                                                </>
                                            ) : (
                                                <>
                                                    Sign in with Google
                                                    <LogIn className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-xs text-muted-foreground pt-2">
                                            By signing in, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="space-y-2">
                                <Label htmlFor="org" className="text-base">
                                    {isPrivileged ? "Organization Name" : "Search Organization to Join"}
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="org"
                                        placeholder={isPrivileged ? "e.g. Acme Corp" : "Type organization name..."}
                                        className="pl-10 h-12 text-lg"
                                        value={data.organizationName}
                                        onChange={(e) => setData({ ...data, organizationName: e.target.value })}
                                        autoFocus
                                    />
                                    {isSearchingOrg && (
                                        <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                {!isPrivileged && data.organizationName && data.organizationName.length > 2 && !foundOrg && !isSearchingOrg && (
                                    <p className="text-xs text-destructive">Organization not found. Only Super Admins can create new organizations.</p>
                                )}
                                {!isPrivileged && foundOrg && (
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Found: {foundOrg.name} ({foundOrg.domain || 'no domain'})
                                    </p>
                                )}
                            </div>

                            {isPrivileged ? (
                                <div className="space-y-2">
                                    <Label htmlFor="team" className="text-base">Your Team Name</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="team"
                                            placeholder="e.g. Product Team B"
                                            className="pl-10 h-12 text-lg"
                                            value={data.teamName}
                                            onChange={(e) => setData({ ...data, teamName: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : foundOrg && (
                                <div className="space-y-2">
                                    <Label htmlFor="team-select" className="text-base">Select Team to Join</Label>
                                    <Select value={data.teamId} onValueChange={(val) => setData({ ...data, teamId: val })}>
                                        <SelectTrigger id="team-select" className="h-12 text-lg">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <SelectValue placeholder="Select a team" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgTeams.map((team) => (
                                                <SelectItem key={team.id} value={team.id} className="text-base">
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className="w-full h-12 text-base mt-4"
                                onClick={handleFinishSetup}
                                disabled={
                                    isCompleting ||
                                    (isPrivileged ? (!data.organizationName || !data.teamName) : (!foundOrg || !data.teamId))
                                }
                            >
                                {isCompleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {isPrivileged ? "Building your workspace..." : "Joining workspace..."}
                                    </>
                                ) : (
                                    <>
                                        {isPrivileged ? "Finish Setup" : "Join Organization"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>

                            {!isPrivileged && !foundOrg && data.organizationName && data.organizationName.length > 2 && (
                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="text-sm text-muted-foreground hover:text-accent underline transition-colors"
                                    >
                                        Can't find your organization? Choose a different workflow
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground"
                            disabled={step === 1}
                            onClick={() => {
                                if (step === 5) {
                                    // From team setup, go back to auth confirmation step
                                    setStep(4)
                                } else if (step === 4) {
                                    // From auth step, go back to step 2
                                    setStep(2)
                                } else if (step > 1) {
                                    setStep((step - 1) as any)
                                }
                            }}
                        >
                            Back
                        </Button>

                        {step < 4 && (
                            <Button
                                size="lg"
                                className="ml-auto px-8"
                                onClick={handleNext}
                                disabled={(step === 1 && !data.role.trim())}
                            >
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Progress Indicators */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-2">
                <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 1 ? "bg-accent" : "bg-muted"}`} />
                <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 2 ? "bg-accent" : "bg-muted"}`} />
                <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 4 ? "bg-accent" : "bg-muted"}`} />
                {data.usageType === "team" && (
                    <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 5 ? "bg-accent" : "bg-muted"}`} />
                )}
            </div>
        </div>
    )
}
