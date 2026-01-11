"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { createOrganization } from "@/lib/firestore-service"
import { Building2, Loader2, Shield } from "lucide-react"

interface CreateOrganizationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (orgId: string) => void
}

export function CreateOrganizationModal({ isOpen, onClose, onSuccess }: CreateOrganizationModalProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [name, setName] = useState("")
    const [domain, setDomain] = useState("")
    const [allowSelfSignup, setAllowSelfSignup] = useState(false)
    const [requireApproval, setRequireApproval] = useState(true)
    const [creating, setCreating] = useState(false)

    const handleCreate = async () => {
        if (!name.trim() || !user) return

        setCreating(true)
        try {
            const orgId = await createOrganization(
                user.uid,
                name.trim(),
                user.email || "",
                user.displayName || "User",
                domain.trim() || undefined,
                {
                    allowSelfSignup,
                    requireApproval,
                }
            )

            toast({
                title: "Organization Created!",
                description: `${name} has been created successfully`,
            })

            onSuccess(orgId)
            onClose()

            // Reset form
            setName("")
            setDomain("")
            setAllowSelfSignup(false)
            setRequireApproval(true)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create organization",
                variant: "destructive"
            })
        } finally {
            setCreating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Create Organization
                    </DialogTitle>
                    <DialogDescription>
                        Create a new organization for your team. Only super admins can do this.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name *</Label>
                        <Input
                            id="org-name"
                            placeholder="Wizzle"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            The name of your company or team
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domain">Email Domain (Optional)</Label>
                        <Input
                            id="domain"
                            placeholder="wizzle.ai"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Users with this email domain can request to join
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="self-signup" className="text-sm font-medium">
                                    Allow Self Signup
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Users with matching email domain can join without invite
                                </p>
                            </div>
                            <Switch
                                id="self-signup"
                                checked={allowSelfSignup}
                                onCheckedChange={setAllowSelfSignup}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="require-approval" className="text-sm font-medium">
                                    Require Approval
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Join requests need admin approval before access
                                </p>
                            </div>
                            <Switch
                                id="require-approval"
                                checked={requireApproval}
                                onCheckedChange={setRequireApproval}
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <Shield className="w-4 h-4 text-accent mt-0.5" />
                        <div className="flex-1 text-xs text-muted-foreground">
                            <p className="font-semibold text-foreground mb-1">Super Admin Only</p>
                            <p>Only users with super admin privileges can create organizations. You'll be set as the organization owner.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={creating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!name.trim() || creating}
                        className="flex-1 gap-2"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Building2 className="w-4 h-4" />
                                Create Organization
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
