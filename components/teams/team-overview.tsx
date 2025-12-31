"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    Settings,
    ChevronRight,
    ChevronLeft,
    Plus,
    Zap,
    TrendingUp,
    Calendar,
    LayoutDashboard,
    FolderKanban,
    MessageSquare,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertCircle,
    Home
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
    id: string
    name: string
    role: string
    avatar?: string
    status: 'online' | 'away' | 'offline'
    tasksCompleted: number
    tasksInProgress: number
}

interface RecentActivity {
    id: string
    user: string
    action: string
    target: string
    time: string
}

const MOCK_MEMBERS: TeamMember[] = [
    { id: "1", name: "Sharon Wizzle", role: "Team Lead", status: "online", tasksCompleted: 24, tasksInProgress: 3 },
    { id: "2", name: "Alex Chen", role: "Senior Developer", status: "online", tasksCompleted: 18, tasksInProgress: 5 },
    { id: "3", name: "Jordan Smith", role: "Developer", status: "away", tasksCompleted: 12, tasksInProgress: 4 },
    { id: "4", name: "Taylor Wilson", role: "QA Engineer", status: "online", tasksCompleted: 15, tasksInProgress: 2 },
    { id: "5", name: "Riley Davis", role: "Designer", status: "offline", tasksCompleted: 10, tasksInProgress: 1 },
]

const MOCK_ACTIVITIES: RecentActivity[] = [
    { id: "1", user: "Sharon", action: "completed", target: "API Integration task", time: "2 min ago" },
    { id: "2", user: "Alex", action: "started", target: "Database migration", time: "15 min ago" },
    { id: "3", user: "Jordan", action: "commented on", target: "Sprint planning doc", time: "1 hour ago" },
    { id: "4", user: "Taylor", action: "reviewed", target: "Pull request #142", time: "2 hours ago" },
]

interface TeamOverviewProps {
    teamName?: string
    organizationName?: string
    onNavigateToOrganization?: () => void
    onNavigateToSection?: (section: string) => void
}

export function TeamOverview({
    teamName = "Engineering",
    organizationName = "Wizzle Org",
    onNavigateToOrganization,
    onNavigateToSection
}: TeamOverviewProps) {
    const [activeSprint] = useState({
        name: "Sprint 12",
        startDate: "Dec 23",
        endDate: "Jan 6",
        progress: 68,
        tasksTotal: 24,
        tasksDone: 16
    })

    const getStatusColor = (status: TeamMember['status']) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-amber-500'
            default: return 'bg-gray-400'
        }
    }

    const quickLinks = [
        { label: "My Dashboard", icon: LayoutDashboard, section: "my-dashboard", color: "bg-blue-500/10 text-blue-500" },
        { label: "Sprint Board", icon: FolderKanban, section: "sprint-board", color: "bg-purple-500/10 text-purple-500" },
        { label: "Collaboration Hub", icon: MessageSquare, section: "collaboration", color: "bg-green-500/10 text-green-500" },
        { label: "Analytics", icon: BarChart3, section: "analytics", color: "bg-amber-500/10 text-amber-500" },
    ]

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground/60 pb-2">
                <button
                    onClick={onNavigateToOrganization}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                >
                    <Home className="w-3 h-3" />
                    {organizationName}
                </button>
                <ChevronRight className="w-3 h-3 opacity-30" />
                <span className="text-foreground font-medium">{teamName}</span>
            </nav>

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
                            {teamName[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{teamName}</h1>
                            <p className="text-sm text-muted-foreground">Team Overview • {MOCK_MEMBERS.length} members</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                        <Settings className="w-4 h-4" />
                        Team Settings
                    </Button>
                    <Button size="sm" className="gap-2 h-9 shadow-lg shadow-accent/20 text-xs">
                        <Plus className="w-4 h-4" />
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link, i) => (
                    <Card
                        key={i}
                        className="bg-card/30 backdrop-blur-sm border-border/40 group cursor-pointer hover:border-accent/30 hover:bg-card/50 transition-all"
                        onClick={() => onNavigateToSection?.(link.section)}
                    >
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center`}>
                                <link.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{link.label}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Sprint */}
                <Card className="bg-card/20 backdrop-blur-md border-border/40 lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-accent" />
                                Active Sprint
                            </CardTitle>
                            <Badge className="bg-accent/10 text-accent border-accent/20">
                                {activeSprint.name}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {activeSprint.startDate} - {activeSprint.endDate}
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="font-semibold">{activeSprint.tasksDone}</span>
                                <span className="text-muted-foreground">/ {activeSprint.tasksTotal} tasks</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Sprint Progress</span>
                                <span className="font-bold text-accent">{activeSprint.progress}%</span>
                            </div>
                            <Progress value={activeSprint.progress} className="h-2" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="text-center p-3 rounded-lg bg-muted/20">
                                <div className="text-xl font-bold text-green-500">16</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Done</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/20">
                                <div className="text-xl font-bold text-blue-500">5</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/20">
                                <div className="text-xl font-bold text-orange-500">3</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Backlog</div>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-2"
                            variant="outline"
                            onClick={() => onNavigateToSection?.('sprint-board')}
                        >
                            View Sprint Board
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-card/20 backdrop-blur-md border-border/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_ACTIVITIES.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <Avatar className="w-7 h-7">
                                        <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">
                                            {activity.user[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs">
                                            <span className="font-semibold">{activity.user}</span>
                                            {' '}{activity.action}{' '}
                                            <span className="text-accent">{activity.target}</span>
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card className="bg-card/20 backdrop-blur-md border-border/40">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            Team Members
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {MOCK_MEMBERS.filter(m => m.status === 'online').length} online
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_MEMBERS.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                            >
                                <div className="relative">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="bg-accent/10 text-accent font-bold">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-green-500">{member.tasksCompleted}</p>
                                    <p className="text-[10px] text-muted-foreground">completed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
