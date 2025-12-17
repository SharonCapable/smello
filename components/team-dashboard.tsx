"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users, Lock, ArrowLeft, Plus } from "lucide-react"

interface TeamDashboardProps {
    onBack: () => void
}

export function TeamDashboard({ onBack }: TeamDashboardProps) {
    return (
        <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center text-center">
            <Button variant="ghost" className="absolute top-8 left-8" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Mode Selection
            </Button>

            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-accent" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Smello for Teams</h1>
                <p className="text-xl text-muted-foreground">
                    Collaborative product management, strategy alignment, and team workflows.
                </p>

                <Card className="bg-card/50 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                            Early Access Feature
                        </CardTitle>
                        <CardDescription>
                            We are currently rolling out team features to select beta users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm">
                            Smello for Teams will include:
                        </p>
                        <ul className="text-sm text-left max-w-md mx-auto space-y-2 list-disc pl-5 text-muted-foreground">
                            <li>Real-time collaboration on PRDs and stories</li>
                            <li>Shared team workspaces and asset libraries</li>
                            <li>Role-based access control</li>
                            <li>Integration with Enterprise Jira & Slack instances</li>
                        </ul>

                        <div className="pt-6">
                            <Button className="w-full" variant="secondary" disabled>
                                Join Waitlist (Coming Soon)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
