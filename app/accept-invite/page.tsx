"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { acceptOrganizationInvite, InviteDoc } from "@/lib/firestore-service"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"

function AcceptInviteContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, isLoaded, signInWithGoogle } = useAuth()
    const [invite, setInvite] = useState<InviteDoc | null>(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const inviteId = searchParams.get('id')

    useEffect(() => {
        if (!inviteId || !db) {
            setError('Invalid invitation link')
            setLoading(false)
            return
        }

        const fetchInvite = async () => {
            try {
                const inviteRef = doc(db as any, 'invites', inviteId)
                const inviteSnap = await getDoc(inviteRef)

                if (!inviteSnap.exists()) {
                    setError('Invitation not found')
                    return
                }

                const inviteData = inviteSnap.data() as InviteDoc

                // Check if expired
                const now = new Date()
                const expiresAt = (inviteData.expiresAt as any).toDate()
                if (now > expiresAt) {
                    setError('This invitation has expired')
                    return
                }

                // Check if already used
                if (inviteData.status !== 'pending') {
                    setError('This invitation has already been used')
                    return
                }

                setInvite(inviteData)
            } catch (err: any) {
                console.error('Error fetching invite:', err)
                setError('Failed to load invitation')
            } finally {
                setLoading(false)
            }
        }

        fetchInvite()
    }, [inviteId])

    const handleAccept = async () => {
        if (!user || !invite) return

        // Check if email matches
        const userEmail = user.email
        if (!userEmail) {
            setError('No email address found for your account')
            return
        }

        if (userEmail.toLowerCase() !== invite.email.toLowerCase()) {
            setError(`This invitation is for ${invite.email}, but you're logged in as ${userEmail}`)
            return
        }

        setAccepting(true)
        try {
            await acceptOrganizationInvite(
                invite.id,
                user.uid,
                userEmail,
                user.displayName || 'User'
            )

            setSuccess(true)

            // Redirect to team dashboard after 2 seconds
            setTimeout(() => {
                router.push('/team')
            }, 2000)
        } catch (err: any) {
            console.error('Error accepting invite:', err)
            setError(err.message || 'Failed to accept invitation')
        } finally {
            setAccepting(false)
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                        <p className="text-sm text-muted-foreground">Loading invitation...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-green-500/20">
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to {invite?.orgName}!</h2>
                        <p className="text-muted-foreground mb-6">
                            You've successfully joined the organization
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to team dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-red-500/20">
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Invalid Invitation</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Button onClick={() => router.push('/')}>
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Organization Invitation
                        </CardTitle>
                        <CardDescription>
                            Please sign in to accept this invitation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {invite && (
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <p className="text-sm">
                                    <span className="font-semibold">{invite.invitedByName}</span> invited you to join
                                </p>
                                <p className="text-lg font-bold">{invite.orgName}</p>
                                {invite.message && (
                                    <p className="text-sm italic text-muted-foreground">
                                        "{invite.message}"
                                    </p>
                                )}
                            </div>
                        )}
                        <Button onClick={() => signInWithGoogle()} className="w-full">
                            Sign In with Google to Continue
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        You're Invited!
                    </CardTitle>
                    <CardDescription>
                        {invite!.invitedByName} invited you to join their organization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-accent/5 rounded-lg space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Organization</p>
                            <p className="text-xl font-bold">{invite!.orgName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Your Role</p>
                            <p className="font-semibold capitalize">{invite!.role.replace('_', ' ')}</p>
                        </div>
                        {invite!.message && (
                            <div>
                                <p className="text-sm text-muted-foreground">Message</p>
                                <p className="text-sm italic">"{invite!.message}"</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Invited by</p>
                            <p className="font-semibold">{invite!.invitedByName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expires</p>
                            <p className="text-sm">
                                {new Date((invite!.expiresAt as any).toDate()).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="flex-1 gap-2"
                        >
                            {accepting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Accepting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Accept Invitation
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            disabled={accepting}
                        >
                            Decline
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        By accepting, you'll gain access to {invite!.orgName}'s projects and team collaboration features
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    )
}
