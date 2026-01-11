"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getUserOrganizations, OrganizationDoc, isSuperAdmin } from "@/lib/firestore-service"
import { Building2, ChevronDown, Plus, Check, Loader2 } from "lucide-react"
import { CreateOrganizationModal } from "./create-organization-modal"

interface OrganizationSelectorProps {
    selectedOrgId?: string
    onSelectOrg: (orgId: string) => void
}

export function OrganizationSelector({ selectedOrgId, onSelectOrg }: OrganizationSelectorProps) {
    const { user } = useAuth()
    const { toast } = useToast()
    const [organizations, setOrganizations] = useState<OrganizationDoc[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [canCreateOrg, setCanCreateOrg] = useState(false)

    useEffect(() => {
        if (!user) return

        const fetchOrganizations = async () => {
            try {
                const orgs = await getUserOrganizations(user.uid)
                setOrganizations(orgs)

                // Auto-select first org if none selected
                if (!selectedOrgId && orgs.length > 0) {
                    onSelectOrg(orgs[0].id)
                }

                // Check if user is super admin
                const isSuperAdminUser = await isSuperAdmin(user.uid)
                setCanCreateOrg(isSuperAdminUser)
            } catch (error) {
                console.error('Error fetching organizations:', error)
                toast({
                    title: "Error",
                    description: "Failed to load organizations",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchOrganizations()
    }, [user])

    const handleCreateSuccess = async (orgId: string) => {
        // Refresh organizations
        if (!user) return
        const orgs = await getUserOrganizations(user.uid)
        setOrganizations(orgs)
        onSelectOrg(orgId)
    }

    const selectedOrg = organizations.find(org => org.id === selectedOrgId)

    if (loading) {
        return (
            <Button variant="outline" disabled className="w-full justify-between">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </div>
            </Button>
        )
    }

    if (organizations.length === 0) {
        return (
            <>
                <Button
                    variant="outline"
                    onClick={() => canCreateOrg ? setIsCreateModalOpen(true) : null}
                    disabled={!canCreateOrg}
                    className="w-full justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>
                            {canCreateOrg ? "Create Organization" : "No Organizations"}
                        </span>
                    </div>
                    {canCreateOrg && <Plus className="w-4 h-4" />}
                </Button>

                {!canCreateOrg && (
                    <p className="text-xs text-muted-foreground mt-2">
                        You need to be invited to an organization or be a super admin to create one.
                    </p>
                )}

                <CreateOrganizationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            </>
        )
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                                {selectedOrg?.name || "Select Organization"}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px]">
                    <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {organizations.map((org) => (
                        <DropdownMenuItem
                            key={org.id}
                            onClick={() => onSelectOrg(org.id)}
                            className="flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Building2 className="w-4 h-4 shrink-0" />
                                <span className="truncate">{org.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {org.superAdmins?.includes(user?.uid || '') && (
                                    <Badge variant="outline" className="text-xs">
                                        Admin
                                    </Badge>
                                )}
                                {selectedOrgId === org.id && (
                                    <Check className="w-4 h-4 text-accent" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}

                    {canCreateOrg && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 cursor-pointer text-accent"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create New Organization</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateOrganizationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    )
}

// Compact version for use in headers/navbars
export function OrganizationSelectorCompact({ selectedOrgId, onSelectOrg }: OrganizationSelectorProps) {
    const { user } = useAuth()
    const [organizations, setOrganizations] = useState<OrganizationDoc[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchOrganizations = async () => {
            try {
                const orgs = await getUserOrganizations(user.uid)
                setOrganizations(orgs)

                if (!selectedOrgId && orgs.length > 0) {
                    onSelectOrg(orgs[0].id)
                }
            } catch (error) {
                console.error('Error fetching organizations:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrganizations()
    }, [user])

    const selectedOrg = organizations.find(org => org.id === selectedOrgId)

    if (loading || organizations.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">
                        {selectedOrg?.name || "Select Org"}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => onSelectOrg(org.id)}
                        className="flex items-center justify-between"
                    >
                        <span>{org.name}</span>
                        {selectedOrgId === org.id && (
                            <Check className="w-4 h-4 text-accent" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
