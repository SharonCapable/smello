"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, ArrowRight, Sparkles, Target, Workflow } from "lucide-react"

interface OnboardingPathSelectorProps {
    onSelectPath: (path: 'pm' | 'teams') => void
}

export function OnboardingPathSelector({ onSelectPath }: OnboardingPathSelectorProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
            <div className="max-w-5xl w-full space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Target className="w-10 h-10 text-accent" />
                        <h1 className="text-4xl font-bold">Welcome to Smello!</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose how you'd like to use Smello to supercharge your product development
                    </p>
                </div>

                {/* Path Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* PM Tools Card */}
                    <Card
                        className="cursor-pointer hover:border-accent hover:shadow-xl transition-all group relative overflow-hidden"
                        onClick={() => onSelectPath('pm')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <CardHeader className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-8 h-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">Product Management</CardTitle>
                            <CardDescription className="text-base">
                                AI-powered tools for PMs, founders, and product teams
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">AI-Powered Generation</p>
                                        <p className="text-xs text-muted-foreground">PRDs, roadmaps, user stories, and more</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Strategic Planning</p>
                                        <p className="text-xs text-muted-foreground">Feature prioritization & competitive analysis</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Workflow className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Complete Toolkit</p>
                                        <p className="text-xs text-muted-foreground">User journeys, pitch decks, technical blueprints</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button className="w-full gap-2 group-hover:gap-3 transition-all" variant="outline">
                                    Get Started with PM Tools
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Perfect for: Product Managers, Founders, Product Owners
                            </p>
                        </CardContent>
                    </Card>

                    {/* Team Collaboration Card - DISABLED */}
                    <Card
                        className="cursor-not-allowed opacity-60 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />

                        {/* Coming Soon Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                Coming Soon
                            </div>
                        </div>

                        <CardHeader className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <CardTitle className="text-2xl">Team Collaboration</CardTitle>
                            <CardDescription className="text-base">
                                Project management and workflow tracking for teams
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Team Projects</p>
                                        <p className="text-xs text-muted-foreground">Collaborative project management with workflows</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Workflow className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Workflow Tracking</p>
                                        <p className="text-xs text-muted-foreground">Track progress through custom pipeline stages</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">Real-time Collaboration</p>
                                        <p className="text-xs text-muted-foreground">Comments, mentions, notifications, and more</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button className="w-full gap-2" variant="outline" disabled>
                                    Coming Soon in Phase 2
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Team features launching soon with enhanced security
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Note */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>Don't worry - you can switch between modes anytime! 🔄</p>
                </div>
            </div>
        </div>
    )
}
