"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
    getOrganizationMembers,
    getOrganizationInvites,
    removeOrganizationMember,
    revokeOrganizationInvite,
    OrganizationMemberDoc,
    InviteDoc
} from "@/lib/firestore-service"
import { InvitationManager } from "./invitation-manager"
import { Loader2, MoreVertical, Trash2, Shield, User, Clock, Mail, RefreshCw } from "lucide-react"

interface AdminMemberViewProps {
    organizationId: string
    organizationName: string
    currentUserRole: "super_admin" | "org_admin" | "member" | "viewer"
}

export function AdminMemberView({ organizationId, organizationName, currentUserRole }: AdminMemberViewProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("members")
    const [isLoading, setIsLoading] = useState(true)
    const [members, setMembers] = useState<OrganizationMemberDoc[]>([])
    const [invites, setInvites] = useState<InviteDoc[]>([])

    // Dialog states
    const [memberToRemove, setMemberToRemove] = useState<OrganizationMemberDoc | null>(null)
    const [inviteToRevoke, setInviteToRevoke] = useState<InviteDoc | null>(null)

    const canManageMembers = currentUserRole === 'super_admin' || currentUserRole === 'org_admin'

    useEffect(() => {
        loadData()
    }, [organizationId, activeTab])

    const loadData = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'members') {
                const data = await getOrganizationMembers(organizationId)
                setMembers(data)
            } else {
                const data = await getOrganizationInvites(organizationId)
                setInvites(data)
            }
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveMember = async () => {
        if (!memberToRemove) return
        try {
            await removeOrganizationMember(organizationId, memberToRemove.userId)
            setMembers(prev => prev.filter(m => m.userId !== memberToRemove.userId))
            toast({
                title: "Member Removed",
                description: `${memberToRemove.name} has been removed from the organization.`
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to remove member",
                variant: "destructive"
            })
        } finally {
            setMemberToRemove(null)
        }
    }

    const handleRevokeInvite = async () => {
        if (!inviteToRevoke) return
        try {
            await revokeOrganizationInvite(inviteToRevoke.id)
            setInvites(prev => prev.filter(i => i.id !== inviteToRevoke.id))
            toast({
                title: "Invite Revoked",
                description: `Invitation for ${inviteToRevoke.email} has been cancelled.`
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to revoke invite",
                variant: "destructive"
            })
        } finally {
            setInviteToRevoke(null)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // If not admin, just show simple member list without actions
    if (!canManageMembers) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>People in this organization</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.userId}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://avatar.vercel.sh/${member.userId}`} />
                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{member.role.replace('_', ' ')}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">Manage members and invitations for {organizationName}</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="members" className="gap-2">
                        <UsersIcon className="w-4 h-4" />
                        Members
                    </TabsTrigger>
                    <TabsTrigger value="invitations" className="gap-2">
                        <Mail className="w-4 h-4" />
                        Invitations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Members</CardTitle>
                            <CardDescription>
                                {members.length} member{members.length !== 1 ? 's' : ''} in this organization
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.userId}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={`https://avatar.vercel.sh/${member.userId}`} />
                                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{member.name}</div>
                                                            <div className="text-xs text-muted-foreground">{member.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={member.role === 'super_admin' ? 'default' : 'secondary'} className="capitalize">
                                                        {member.role.replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {member.joinedAt ? new Date((member.joinedAt as any).toDate()).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {member.userId !== user?.uid && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => toast({ title: "Change Role", description: "Role editing coming soon" })}>
                                                                    Change Role
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() => setMemberToRemove(member)}
                                                                >
                                                                    Remove Member
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invitations" className="space-y-6">
                    <InvitationManager organizationId={organizationId} organizationName={organizationName} />

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pending Invitations</CardTitle>
                                <CardDescription>Outstanding invites that haven't been accepted yet</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                                <RefreshCw className="w-3 h-3" />
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
                            ) : invites.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No pending invitations
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Sent By</TableHead>
                                            <TableHead>Sent</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invites.map((invite) => (
                                            <TableRow key={invite.id}>
                                                <TableCell className="font-medium">{invite.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">{invite.role}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{invite.invitedByName}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date((invite.createdAt as any).toDate()).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                        onClick={() => setInviteToRevoke(invite)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Remove Member Alert */}
            <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <b>{memberToRemove?.name}</b> from the organization?
                            This action cannot be undone and they will lose access to all team projects.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Revoke Invite Alert */}
            <AlertDialog open={!!inviteToRevoke} onOpenChange={() => setInviteToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invitation for <b>{inviteToRevoke?.email}</b>?
                            The invite link will no longer work.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevokeInvite} className="bg-red-600 hover:bg-red-700">
                            Revoke Invite
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
