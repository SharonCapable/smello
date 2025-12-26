"use client"

import React, { useState } from "react"
import { TeamsLayout } from "./teams/teams-layout"
import { MyDashboard } from "./teams/my-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface TeamDashboardProps {
    onBack: () => void
}

export function TeamDashboard({ onBack }: TeamDashboardProps) {
    const [activeTab, setActiveTab] = useState("personal-dashboard")

    const renderContent = () => {
        switch (activeTab) {
            case "personal-dashboard":
                return <MyDashboard />
            case "collaboration":
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-accent" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h2 className="text-2xl font-bold">Collaboration Hub</h2>
                            <p className="text-muted-foreground">
                                This is where your individual work becomes team work. Move tasks here to share them with your team.
                            </p>
                        </div>
                        <Card className="max-w-md bg-card/50 border-dashed">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    Phase 2 Development
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    The shared collaboration engine is currently being wired up to your organization's backend.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )
            case "sprints":
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="max-w-md space-y-2">
                            <h2 className="text-2xl font-bold">Sprint Board</h2>
                            <p className="text-muted-foreground">
                                Manage Scrum ceremonies or Kanban flows. Simple, visual, and fast.
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Lock className="w-4 h-4" />
                            Configure First Sprint
                        </Button>
                    </div>
                )
            default:
                return (
                    <div className="p-8 text-center text-muted-foreground">
                        Content for {activeTab} coming soon.
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-background relative">
            <TeamsLayout activeTab={activeTab} onTabChange={setActiveTab} organizationName="Wizzle Org">
                {renderContent()}
            </TeamsLayout>

            {/* Absolute positioned back button for quick exit to individual toolkit */}
            <div className="fixed bottom-4 left-4 z-50">
                <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-lg border bg-background/80 backdrop-blur"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Toolkit
                </Button>
            </div>
        </div>
    )
}
