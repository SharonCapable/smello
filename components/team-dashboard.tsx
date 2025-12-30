"use client"

import React, { useState } from "react"
import { MyDashboard } from "./teams/my-dashboard"
import { ProjectsView } from "./teams/projects-view"
import { CollaborationHub } from "./teams/collaboration-hub"
import { SprintBoard } from "./teams/sprint-board"
import { TeamsLayout } from "./teams/teams-layout"
import { TeamAnalytics } from "./teams/analytics"
import { CalendarView } from "./teams/calendar-view"
import { MessageCenter } from "./teams/message-center"
import { Task } from "./teams/task-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, Users, Plus } from "lucide-react"

interface TeamDashboardProps {
    onBack: () => void
    organizationId?: string
    teamId?: string
    organizationName?: string
}

const INITIAL_TEAM_TASKS: Task[] = [
    { id: "t1", values: { title: "Define Q1 Strategy", status: "In Progress", priority: "Critical", progress: 40, tags: ["Strategy", "Planning"], assignee: "Sharon" } },
    { id: "t2", values: { title: "Security Audit - Auth Flow", status: "Done", priority: "High", progress: 100, tags: ["Security"], assignee: "Alex" } },
    { id: "t3", values: { title: "Team Capacity Planning", status: "To Do", priority: "Medium", progress: 0, tags: ["Ops"], assignee: "Jordan" } },
    { id: "t4", values: { title: "Design System Refresh", status: "Review", priority: "High", progress: 85, tags: ["Design"], assignee: "Taylor" } },
]

export function TeamDashboard({ onBack, organizationId, teamId, organizationName }: TeamDashboardProps) {
    const [activeTab, setActiveTab] = useState("personal-dashboard")
    const [teamTasks, setTeamTasks] = useState<Task[]>(INITIAL_TEAM_TASKS)

    // In a real scenario, we'd fetch tasks based on organizationId and teamId here
    // For now, we'll continue with INITIAL_TEAM_TASKS but acknowledge the context

    const handlePromoteTask = (task: Task) => {
        setTeamTasks(prev => [task, ...prev])
    }

    const handleUpdateTeamTask = (taskId: string, fieldId: string, value: any) => {
        setTeamTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, values: { ...t.values, [fieldId]: value } } : t
        ))
    }

    const renderContent = () => {
        switch (activeTab) {
            case "personal-dashboard":
                return <MyDashboard onPromoteTask={handlePromoteTask} />
            case "projects":
                return <ProjectsView organizationId={organizationId} teamId={teamId} />
            case "collaboration":
                return <CollaborationHub tasks={teamTasks} setTasks={setTeamTasks} />
            case "sprints":
                return <SprintBoard
                    tasks={teamTasks}
                    onUpdateTask={handleUpdateTeamTask}
                    orgId={organizationId}
                    teamId={teamId}
                />
            case "analytics":
                return <TeamAnalytics />
            case "calendar":
                return <CalendarView />
            case "messages":
                return <MessageCenter />
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
            <TeamsLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                organizationName={organizationName || "Wizzle Org"}
            >
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
