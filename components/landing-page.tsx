"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Target, Layers, Zap, Users, Layout, Rocket } from "lucide-react"
import { signIn } from "next-auth/react"

interface LandingPageProps {
    onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-background grid-pattern flex flex-col">
            {/* Navigation Bar */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo.png"
                                alt="SMELLO Logo"
                                className="w-full h-full object-contain rounded-md"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight">SMELLO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6 mr-4 text-sm font-medium text-muted-foreground">
                            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                            <a href="#teams" className="hover:text-foreground transition-colors">For Teams</a>
                            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                        </nav>
                        <Button variant="ghost" className="font-medium" onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>Sign In</Button>
                        <Button onClick={onGetStarted} className="font-medium shadow-lg shadow-primary/20">Get Started</Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col pt-32 pb-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex justify-center">
                            <Badge variant="outline" className="px-4 py-1.5 text-sm rounded-full animate-fade-in-up bg-background/50 backdrop-blur border-accent/50 text-foreground">
                                <Sparkles className="w-3 h-3 mr-2 text-accent" />
                                New: Smello for Teams is now in Beta
                            </Badge>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in-up animation-delay-200 leading-[1.1]">
                            Turn Ideas into Products <br />
                            <span className="bg-gradient-to-r from-accent via-purple-500 to-pink-500 bg-clip-text text-transparent">Collaborate & Launch</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up animation-delay-400 leading-relaxed">
                            The all-in-one workspace where Product Managers and Teams come together.
                            From instant ideation to roadmap planning and technical execution.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-600">
                            <Button size="lg" className="h-14 px-8 text-lg gap-2 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform" onClick={onGetStarted}>
                                Start Building for Free
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur hover:bg-muted/50">
                                Schedule a Demo
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <section id="features" className="container mx-auto px-6 mt-32">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-600">
                        <div className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border/50 hover:bg-card transition-colors group">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Instant Ideation</h3>
                            <p className="text-muted-foreground leading-relaxed">Transform a single napkin sketch or keyword into a full product spec sheet using advanced AI.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border/50 hover:bg-card transition-colors group">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Rocket className="w-7 h-7 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Idea to Product</h3>
                            <p className="text-muted-foreground leading-relaxed">Seamless pipeline from concept to PRD, creating technical blueprints and roadmaps automatically.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border/50 hover:bg-card transition-colors group">
                            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
                            <p className="text-muted-foreground leading-relaxed">Invite your team to co-create, comment on requirements, and manage stories in one shared workspace.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-card/50 backdrop-blur border border-border/50 hover:bg-card transition-colors group">
                            <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Layout className="w-7 h-7 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Project Management</h3>
                            <p className="text-muted-foreground leading-relaxed">Built-in tools for risk analysis, competitive intelligence, and user journey mapping.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 opacity-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="SMELLO Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-sm">© 2025 SMELLO Inc.</span>
                    </div>
                    <div className="flex gap-8 text-sm">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">Twitter</a>
                        <a href="#" className="hover:text-foreground">LinkedIn</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
