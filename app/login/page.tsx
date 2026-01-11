"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Loader2, LogIn, ArrowLeft } from "lucide-react"

export default function LoginPage() {
    const { signInWithGoogle, user, loading } = useAuth()
    const router = useRouter()
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [step, setStep] = useState<'role-selection' | 'signin'>('role-selection')
    const [selectedRole, setSelectedRole] = useState<'admin' | 'individual' | null>(null)

    // Redirect if already signed in
    useEffect(() => {
        if (user && !loading) {
            const intendedRole = typeof window !== 'undefined' ? localStorage.getItem('smello-login-role') : null;
            if (intendedRole === 'admin') {
                router.push("/admin")
            } else {
                router.push("/")
            }
        }
    }, [user, loading, router])

    if (user && !loading) return null

    const handleRoleSelect = (role: 'admin' | 'individual') => {
        setSelectedRole(role)
        if (typeof window !== 'undefined') {
            localStorage.setItem('smello-login-role', role)
        }
        setStep('signin')
    }

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true)
        try {
            await signInWithGoogle()
            // Redirect based on selected role
            if (selectedRole === 'admin') {
                router.push("/admin")
            } else {
                // For individual, prompt to choose path
                // We pass a query param to tell HomePage to show path selector
                router.push("/?intialState=path-selection")
            }
        } catch (error) {
            console.error("Login failed", error)
        } finally {
            setIsSigningIn(false)
        }
    }

    const renderRoleSelection = () => (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                    onClick={() => handleRoleSelect('individual')}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">👤</span> Individual
                        </CardTitle>
                        <CardDescription>
                            Product Managers, Founders, and Team Members
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        Access PM tools or join your team's workspace.
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                    onClick={() => handleRoleSelect('admin')}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span> Super Admin
                        </CardTitle>
                        <CardDescription>
                            Platform Administrators
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        Manage organizations, users, and system settings.
                    </CardContent>
                </Card>
            </div>

            <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Button>
        </div>
    )

    const renderSignIn = () => (
        <Card className="max-w-md w-full border shadow-2xl mx-auto">
            <CardHeader className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <CardTitle className="text-2xl font-bold">
                    {selectedRole === 'admin' ? 'Admin Access' : 'Welcome Back'}
                </CardTitle>
                <CardDescription>
                    Sign in to continue as {selectedRole === 'admin' ? 'an Administrator' : 'an Individual User'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-medium relative overflow-hidden group"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn || loading}
                >
                    {isSigningIn ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign in with Google
                        </>
                    )}
                </Button>

                <Button variant="ghost" onClick={() => setStep('role-selection')} className="w-full">
                    Change Role
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-background grid-pattern flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">choose your entry point</h1>
                    <p className="text-muted-foreground">Select how you want to access Smello</p>
                </div>

                {step === 'role-selection' ? renderRoleSelection() : renderSignIn()}
            </div>
        </div>
    )
}
