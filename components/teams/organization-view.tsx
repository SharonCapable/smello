"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Building2,
    Settings,
    ChevronRight,
    Plus,
    Search,
    LayoutGrid,
    Users,
    Loader2
} from "lucide-react"
import {
    getOrganizationTeams,
    isOrganizationAdmin,
    createTeam,
    TeamDoc
} from "@/lib/firestore-service"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AdminMemberView } from "./admin-member-view"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OrganizationViewProps {
    organizationId: string
    organizationName: string
    onNavigateToTeam?: (teamId: string, teamName: string) => void
    onNavigateBack?: () => void
}

export function OrganizationView({
    organizationId,
    organizationName,
    onNavigateToTeam,
    onNavigateBack
}: OrganizationViewProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams')
    const [teams, setTeams] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userRole, setUserRole] = useState<"member" | "org_admin" | "super_admin" | "viewer">("member")
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)

    // Create Team State
    const [newTeamName, setNewTeamName] = useState("")
    const [newTeamDesc, setNewTeamDesc] = useState("")
    const [isCreatingTeam, setIsCreatingTeam] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            if (!organizationId || !user) return

            setIsLoading(true)
            try {
                // Fetch Teams
                const teamsData = await getOrganizationTeams(organizationId)
                setTeams(teamsData)

                // Check Admin Status (Simplified for now - strictly checking if admin)
                const isAdmin = await isOrganizationAdmin(organizationId, user.uid)
                setUserRole(isAdmin ? 'org_admin' : 'member')
            } catch (error) {
                console.error("Error loading organization data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load organization data",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [organizationId, user])

    const handleCreateTeam = async () => {
        if (!user || !newTeamName.trim()) return

        setIsCreatingTeam(true)
        try {
            await createTeam(organizationId, newTeamName, newTeamDesc, user.uid)
            toast({
                title: "Success",
                description: "Team created successfully"
            })
            setIsCreateTeamOpen(false)
            setNewTeamName("")
            setNewTeamDesc("")

            // Reload teams
            const teamsData = await getOrganizationTeams(organizationId)
            setTeams(teamsData)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create team",
                variant: "destructive"
            })
        } finally {
            setIsCreatingTeam(false)
        }
    }

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
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
                {userRole === 'org_admin' && (
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-2 h-9 shadow-lg shadow-accent/20 text-xs">
                                    <Plus className="w-4 h-4" />
                                    Create Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Team</DialogTitle>
                                    <DialogDescription>
                                        Create a new team within {organizationName} to organize projects and members.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Team Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Engineering, Marketing"
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea
                                            id="desc"
                                            placeholder="What will this team work on?"
                                            value={newTeamDesc}
                                            onChange={(e) => setNewTeamDesc(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateTeam} disabled={!newTeamName.trim() || isCreatingTeam}>
                                        {isCreatingTeam && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Create Team
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Content Tabs */}
            <div className="flex flex-col space-y-6">
                {/* Tab Switcher */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab('teams')}
                            className={`gap-2 ${activeTab === 'teams' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Teams
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab('members')}
                            className={`gap-2 ${activeTab === 'members' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                        >
                            <Users className="w-4 h-4" />
                            Members & Invites
                        </Button>
                    </div>

                    {activeTab === 'teams' && (
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teams..."
                                className="pl-8 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {activeTab === 'teams' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <Card
                                key={team.id}
                                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                                onClick={() => onNavigateToTeam?.(team.id, team.name)}
                            >
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl`}>
                                            {team.name[0]}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {team.description || "No description provided"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{0} members</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <LayoutGrid className="w-3 h-3" />
                                            <span>{0} projects</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {userRole === 'org_admin' && (
                            <Button
                                variant="outline"
                                className="h-full min-h-[180px] border-dashed flex flex-col gap-4 text-muted-foreground hover:text-primary hover:border-primary/50"
                                onClick={() => setIsCreateTeamOpen(true)}
                            >
                                <Plus className="w-8 h-8" />
                                <span>Create New Team</span>
                            </Button>
                        )}

                        {filteredTeams.length === 0 && userRole !== 'org_admin' && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No teams found in this organization.
                            </div>
                        )}
                    </div>
                ) : (
                    <AdminMemberView
                        organizationId={organizationId}
                        organizationName={organizationName}
                        currentUserRole={userRole}
                    />
                )}
            </div>
        </div>
    )
}
