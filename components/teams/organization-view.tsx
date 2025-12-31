"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Building2,
    Users,
    Settings,
    ChevronRight,
    Plus,
    Search,
    Shield,
    Crown,
    Mail,
    Clock,
    TrendingUp,
    Zap,
    LayoutGrid,
    Calendar
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Team {
    id: string
    name: string
    description: string
    memberCount: number
    activeProjects: number
    color: string
}

interface OrgMember {
    id: string
    name: string
    email: string
    role: 'Super Admin' | 'Admin' | 'Member'
    avatar?: string
    joinedDate: string
}

const MOCK_TEAMS: Team[] = [
    { id: "1", name: "Engineering", description: "Product development and infrastructure", memberCount: 8, activeProjects: 4, color: "bg-blue-500" },
    { id: "2", name: "Design", description: "UX/UI and brand identity", memberCount: 5, activeProjects: 3, color: "bg-purple-500" },
    { id: "3", name: "Marketing", description: "Growth and communications", memberCount: 4, activeProjects: 2, color: "bg-green-500" },
    { id: "4", name: "Operations", description: "Process and logistics", memberCount: 3, activeProjects: 1, color: "bg-orange-500" },
]

const MOCK_MEMBERS: OrgMember[] = [
    { id: "1", name: "Sharon Wizzle", email: "sharon@wizzle.org", role: "Super Admin", joinedDate: "2024-01-15" },
    { id: "2", name: "Alex Chen", email: "alex@wizzle.org", role: "Admin", joinedDate: "2024-02-20" },
    { id: "3", name: "Jordan Smith", email: "jordan@wizzle.org", role: "Member", joinedDate: "2024-03-10" },
    { id: "4", name: "Taylor Wilson", email: "taylor@wizzle.org", role: "Member", joinedDate: "2024-04-05" },
    { id: "5", name: "Riley Davis", email: "riley@wizzle.org", role: "Member", joinedDate: "2024-05-12" },
]

interface OrganizationViewProps {
    organizationName?: string
    onNavigateToTeam?: (teamId: string, teamName: string) => void
    onNavigateBack?: () => void
}

export function OrganizationView({
    organizationName = "Wizzle Org",
    onNavigateToTeam,
    onNavigateBack
}: OrganizationViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams')

    const filteredTeams = MOCK_TEAMS.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredMembers = MOCK_MEMBERS.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleIcon = (role: OrgMember['role']) => {
        switch (role) {
            case 'Super Admin': return <Crown className="w-3 h-3 text-amber-500" />
            case 'Admin': return <Shield className="w-3 h-3 text-blue-500" />
            default: return <Users className="w-3 h-3 text-muted-foreground" />
        }
    }

    const getRoleBadgeColor = (role: OrgMember['role']) => {
        switch (role) {
            case 'Super Admin': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'Admin': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/20">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{organizationName}</h1>
                            <p className="text-sm text-muted-foreground">Organization Overview</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                        <Settings className="w-4 h-4" />
                        Org Settings
                    </Button>
                    <Button size="sm" className="gap-2 h-9 shadow-lg shadow-accent/20 text-xs">
                        <Plus className="w-4 h-4" />
                        Create Team
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Teams", value: MOCK_TEAMS.length, icon: LayoutGrid, color: "text-blue-500" },
                    { label: "Total Members", value: MOCK_MEMBERS.length, icon: Users, color: "text-purple-500" },
                    { label: "Active Projects", value: MOCK_TEAMS.reduce((acc, t) => acc + t.activeProjects, 0), icon: Zap, color: "text-amber-500" },
                    { label: "This Week", value: "+12%", icon: TrendingUp, color: "text-green-500" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/30 backdrop-blur-sm border-border/40">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2 border-y border-border/40">
                <div className="flex items-center gap-4 flex-grow max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder={activeTab === 'teams' ? "Search teams..." : "Search members..."}
                            className="pl-9 h-10 bg-muted/20 border-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20 h-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('teams')}
                        className={`h-8 px-4 text-xs gap-2 font-semibold ${activeTab === 'teams' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Teams
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('members')}
                        className={`h-8 px-4 text-xs gap-2 font-semibold ${activeTab === 'members' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        Members
                    </Button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'teams' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTeams.map((team) => (
                        <Card
                            key={team.id}
                            className="bg-card/30 backdrop-blur-sm border-border/40 group cursor-pointer hover:border-accent/30 hover:bg-card/50 transition-all"
                            onClick={() => onNavigateToTeam?.(team.id, team.name)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${team.color} flex items-center justify-center text-white font-bold text-lg`}>
                                            {team.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{team.name}</h3>
                                            <p className="text-sm text-muted-foreground">{team.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{team.memberCount} members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>{team.activeProjects} active projects</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add Team Card */}
                    <Card className="bg-card/10 border-dashed border-border/60 cursor-pointer hover:bg-card/30 hover:border-accent/30 transition-all">
                        <CardContent className="p-5 flex items-center justify-center h-full min-h-[140px]">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">Create New Team</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMembers.map((member) => (
                        <Card key={member.id} className="bg-card/30 backdrop-blur-sm border-border/40 hover:bg-card/50 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="bg-accent/10 text-accent font-bold">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{member.name}</h3>
                                                <Badge variant="outline" className={`text-[10px] gap-1 ${getRoleBadgeColor(member.role)}`}>
                                                    {getRoleIcon(member.role)}
                                                    {member.role}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Joined {new Date(member.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Invite Member */}
                    <Card className="bg-card/10 border-dashed border-border/60 cursor-pointer hover:bg-card/30 hover:border-accent/30 transition-all">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Invite New Member</p>
                                <p className="text-xs text-muted-foreground/60">Add team members to your organization</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
