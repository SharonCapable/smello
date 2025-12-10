"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Briefcase, ArrowRight, CheckCircle2, Lock, LogIn } from "lucide-react"
import { signIn } from "next-auth/react"

interface OnboardingData {
    name: string
    role: string
    usageType: "personal" | "team"
}

interface OnboardingFlowProps {
    onComplete: (data: OnboardingData) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1) // Added step 3 for Auth
    const [data, setData] = useState<OnboardingData>({
        name: "",
        role: "",
        usageType: "personal"
    })
    const [isSigningIn, setIsSigningIn] = useState(false)

    const handleNext = () => {
        if (step === 1 && data.name) {
            setStep(2)
        } else if (step === 2) {
            setStep(3)
        }
    }

    const handleSignIn = async () => {
        setIsSigningIn(true)
        // Save onboarding state to localStorage TEMP so we can retrieve it after redirect
        localStorage.setItem("smello-onboarding-temp", JSON.stringify(data))

        // Trigger Google Sign In
        await signIn("google", { callbackUrl: "/" })
    }

    return (
        <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
            <Card className="max-w-xl w-full notched-card border shadow-2xl">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold">
                        {step === 1 ? "Welcome to SMELLO" : step === 2 ? "Choose Your Path" : "Create Your Account"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {step === 1 ? "Let's get to know you better" : step === 2 ? "How do you plan to use Smello?" : "Secure your workspace to continue"}
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
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="role"
                                        placeholder="Product Manager, Founder, Developer..."
                                        className="pl-10 h-12 text-lg"
                                        value={data.role}
                                        onChange={(e) => setData({ ...data, role: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
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

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in-up text-center">
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
                                    {isSigningIn ? "Securely Signing In..." : "Sign in with Google"}
                                    {!isSigningIn && <LogIn className="w-4 h-4 ml-2" />}
                                </Button>
                                <p className="text-xs text-muted-foreground pt-2">
                                    By signing in, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-between items-center">
                        {step > 1 && (
                            <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep(step - 1 as any)}>Back</Button>
                        )}
                        {step < 3 && (
                            <Button
                                size="lg"
                                className="ml-auto px-8"
                                onClick={handleNext}
                                disabled={step === 1 && !data.name.trim()}
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
            </div>
        </div>
    )
}
