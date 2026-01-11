"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    Settings,
    LogOut,
    Plus,
    Search,
    Loader2,
    MoreVertical,
    Shield,
    Mail,
    ChevronRight,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createOrganization } from "@/lib/firestore-service"

// --- Types ---
interface UserData {
    uid: string
    email: string
    displayName: string
    role: string
    lastSignInTime: string
}

interface OrgData {
    id: string
    name: string
    domain?: string
    createdAt: any
    _count?: { members: number }
}

export function AdminDashboard() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'organizations' | 'billing' | 'configure'>('overview')
    const [isLoading, setIsLoading] = useState(false)

    // Data States
    const [usersList, setUsersList] = useState<UserData[]>([])
    const [orgList, setOrgList] = useState<OrgData[]>([])
    const [stats, setStats] = useState({ totalUsers: 0, totalOrgs: 0, activeToday: 0 })

    // UI States
    const [selectedOrg, setSelectedOrg] = useState<OrgData | null>(null) // For drilling down
    const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
    const [newOrgName, setNewOrgName] = useState("")
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        setIsLoading(true)
        try {
            // Parallel fetch
            const [usersRes, orgsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/organizations')
            ])

            const usersData = await usersRes.json()
            const orgsData = await orgsRes.json()

            if (usersData.users) {
                setUsersList(usersData.users)
                setStats(prev => ({ ...prev, totalUsers: usersData.users.length }))
            }

            if (orgsData.organizations) {
                setOrgList(orgsData.organizations)
                setStats(prev => ({ ...prev, totalOrgs: orgsData.organizations.length }))
            }

        } catch (e) {
            console.error("Failed to load dashboard data", e)
            toast({ title: "Error", description: "Could not load dashboard data", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateOrg = async () => {
        if (!newOrgName || !user) return
        try {
            await createOrganization(user.uid, newOrgName, user.email || "", user.displayName || "Admin")
            toast({ title: "Organization Created", description: `${newOrgName} is ready.` })
            setNewOrgName("")
            setIsCreateOrgOpen(false)
            loadDashboardData() // Refresh list
        } catch (e: any) {
            console.error(e)
            toast({ title: "Failed", description: e.message, variant: "destructive" })
        }
    }

    const handleInviteUserToOrg = async () => {
        if (!selectedOrg || !inviteEmail || !user) return
        try {
            const res = await fetch('/api/organizations/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orgId: selectedOrg.id,
                    email: inviteEmail,
                    role: 'member',
                    invitedBy: user.uid,
                    invitedByName: user.displayName || 'Admin'
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to invite")

            // Success - Show Copy Link UI (Simulated)
            // As we don't have email service, we guide the Admin to send the link.

            toast({
                title: "Permission Granted",
                description: "The user has been authorized to join. Copy the link below to send to them manually.",
                action: (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            navigator.clipboard.writeText(`Hi! I've invited you to join ${selectedOrg.name} on Smello. Please login here: ${window.location.origin}`)
                            toast({ title: "Copied!", description: "Invitation text copied to clipboard." })
                        }}
                    >
                        Copy Invite Text
                    </Button>
                )
            })

            setInviteEmail("")
            setIsInviteOpen(false)
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        }
    }

    const renderSidebar = () => (
        <div className="w-64 border-r bg-card/50 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Shield className="w-6 h-6 text-primary" />
                    <span>Admin</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Button
                    variant={activeSection === 'overview' ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => { setActiveSection('overview'); setSelectedOrg(null); }}
                >
                    <LayoutDashboard className="w-4 h-4" /> Overview
                </Button>
                <Button
                    variant={activeSection === 'users' ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => { setActiveSection('users'); setSelectedOrg(null); }}
                >
                    <Users className="w-4 h-4" /> Users
                </Button>
                <Button
                    variant={activeSection === 'organizations' ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => { setActiveSection('organizations'); setSelectedOrg(null); }}
                >
                    <Building2 className="w-4 h-4" /> Organizations
                </Button>
                <Button
                    variant={activeSection === 'billing' ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection('billing')}
                >
                    <CreditCard className="w-4 h-4" /> Billing <Badge variant="outline" className="ml-auto text-[10px]">Beta</Badge>
                </Button>
                <Button
                    variant={activeSection === 'configure' ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection('configure')}
                >
                    <Settings className="w-4 h-4" /> Configure
                </Button>
            </nav>

            <div className="p-4 border-t mt-auto">
                <Button variant="outline" className="w-full gap-2 text-muted-foreground" onClick={() => router.push('/')}>
                    <LogOut className="w-3 h-3" /> Exit Admin
                </Button>
            </div>
        </div>
    )

    const renderHeader = (title: string, action?: React.ReactNode) => (
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {action}
        </div>
    )

    // --- Views ---

    const OverviewView = () => (
        <div className="space-y-6">
            {renderHeader("Dashboard Overview")}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrgs}</div>
                        <p className="text-xs text-muted-foreground">All active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Healthy</div>
                        <p className="text-xs text-muted-foreground">All services operational</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const UsersView = () => (
        <div className="space-y-6">
            {renderHeader("All Users")}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Platform Users</CardTitle>
                            <CardDescription>View all users registered on Smello (PM & Teams)</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersList.map((u) => (
                                <TableRow key={u.uid}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://avatar.vercel.sh/${u.uid}`} />
                                            <AvatarFallback>{u.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{u.displayName}</div>
                                            <div className="text-xs text-muted-foreground">{u.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'Super Admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString() : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )

    const OrganizationsView = () => {
        // If an org is selected, show detail view (Manage Org Users)
        if (selectedOrg) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrg(null)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{selectedOrg.name}</h1>
                        <Badge variant="outline">Managed Organization</Badge>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="font-mono">{selectedOrg.id}</span>
                                    <span className="text-muted-foreground">Created:</span>
                                    <span suppressHydrationWarning>{selectedOrg.createdAt?.seconds ? new Date(selectedOrg.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                    <span className="text-muted-foreground">Domain:</span>
                                    <span>{selectedOrg.domain || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Invite Users</CardTitle>
                                    <CardDescription>Add new members to this organization</CardDescription>
                                </div>
                                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm"><Mail className="w-4 h-4 mr-2" /> Invite</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite to {selectedOrg.name}</DialogTitle>
                                            <DialogDescription>Send an email invitation to join this workspace.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Email Address</div>
                                                <Input
                                                    placeholder="colleague@example.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleInviteUserToOrg}>Send Invitation</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Users will receive an email (or can check validation) to join.
                                    They must sign in with the invited email address.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placeholder for Member List within Org - could reuse AdminMemberView or similar logic if needed */}
                </div>
            )
        }

        return (
            <div className="space-y-6">
                {renderHeader("Organizations", (
                    <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Create Organization</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Organization</DialogTitle>
                                <DialogDescription>Set up a new workspace tenant.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Organization Name</div>
                                    <Input
                                        placeholder="e.g. Acme Corp"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateOrg}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ))}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {orgList.map(org => (
                        <Card
                            key={org.id}
                            className="cursor-pointer hover:border-primary transition-colors group"
                            onClick={() => setSelectedOrg(org)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{org.name}</CardTitle>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                    <span>ID: {org.id}</span>
                                    <span>Domain: {org.domain || 'All'}</span>
                                    <span className="mt-2 text-xs bg-muted py-1 px-2 rounded w-fit">Click to manage users</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {renderSidebar()}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {activeSection === 'overview' && <OverviewView />}
                {activeSection === 'users' && <UsersView />}
                {activeSection === 'organizations' && <OrganizationsView />}
                {activeSection === 'billing' && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                        <CreditCard className="w-12 h-12 mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold">Billing & Plans</h2>
                        <p>Subscription management coming soon.</p>
                    </div>
                )}
                {activeSection === 'configure' && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                        <Settings className="w-12 h-12 mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold">Global Configuration</h2>
                        <p>System settings coming soon.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
