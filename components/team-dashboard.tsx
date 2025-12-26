"use client"

import React, { useState } from "react"
import { TeamsLayout } from "./teams/teams-layout"
import { MyDashboard } from "./teams/my-dashboard"
import { CollaborationHub } from "./teams/collaboration-hub"
import { Task } from "./teams/task-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Users, Plus } from "lucide-react"

interface TeamDashboardProps {
    onBack: () => void
}

const INITIAL_TEAM_TASKS: Task[] = [
    { id: "t1", values: { title: "Define Q1 Strategy", status: "In Progress", priority: "Critical", progress: 40, tags: ["Strategy", "Planning"] } },
    { id: "t2", values: { title: "Security Audit - Auth Flow", status: "Done", priority: "High", progress: 100, tags: ["Security"] } },
    { id: "t3", values: { title: "Team Capacity Planning", status: "To Do", priority: "Medium", progress: 0, tags: ["Ops"] } },
]

export function TeamDashboard({ onBack }: TeamDashboardProps) {
    const [activeTab, setActiveTab] = useState("personal-dashboard")
    const [teamTasks, setTeamTasks] = useState<Task[]>(INITIAL_TEAM_TASKS)

    const handlePromoteTask = (task: Task) => {
        setTeamTasks(prev => [task, ...prev])
        // Optionally show toast/notification
    }

    const renderContent = () => {
        switch (activeTab) {
            case "personal-dashboard":
                return <MyDashboard onPromoteTask={handlePromoteTask} />
            case "collaboration":
                return <CollaborationHub tasks={teamTasks} setTasks={setTeamTasks} />
            case "sprints":
                return (
                    <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Sprint Management</h2>
                            <p className="text-muted-foreground text-lg">
                                Manage Scrum ceremonies or Kanban flows. Visualize your team's velocity and accelerate your delivery.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full pt-4">
                            <Button variant="outline" className="h-20 flex-col gap-1 border-dashed hover:border-accent/40 hover:bg-accent/5">
                                <Plus className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">New Sprint</span>
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-1 border-dashed opacity-50 cursor-not-allowed">
                                <Lock className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Analytics</span>
                            </Button>
                        </div>
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
