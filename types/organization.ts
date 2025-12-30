// Organization and Team Access Control Types

export type UserRole = 'super_admin' | 'org_admin' | 'team_admin' | 'member' | 'viewer'

export type OrganizationMember = {
    userId: string
    email: string
    name: string
    role: UserRole
    joinedAt: Date
    invitedBy: string
}

export type Organization = {
    id: string
    name: string
    domain?: string // e.g., "wizzle.ai" - only users with this email domain can request access
    createdBy: string
    createdAt: Date
    updatedAt: Date
    settings: {
        allowSelfSignup: boolean // If true, users with matching domain can join
        requireApproval: boolean // If true, join requests need admin approval
        maxMembers?: number
    }
    members: OrganizationMember[]
    superAdmins: string[] // User IDs who can manage everything
}

export type TeamMember = {
    userId: string
    email: string
    name: string
    role: 'admin' | 'member' | 'viewer'
    joinedAt: Date
}

export type Team = {
    id: string
    orgId: string
    name: string
    description?: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    members: TeamMember[]
}

export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export type OrganizationInvite = {
    id: string
    orgId: string
    orgName: string
    teamId?: string
    teamName?: string
    email: string
    role: UserRole
    invitedBy: string
    invitedByName: string
    status: InviteStatus
    message?: string
    expiresAt: Date
    createdAt: Date
    acceptedAt?: Date
}

export type JoinRequest = {
    id: string
    orgId: string
    userId: string
    email: string
    name: string
    message?: string
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: Date
    reviewedBy?: string
    reviewedAt?: Date
}

// Check if user has permission to access organization
export function canAccessOrganization(
    org: Organization,
    userId: string
): boolean {
    return (
        org.superAdmins.includes(userId) ||
        org.members.some(m => m.userId === userId)
    )
}

// Check if user is org admin
export function isOrgAdmin(org: Organization, userId: string): boolean {
    return (
        org.superAdmins.includes(userId) ||
        org.members.some(m => m.userId === userId && (m.role === 'org_admin' || m.role === 'super_admin'))
    )
}

// Check if user can invite others
export function canInviteToOrg(org: Organization, userId: string): boolean {
    return isOrgAdmin(org, userId)
}

// Check if user can create teams
export function canCreateTeam(org: Organization, userId: string): boolean {
    return isOrgAdmin(org, userId)
}

// Check if email matches organization domain
export function matchesOrgDomain(email: string, domain?: string): boolean {
    if (!domain) return false
    const emailDomain = email.split('@')[1]
    return emailDomain === domain
}
