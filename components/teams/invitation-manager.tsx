"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
    sendOrganizationInvite,
    getPendingInvitesForUser,
    acceptOrganizationInvite,
    InviteDoc
} from "@/lib/firestore-service"
import { Mail, Check, X, Clock, Copy, Send, Users, Download, Plus, Trash2 } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface InvitationManagerProps {
    organizationId: string
    organizationName: string
}

interface BulkInvite {
    email: string
    role: "member" | "org_admin" | "team_admin" | "viewer"
    inviteLink?: string
    status?: 'pending' | 'sent' | 'error'
    error?: string
}

export function InvitationManager({ organizationId, organizationName }: InvitationManagerProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [mode, setMode] = useState<'single' | 'bulk'>('single')

    // Single invite state
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"member" | "org_admin" | "team_admin" | "viewer">("member")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [inviteLink, setInviteLink] = useState("")

    // Bulk invite state
    const [bulkInvites, setBulkInvites] = useState<BulkInvite[]>([
        { email: "", role: "member" }
    ])
    const [bulkSending, setBulkSending] = useState(false)

    const handleSendInvite = async () => {
        if (!email.trim() || !user) return

        setSending(true)
        try {
            const inviteId = await sendOrganizationInvite(organizationId, {
                orgId: organizationId,
                orgName: organizationName,
                email: email.toLowerCase().trim(),
                role,
                invitedBy: user.uid,
                invitedByName: user.displayName || 'User',
                message: message.trim() || undefined,
            })

            const link = `${window.location.origin}/accept-invite?id=${inviteId}`
            setInviteLink(link)

            toast({
                title: "Invitation Sent!",
                description: `Invitation sent to ${email}. Share the link below with them.`,
            })

            setEmail("")
            setMessage("")
        } catch (error: any) {
            console.error('Error sending invite:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to send invitation",
                variant: "destructive"
            })
        } finally {
            setSending(false)
        }
    }

    const handleBulkInvite = async () => {
        if (!user) return

        const validInvites = bulkInvites.filter(inv => inv.email.trim())
        if (validInvites.length === 0) {
            toast({
                title: "No Emails",
                description: "Please add at least one email address",
                variant: "destructive"
            })
            return
        }

        setBulkSending(true)
        const updatedInvites = [...bulkInvites]

        for (let i = 0; i < updatedInvites.length; i++) {
            const invite = updatedInvites[i]
            if (!invite.email.trim()) continue

            try {
                const inviteId = await sendOrganizationInvite(organizationId, {
                    orgId: organizationId,
                    orgName: organizationName,
                    email: invite.email.toLowerCase().trim(),
                    role: invite.role,
                    invitedBy: user.uid,
                    invitedByName: user.displayName || 'User',
                })

                const link = `${window.location.origin}/accept-invite?id=${inviteId}`
                updatedInvites[i] = {
                    ...invite,
                    inviteLink: link,
                    status: 'sent'
                }
                setBulkInvites([...updatedInvites])
            } catch (error: any) {
                updatedInvites[i] = {
                    ...invite,
                    status: 'error',
                    error: error.message
                }
                setBulkInvites([...updatedInvites])
            }
        }

        setBulkSending(false)
        toast({
            title: "Bulk Invites Sent!",
            description: `Generated ${validInvites.length} invitation links`,
        })
    }

    const addBulkInvite = () => {
        setBulkInvites([...bulkInvites, { email: "", role: "member" }])
    }

    const removeBulkInvite = (index: number) => {
        setBulkInvites(bulkInvites.filter((_, i) => i !== index))
    }

    const updateBulkInvite = (index: number, field: keyof BulkInvite, value: any) => {
        const updated = [...bulkInvites]
        updated[index] = { ...updated[index], [field]: value }
        setBulkInvites(updated)
    }

    const copyAllLinks = () => {
        const links = bulkInvites
            .filter(inv => inv.inviteLink)
            .map(inv => `${inv.email}: ${inv.inviteLink}`)
            .join('\n\n')

        navigator.clipboard.writeText(links)
        toast({
            title: "Copied!",
            description: "All invite links copied to clipboard",
        })
    }

    const exportAsCSV = () => {
        const csv = [
            ['Email', 'Role', 'Invite Link'],
            ...bulkInvites
                .filter(inv => inv.inviteLink)
                .map(inv => [inv.email, inv.role, inv.inviteLink])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${organizationName}-invites.csv`
        a.click()

        toast({
            title: "Exported!",
            description: "Invites exported as CSV",
        })
    }

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink)
        toast({
            title: "Copied!",
            description: "Invite link copied to clipboard",
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Invite Team Members
                </CardTitle>
                <CardDescription>
                    Send invitations to join {organizationName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                        variant={mode === 'single' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('single')}
                        className="flex-1"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Single Invite
                    </Button>
                    <Button
                        variant={mode === 'bulk' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMode('bulk')}
                        className="flex-1"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Bulk Invite
                    </Button>
                </div>

                {mode === 'bulk' ? (
                    /* Bulk Invite Mode */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Team Members</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addBulkInvite}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another
                            </Button>
                        </div>

                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bulkInvites.map((invite, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    type="email"
                                                    placeholder="teammate@example.com"
                                                    value={invite.email}
                                                    onChange={(e) => updateBulkInvite(index, 'email', e.target.value)}
                                                    className="h-9"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={invite.role}
                                                    onValueChange={(v: any) => updateBulkInvite(index, 'role', v)}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="team_admin">Team Admin</SelectItem>
                                                        <SelectItem value="org_admin">Org Admin</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {invite.status === 'sent' && (
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Sent
                                                    </Badge>
                                                )}
                                                {invite.status === 'error' && (
                                                    <Badge variant="outline" className="bg-red-500/10 text-red-600">
                                                        <X className="w-3 h-3 mr-1" />
                                                        Error
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {bulkInvites.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeBulkInvite(index)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Button
                            onClick={handleBulkInvite}
                            disabled={bulkSending}
                            className="w-full gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {bulkSending ? "Generating Links..." : "Generate All Invite Links"}
                        </Button>

                        {/* Results */}
                        {bulkInvites.some(inv => inv.inviteLink) && (
                            <Card className="bg-accent/5 border-accent/20">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">
                                            Generated {bulkInvites.filter(inv => inv.inviteLink).length} Invite Links
                                        </Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyAllLinks}
                                                className="gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy All
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={exportAsCSV}
                                                className="gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Export CSV
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                                        {bulkInvites.filter(inv => inv.inviteLink).map((invite, index) => (
                                            <div key={index} className="p-3 bg-background rounded-lg space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{invite.email}</span>
                                                    <Badge variant="outline" className="text-xs">{invite.role}</Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={invite.inviteLink}
                                                        readOnly
                                                        className="font-mono text-xs h-8"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(invite.inviteLink!)
                                                            toast({ title: "Copied!", description: `Link for ${invite.email} copied` })
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        💡 Copy all links and paste into an email, or export as CSV to share with your team
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Single Invite Mode */
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="teammate@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member - Can view and edit</SelectItem>
                                    <SelectItem value="team_admin">Team Admin - Can manage teams</SelectItem>
                                    <SelectItem value="org_admin">Org Admin - Can invite others</SelectItem>
                                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Personal Message (Optional)</Label>
                            <Textarea
                                id="message"
                                placeholder="Hey! Join our team on Smello..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>

                        <Button
                            onClick={handleSendInvite}
                            disabled={!email.trim() || sending}
                            className="w-full gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {sending ? "Sending..." : "Send Invitation"}
                        </Button>

                        {inviteLink && (
                            <Card className="bg-accent/5 border-accent/20">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold">Invitation Link</Label>
                                        <Badge variant="outline" className="text-xs">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Expires in 7 days
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={inviteLink}
                                            readOnly
                                            className="font-mono text-xs"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyInviteLink}
                                            className="shrink-0"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        💡 Share this link with {email} via email, Slack, or any messaging app
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-semibold mb-2">How it works:</h4>
                            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                <li>Enter the email address of the person you want to invite</li>
                                <li>Choose their role (member, admin, etc.)</li>
                                <li>Click "Send Invitation" to generate a unique invite link</li>
                                <li>Copy and share the link with them via email/Slack/etc.</li>
                                <li>They click the link and accept the invitation</li>
                                <li>They're now part of your organization! 🎉</li>
                            </ol>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// Component to show pending invites for current user
export function PendingInvites() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [invites, setInvites] = useState<InviteDoc[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.email) return

        const fetchInvites = async () => {
            try {
                const pendingInvites = await getPendingInvitesForUser(
                    user.email!
                )
                setInvites(pendingInvites)
            } catch (error) {
                console.error('Error fetching invites:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInvites()
    }, [user])

    const handleAcceptInvite = async (invite: InviteDoc) => {
        if (!user) return

        try {
            await acceptOrganizationInvite(
                invite.id,
                user.uid,
                user.email!,
                user.displayName || 'User'
            )

            toast({
                title: "Welcome!",
                description: `You've joined ${invite.orgName}`,
            })

            // Remove from list
            setInvites(prev => prev.filter(i => i.id !== invite.id))

            // Redirect to team dashboard
            window.location.href = '/team'
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to accept invitation",
                variant: "destructive"
            })
        }
    }

    if (loading) return null
    if (invites.length === 0) return null

    return (
        <Card className="border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Pending Invitations
                </CardTitle>
                <CardDescription>
                    You have {invites.length} pending invitation{invites.length > 1 ? 's' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {invites.map((invite) => (
                    <Card key={invite.id} className="bg-accent/5">
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold">{invite.orgName}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Invited by {invite.invitedByName}
                                    </p>
                                    {invite.message && (
                                        <p className="text-sm mt-2 italic">"{invite.message}"</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{invite.role}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Expires {new Date((invite.expiresAt as any).toDate()).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAcceptInvite(invite)}
                                        className="flex-1 gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    )
}
