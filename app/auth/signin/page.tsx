"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Sparkles, Shield, Zap } from "lucide-react"

export default function SignIn() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
            <div className="max-w-4xl w-full px-4">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center">
                            <Target className="w-8 h-8 text-accent-foreground" />
                        </div>
                        <h1 className="text-5xl font-bold">SMELLO</h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Your AI-Powered Product Management Toolkit
                    </p>
                </div>

                <Card className="border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Sign in to Continue</CardTitle>
                        <CardDescription className="text-base">
                            Access your projects, history, and AI-powered tools
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            className="w-full h-12 text-base"
                            size="lg"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <Sparkles className="w-8 h-8 mx-auto mb-2 text-accent" />
                                <h3 className="font-semibold mb-1">AI Access</h3>
                                <p className="text-xs text-muted-foreground">
                                    Use your Google AI or Claude account
                                </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <Shield className="w-8 h-8 mx-auto mb-2 text-accent" />
                                <h3 className="font-semibold mb-1">Secure Storage</h3>
                                <p className="text-xs text-muted-foreground">
                                    Your projects saved in the cloud
                                </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <Zap className="w-8 h-8 mx-auto mb-2 text-accent" />
                                <h3 className="font-semibold mb-1">Unlimited Access</h3>
                                <p className="text-xs text-muted-foreground">
                                    No operation limits with your account
                                </p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                            <p>
                                By signing in, you agree to our Terms of Service and Privacy Policy.
                            </p>
                            <p className="mt-2">
                                Don't have a Google account?{" "}
                                <a
                                    href="https://accounts.google.com/signup"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline"
                                >
                                    Create one here
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-8 text-sm text-muted-foreground">
                    <p>
                        Want to try without signing in?{" "}
                        <a href="/" className="text-accent hover:underline">
                            Continue as guest
                        </a>{" "}
                        (6 free operations)
                    </p>
                </div>
            </div>
        </div>
    )
}
