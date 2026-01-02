"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Building2, Users, Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Briefcase } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

interface JoinOrganizationProps {
    onJoinSuccess: (orgId: string, teamId: string, orgName: string, teamName: string) => void
    onBackToPM: () => void
}

export function JoinOrganization({ onJoinSuccess, onBackToPM }: JoinOrganizationProps) {
    const { user } = useUser()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [foundOrg, setFoundOrg] = useState<any>(null)
    const [orgTeams, setOrgTeams] = useState<any[]>([])
    const [selectedTeamId, setSelectedTeamId] = useState("")
    const [isJoining, setIsJoining] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Debounced search for organization
    useEffect(() => {
        if (searchQuery.length < 3) {
            setFoundOrg(null)
            setOrgTeams([])
            setHasSearched(false)
            return
        }

        const searchOrg = async () => {
            setIsSearching(true)
            setHasSearched(true)
            try {
                const { findOrganizationByName, getOrganizationTeams } = await import("@/lib/firestore-service")
                const org = await findOrganizationByName(searchQuery)
                setFoundOrg(org)
                if (org) {
                    const teams = await getOrganizationTeams(org.id)
                    setOrgTeams(teams)
                } else {
                    setOrgTeams([])
                }
            } catch (e) {
                console.error("Search failed", e)
                setFoundOrg(null)
                setOrgTeams([])
            } finally {
                setIsSearching(false)
            }
        }

        const timer = setTimeout(searchOrg, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleJoinOrganization = async () => {
        if (!foundOrg || !selectedTeamId || !user) return

        setIsJoining(true)
        try {
            const { joinOrganizationWithTeam } = await import("@/lib/firestore-service")

            await joinOrganizationWithTeam(
                foundOrg.id,
                selectedTeamId,
                user.id,
                user.primaryEmailAddress?.emailAddress || "",
                user.fullName || user.firstName || "User"
            )

            const selectedTeam = orgTeams.find(t => t.id === selectedTeamId)

            toast({
                title: "Welcome to the team!",
                description: `You've successfully joined ${selectedTeam?.name || "the team"} at ${foundOrg.name}.`,
            })

            onJoinSuccess(foundOrg.id, selectedTeamId, foundOrg.name, selectedTeam?.name || "")
        } catch (error: any) {
            console.error("Failed to join organization", error)
            toast({
                title: "Failed to join",
                description: error.message || "Could not join the organization. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border">
                <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Join Your Team</CardTitle>
                    <CardDescription className="text-base">
                        Search for your organization to join an existing team workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <Label htmlFor="org-search" className="text-base">Organization Name</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="org-search"
                                placeholder="Type your organization name..."
                                className="pl-10 h-12 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Search Results */}
                    {hasSearched && !isSearching && (
                        <div className="space-y-4">
                            {foundOrg ? (
                                <>
                                    {/* Found Organization */}
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">Organization Found</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-semibold">{foundOrg.name}</span>
                                            {foundOrg.domain && (
                                                <span className="text-sm text-muted-foreground">({foundOrg.domain})</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Team Selection */}
                                    {orgTeams.length > 0 ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="team-select" className="text-base">Select Team to Join</Label>
                                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                                <SelectTrigger id="team-select" className="h-12 text-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                        <SelectValue placeholder="Choose a team" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orgTeams.map((team) => (
                                                        <SelectItem key={team.id} value={team.id} className="text-base">
                                                            {team.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                                <AlertCircle className="w-5 h-5" />
                                                <span>No teams available in this organization yet.</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Join Button */}
                                    <Button
                                        size="lg"
                                        className="w-full h-12 text-base"
                                        onClick={handleJoinOrganization}
                                        disabled={isJoining || !selectedTeamId}
                                    >
                                        {isJoining ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <Users className="w-4 h-4 mr-2" />
                                                Join {selectedTeamId ? orgTeams.find(t => t.id === selectedTeamId)?.name : "Team"}
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                /* Organization Not Found */
                                <div className="p-4 bg-muted/50 border rounded-lg text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>Organization not found</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        We couldn't find an organization matching "{searchQuery}".
                                        Organizations must be created by an administrator.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Contact your organization admin or continue using PM Tools.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hint when not searching */}
                    {!hasSearched && searchQuery.length < 3 && searchQuery.length > 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                            Type at least 3 characters to search...
                        </p>
                    )}

                    {/* Back to PM Tools */}
                    <div className="pt-4 border-t">
                        <button
                            onClick={onBackToPM}
                            className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Continue with PM Tools instead</span>
                        </button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Can't find your organization? You can use PM Tools as an individual
                            and join a team later when it's available.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
