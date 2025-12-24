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
import { User, Briefcase, ArrowRight, CheckCircle2, Lock, LogIn, Loader2 } from "lucide-react"
import { useClerk } from "@clerk/nextjs"

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
}

interface OnboardingFlowProps {
    onComplete: (data: OnboardingData) => void
    isAuthenticated: boolean
    onBack: () => void
    initialData?: Partial<OnboardingData>
    isEditMode?: boolean
}

export function OnboardingFlow({ onComplete, isAuthenticated, onBack, initialData, isEditMode = false }: OnboardingFlowProps) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [data, setData] = useState<OnboardingData>({
        name: initialData?.name || "",
        role: initialData?.role || "",
        productDescription: initialData?.productDescription || "",
        usageType: initialData?.usageType || "personal"
    })
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)
    const { openSignIn } = useClerk()

    // Skip step 3 if already authenticated, but show a "Finishing up" state
    useEffect(() => {
        if (isAuthenticated && step === 3) {
            // If we reach step 3 and are already authenticated, we can optionally 
            // just show a "Confirm" button instead of "Sign In"
            // or auto-complete. Let's show a "Complete Setup" button.
        }
    }, [isAuthenticated, step])

    const handleNext = () => {
        if (step === 1 && data.name && data.role) {
            setStep(2)
        } else if (step === 2 && data.productDescription) {
            setStep(3)
        } else if (step === 3) {
            setStep(4)
        }
    }

    const handleSignIn = async () => {
        setIsSigningIn(true)
        // Save onboarding state to localStorage TEMP so we can retrieve it after redirect
        localStorage.setItem("smello-onboarding-temp", JSON.stringify(data))

        // Trigger Clerk Sign In
        openSignIn({ forceRedirectUrl: "/onboarding" })
    }

    const handleFinishSetup = async () => {
        setIsCompleting(true)
        // Simulate adequate delay for UX
        await new Promise(r => setTimeout(r, 800))
        onComplete(data)
    }

    return (
        <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
            <Card className="max-w-xl w-full notched-card border shadow-2xl">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold">
                        {step === 1 ? (isEditMode ? "Update Your Profile" : "Welcome to SMELLO") :
                            step === 2 ? "What's the problem you're solving?" :
                                step === 3 ? "Choose Your Path" :
                                    isAuthenticated ? (isEditMode ? "Confirm Updates" : "Confirm Setup") : "Create Your Account"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {step === 1 ? (isEditMode ? "Update your personal details" : "Let's get to know you better") :
                            step === 2 ? "Tell us the problem or outcome you want to achieve" :
                                step === 3 ? "How do you plan to use Smello?" :
                                    isAuthenticated ? (isEditMode ? "Ready to save your changes?" : "You're almost there!") : "Secure your workspace to continue"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base">What should we call you?</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Your Name"
                                        className="pl-10 h-12 text-lg"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            </div>
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
                                        onClick={handleFinishSetup}
                                        disabled={isCompleting}
                                    >
                                        {isCompleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Setting up your workspace...
                                            </>
                                        ) : (
                                            <>
                                                {isEditMode ? "Save Changes" : "Enter Smello"}
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

                    <div className="pt-4 flex justify-between items-center">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => {
                                if (step === 1) onBack()
                                else setStep((step - 1) as any)
                            }}
                        >
                            Back
                        </Button>

                        {step < 4 && (
                            <Button
                                size="lg"
                                className="ml-auto px-8"
                                onClick={handleNext}
                                disabled={(step === 1 && (!data.name.trim() || !data.role.trim())) || (step === 2 && !data.productDescription?.trim())}
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
                <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 3 ? "bg-accent" : "bg-muted"}`} />
                <div className={`h-1.5 w-12 rounded-full transition-all ${step >= 4 ? "bg-accent" : "bg-muted"}`} />
            </div>
        </div>
    )
}
