import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Firestore documents
export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  onboardingCompleted: boolean;
  selectedPath?: 'pm' | 'team';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectArtifact {
  id: string;
  name: string;
  description?: string;
  product?: any;

  // All project artifacts
  generatedIdeas?: any[];
  selectedIdea?: any;

  prd?: {
    problemStatement?: string;
    userPersona?: string;
    features?: string;
    successMetrics?: string;
    fullDocument?: string;
  };

  research?: any[];
  competitorAnalysis?: any;
  personas?: any[];
  journeyMaps?: any[];

  blueprints?: {
    architecture?: string;
    database?: string;
    api?: string;
  };

  epics?: any[];

  documentContent?: string;
  documentFileName?: string;

  // Metadata
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived?: boolean;
}

export interface UsageStats {
  userId: string;
  operationCount: number;
  operations: {
    type: string;
    timestamp: Timestamp;
    projectId?: string;
    provider?: string;
  }[];
  resetAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ApiKeyStore {
  userId: string;
  geminiKey?: string;
  claudeKey?: string;
  updatedAt: Timestamp;
}

// Team & Sprint Ecosystem
export interface Organization {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  members: { userId: string; role: 'admin' | 'member' }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Sprint {
  id: string;
  orgId: string;
  teamId: string;
  name: string;
  status: 'active' | 'completed' | 'upcoming';
  startDate: Timestamp;
  endDate: Timestamp;
  goal?: string;
  taskIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id: string;
  orgId: string;
  teamId?: string;
  values: {
    title: string;
    status: string;
    priority: string;
    progress?: number;
    tags?: string[];
    assignees?: string[];
    [key: string]: any;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrganizationInvite {
  id: string;
  orgId: string;
  orgName: string;
  invitedBy: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted';
  createdAt: Timestamp;
}

// User Profile Operations
export const createOrUpdateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, {
      uid,
      ...data,
      onboardingCompleted: data.onboardingCompleted || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// Project Operations
export const createProject = async (
  userId: string,
  projectData: Partial<ProjectArtifact>
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const projectRef = doc(db, 'projects', projectId);

  await setDoc(projectRef, {
    ...projectData,
    id: projectId,
    userId,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return projectId;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<ProjectArtifact>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getProject = async (projectId: string): Promise<ProjectArtifact | null> => {
  if (!db) return null;
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    return projectSnap.data() as ProjectArtifact;
  }
  return null;
};

export const getUserProjects = async (userId: string): Promise<ProjectArtifact[]> => {
  if (!db) return [];
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef,
    where('userId', '==', userId),
    where('archived', '==', false),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as ProjectArtifact);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectRef = doc(db, 'projects', projectId);
  // Soft delete by archiving
  await updateDoc(projectRef, {
    archived: true,
    updatedAt: serverTimestamp(),
  });
};

export const hardDeleteProject = async (projectId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
};

// Usage Stats Operations
export const trackUsage = async (
  userId: string,
  operationType: string,
  projectId?: string,
  provider?: string
): Promise<void> => {
  if (!db) return;
  const statsRef = doc(db, 'usageStats', userId);
  const statsSnap = await getDoc(statsRef);

  const operation = {
    type: operationType,
    timestamp: serverTimestamp(),
    projectId,
    provider,
  };

  if (statsSnap.exists()) {
    const currentStats = statsSnap.data() as UsageStats;
    await updateDoc(statsRef, {
      operationCount: currentStats.operationCount + 1,
      operations: [...currentStats.operations, operation],
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(statsRef, {
      userId,
      operationCount: 1,
      operations: [operation],
      resetAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const getUserUsageStats = async (userId: string): Promise<UsageStats | null> => {
  if (!db) return null;
  const statsRef = doc(db, 'usageStats', userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    return statsSnap.data() as UsageStats;
  }
  return null;
};

// API Key Storage (encrypted in production)
export const saveApiKeys = async (
  userId: string,
  keys: { geminiKey?: string; claudeKey?: string }
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const keysRef = doc(db, 'apiKeys', userId);
  await setDoc(
    keysRef,
    {
      userId,
      ...keys,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getApiKeys = async (userId: string): Promise<ApiKeyStore | null> => {
  if (!db) return null;
  const keysRef = doc(db, 'apiKeys', userId);
  const keysSnap = await getDoc(keysRef);

  if (keysSnap.exists()) {
    return keysSnap.data() as ApiKeyStore;
  }
  return null;
};

// Migration helper: Import localStorage data to Firestore
export const migrateLocalStorageToFirestore = async (
  userId: string,
  localProjects: any[]
): Promise<void> => {
  const batch = [];

  for (const project of localProjects) {
    if (!db) break;
    const projectRef = doc(db, 'projects', project.id);
    batch.push(
      setDoc(projectRef, {
        ...project,
        userId,
        archived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  }

  await Promise.all(batch);
};

// ============================================
// ORGANIZATION & TEAM MANAGEMENT WITH ACCESS CONTROL
// ============================================

export interface OrganizationDoc {
  id: string;
  name: string;
  domain?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    allowSelfSignup: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
  superAdmins: string[];
}

export interface OrganizationMemberDoc {
  userId: string;
  email: string;
  name: string;
  role: 'super_admin' | 'org_admin' | 'team_admin' | 'member' | 'viewer';
  joinedAt: Timestamp;
  invitedBy: string;
}

export interface TeamDoc {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamMemberDoc {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Timestamp;
}

export interface InviteDoc {
  id: string;
  orgId: string;
  orgName: string;
  teamId?: string;
  teamName?: string;
  email: string;
  role: 'org_admin' | 'team_admin' | 'member' | 'viewer';
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  acceptedAt?: Timestamp;
}

export interface JoinRequestDoc {
  id: string;
  orgId: string;
  userId: string;
  email: string;
  name: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

// Check if user is super admin (can create organizations)
export const isSuperAdmin = async (userId: string): Promise<boolean> => {
  if (!db) return false;
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    return userData.isSuperAdmin === true;
  }
  return false;
};

// Create Organization (ONLY for super admins)
export const createOrganization = async (
  userId: string,
  name: string,
  domain?: string,
  settings?: {
    allowSelfSignup?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  }
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');

  // Check if user is super admin
  const isAdmin = await isSuperAdmin(userId);
  if (!isAdmin) {
    throw new Error('Only super admins can create organizations');
  }

  const orgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const orgRef = doc(db, 'organizations', orgId);

  await setDoc(orgRef, {
    id: orgId,
    name,
    domain,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    settings: {
      allowSelfSignup: settings?.allowSelfSignup || false,
      requireApproval: settings?.requireApproval || true,
      maxMembers: settings?.maxMembers,
    },
    superAdmins: [userId],
  });

  // Add creator as first member
  await addOrganizationMember(orgId, {
    userId,
    email: '', // Should be fetched from user profile
    name: '', // Should be fetched from user profile
    role: 'super_admin',
    invitedBy: userId,
  });

  return orgId;
};

// Add member to organization
export const addOrganizationMember = async (
  orgId: string,
  memberData: Omit<OrganizationMemberDoc, 'joinedAt'>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const memberRef = doc(db, 'organizations', orgId, 'members', memberData.userId);
  await setDoc(memberRef, {
    ...memberData,
    joinedAt: serverTimestamp(),
  });
};

// Check if user is member of organization
export const isOrganizationMember = async (orgId: string, userId: string): Promise<boolean> => {
  if (!db) return false;
  const memberRef = doc(db, 'organizations', orgId, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  return memberSnap.exists();
};

// Check if user is org admin
export const isOrganizationAdmin = async (orgId: string, userId: string): Promise<boolean> => {
  if (!db) return false;
  const memberRef = doc(db, 'organizations', orgId, 'members', userId);
  const memberSnap = await getDoc(memberRef);

  if (memberSnap.exists()) {
    const member = memberSnap.data() as OrganizationMemberDoc;
    return member.role === 'super_admin' || member.role === 'org_admin';
  }
  return false;
};

// Get user's organizations
export const getUserOrganizations = async (userId: string): Promise<OrganizationDoc[]> => {
  if (!db) return [];

  // Get all organizations where user is a member
  const orgsSnapshot = await getDocs(collection(db, 'organizations'));
  const userOrgs: OrganizationDoc[] = [];

  for (const orgDoc of orgsSnapshot.docs) {
    const isMember = await isOrganizationMember(orgDoc.id, userId);
    if (isMember) {
      userOrgs.push(orgDoc.data() as OrganizationDoc);
    }
  }

  return userOrgs;
};

// Send organization invite
export const sendOrganizationInvite = async (
  orgId: string,
  inviteData: Omit<InviteDoc, 'id' | 'createdAt' | 'status' | 'expiresAt'>
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');

  // Check if inviter is admin
  const isAdmin = await isOrganizationAdmin(orgId, inviteData.invitedBy);
  if (!isAdmin) {
    throw new Error('Only organization admins can send invites');
  }

  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const inviteRef = doc(db, 'invites', inviteId);

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await setDoc(inviteRef, {
    ...inviteData,
    id: inviteId,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });

  return inviteId;
};

// Accept organization invite
export const acceptOrganizationInvite = async (
  inviteId: string,
  userId: string,
  userEmail: string,
  userName: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const inviteRef = doc(db, 'invites', inviteId);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error('Invite not found');
  }

  const invite = inviteSnap.data() as InviteDoc;

  // Check if invite is for this user's email
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('This invite is not for your email address');
  }

  // Check if invite is still valid
  if (invite.status !== 'pending') {
    throw new Error('This invite has already been used or expired');
  }

  const now = new Date();
  const expiresAt = (invite.expiresAt as any).toDate();
  if (now > expiresAt) {
    await updateDoc(inviteRef, { status: 'expired' });
    throw new Error('This invite has expired');
  }

  // Add user to organization
  await addOrganizationMember(invite.orgId, {
    userId,
    email: userEmail,
    name: userName,
    role: invite.role,
    invitedBy: invite.invitedBy,
  });

  // If invite includes team, add to team as well
  if (invite.teamId) {
    await addTeamMember(invite.orgId, invite.teamId, {
      userId,
      email: userEmail,
      name: userName,
      role: invite.role === 'org_admin' ? 'admin' : 'member',
    });
  }

  // Mark invite as accepted
  await updateDoc(inviteRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
};

// Get pending invites for user
export const getPendingInvitesForUser = async (email: string): Promise<InviteDoc[]> => {
  if (!db) return [];

  const invitesRef = collection(db, 'invites');
  const q = query(
    invitesRef,
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as InviteDoc);
};

// Create Team (requires org admin permission)
export const createTeam = async (
  orgId: string,
  name: string,
  description: string,
  creatorId: string
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');

  // Check if user is org admin
  const isAdmin = await isOrganizationAdmin(orgId, creatorId);
  if (!isAdmin) {
    throw new Error('Only organization admins can create teams');
  }

  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const teamRef = doc(db, 'organizations', orgId, 'teams', teamId);

  await setDoc(teamRef, {
    id: teamId,
    orgId,
    name,
    description,
    createdBy: creatorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return teamId;
};

// Add member to team
export const addTeamMember = async (
  orgId: string,
  teamId: string,
  memberData: Omit<TeamMemberDoc, 'joinedAt'>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  // Verify user is org member first
  const isOrgMember = await isOrganizationMember(orgId, memberData.userId);
  if (!isOrgMember) {
    throw new Error('User must be organization member before joining team');
  }

  const memberRef = doc(db, 'organizations', orgId, 'teams', teamId, 'members', memberData.userId);
  await setDoc(memberRef, {
    ...memberData,
    joinedAt: serverTimestamp(),
  });
};

// Get user's teams in an organization
export const getUserTeams = async (orgId: string, userId: string): Promise<TeamDoc[]> => {
  if (!db) return [];

  const teamsSnapshot = await getDocs(collection(db, 'organizations', orgId, 'teams'));
  const userTeams: TeamDoc[] = [];

  for (const teamDoc of teamsSnapshot.docs) {
    const memberRef = doc(db, 'organizations', orgId, 'teams', teamDoc.id, 'members', userId);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      userTeams.push(teamDoc.data() as TeamDoc);
    }
  }

  return userTeams;
};

// Sprint Operations
export const createSprint = async (sprintData: Partial<Sprint>): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const sprintId = `sprint_${Date.now()}`;
  const sprintRef = doc(db, 'organizations', sprintData.orgId!, 'teams', sprintData.teamId!, 'sprints', sprintId);

  await setDoc(sprintRef, {
    ...sprintData,
    id: sprintId,
    status: 'active',
    taskIds: sprintData.taskIds || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return sprintId;
};

export const getActiveSprint = async (orgId: string, teamId: string): Promise<Sprint | null> => {
  if (!db) return null;
  const sprintsRef = collection(db, 'organizations', orgId, 'teams', teamId, 'sprints');
  const q = query(sprintsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Sprint;
  }
  return null;
};

export const updateSprint = async (orgId: string, teamId: string, sprintId: string, updates: Partial<Sprint>): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const sprintRef = doc(db, 'organizations', orgId, 'teams', teamId, 'sprints', sprintId);
  await updateDoc(sprintRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Task Operations
export const createTask = async (orgId: string, taskData: Partial<Task>): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const tasksRef = collection(db, 'organizations', orgId, 'tasks');
  const docRef = await addDoc(tasksRef, {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update the doc with its own ID for consistency
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const updateTask = async (orgId: string, taskId: string, updates: any): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const taskRef = doc(db, 'organizations', orgId, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getTeamTasks = async (orgId: string, userId: string): Promise<Task[]> => {
  if (!db) return [];
  const tasksRef = collection(db, 'organizations', orgId, 'tasks');
  // Tasks where user is an assignee OR creator
  const q = query(tasksRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map(doc => doc.data() as Task)
    .filter(task =>
      task.createdBy === userId ||
      task.values.assignees?.includes(userId)
    );
};

// Organization Invites
export const createInvite = async (invite: Partial<OrganizationInvite>): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const invitesRef = collection(db, 'invites');
  const docRef = await addDoc(invitesRef, {
    ...invite,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getPendingInvites = async (email: string): Promise<OrganizationInvite[]> => {
  if (!db) return [];
  const invitesRef = collection(db, 'invites');
  const q = query(invitesRef, where('email', '==', email), where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrganizationInvite));
};

export const acceptInvite = async (inviteId: string, userId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const inviteRef = doc(db, 'invites', inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) throw new Error('Invite not found');

  const inviteData = inviteSnap.data() as OrganizationInvite;

  // 1. Mark invite as accepted
  await updateDoc(inviteRef, { status: 'accepted' });

  // 2. Add user to the organization (you might want a more formal member list in Org doc too)
  // For now we just ensure they have the org context.
};

// Team Projects & Workflows
export interface TeamProjectDoc {
  id: string;
  name: string;
  description: string;
  clientName?: string;
  orgId: string;
  teamId: string;
  workflowId?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface WorkflowStageDoc {
  id: string;
  name: string;
  description?: string;
  responsibleTeam: string;
  order: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'paused';
  assignees?: string[];
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
  blockers?: string[];
}

export interface WorkflowDoc {
  id: string;
  projectId: string;
  templateId: string;
  templateName: string;
  currentStageId: string | null;
  stages: WorkflowStageDoc[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface ActivityLogDoc {
  id: string;
  projectId: string;
  workflowId?: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'completed' | 'commented' | 'status_changed' | 'stage_advanced';
  entityType: 'project' | 'workflow' | 'stage' | 'task';
  entityId: string;
  entityName: string;
  details?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}

// Team Project Operations
export const createTeamProject = async (
  projectData: Omit<TeamProjectDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const projectRef = doc(db, 'organizations', projectData.orgId, 'projects', projectId);

  await setDoc(projectRef, {
    ...projectData,
    id: projectId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log activity
  await logActivity({
    projectId,
    userId: projectData.createdBy,
    userName: 'User', // Should be replaced with actual user name
    action: 'created',
    entityType: 'project',
    entityId: projectId,
    entityName: projectData.name,
    details: `Created project "${projectData.name}"`,
  });

  return projectId;
};

export const updateTeamProject = async (
  orgId: string,
  projectId: string,
  updates: Partial<TeamProjectDoc>,
  userId: string,
  userName: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectRef = doc(db, 'organizations', orgId, 'projects', projectId);

  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Log activity
  await logActivity({
    projectId,
    userId,
    userName,
    action: 'updated',
    entityType: 'project',
    entityId: projectId,
    entityName: updates.name || projectId,
    details: `Updated project`,
    metadata: updates,
  });
};

export const getTeamProject = async (orgId: string, projectId: string): Promise<TeamProjectDoc | null> => {
  if (!db) return null;
  const projectRef = doc(db, 'organizations', orgId, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    return projectSnap.data() as TeamProjectDoc;
  }
  return null;
};

export const getTeamProjects = async (orgId: string, teamId?: string): Promise<TeamProjectDoc[]> => {
  if (!db) return [];
  const projectsRef = collection(db, 'organizations', orgId, 'projects');

  let q = query(projectsRef, orderBy('updatedAt', 'desc'));
  if (teamId) {
    q = query(projectsRef, where('teamId', '==', teamId), orderBy('updatedAt', 'desc'));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as TeamProjectDoc);
};

export const deleteTeamProject = async (
  orgId: string,
  projectId: string,
  userId: string,
  userName: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const projectRef = doc(db, 'organizations', orgId, 'projects', projectId);

  // Soft delete by updating status
  await updateDoc(projectRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });

  await logActivity({
    projectId,
    userId,
    userName,
    action: 'updated',
    entityType: 'project',
    entityId: projectId,
    entityName: projectId,
    details: `Cancelled project`,
  });
};

// Workflow Operations
export const createWorkflow = async (
  orgId: string,
  workflowData: Omit<WorkflowDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const workflowRef = doc(db, 'organizations', orgId, 'workflows', workflowId);

  await setDoc(workflowRef, {
    ...workflowData,
    id: workflowId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return workflowId;
};

export const updateWorkflow = async (
  orgId: string,
  workflowId: string,
  updates: Partial<WorkflowDoc>,
  userId: string,
  userName: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const workflowRef = doc(db, 'organizations', orgId, 'workflows', workflowId);

  await updateDoc(workflowRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Log activity if stage was advanced
  if (updates.currentStageId) {
    const workflow = await getWorkflow(orgId, workflowId);
    const currentStage = workflow?.stages.find(s => s.id === updates.currentStageId);

    if (currentStage) {
      await logActivity({
        projectId: workflow!.projectId,
        workflowId,
        userId,
        userName,
        action: 'stage_advanced',
        entityType: 'stage',
        entityId: currentStage.id,
        entityName: currentStage.name,
        details: `Advanced to stage: ${currentStage.name}`,
      });
    }
  }
};

export const getWorkflow = async (orgId: string, workflowId: string): Promise<WorkflowDoc | null> => {
  if (!db) return null;
  const workflowRef = doc(db, 'organizations', orgId, 'workflows', workflowId);
  const workflowSnap = await getDoc(workflowRef);

  if (workflowSnap.exists()) {
    return workflowSnap.data() as WorkflowDoc;
  }
  return null;
};

export const getProjectWorkflow = async (orgId: string, projectId: string): Promise<WorkflowDoc | null> => {
  if (!db) return null;
  const workflowsRef = collection(db, 'organizations', orgId, 'workflows');
  const q = query(workflowsRef, where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as WorkflowDoc;
  }
  return null;
};

export const updateWorkflowStage = async (
  orgId: string,
  workflowId: string,
  stageId: string,
  updates: Partial<WorkflowStageDoc>,
  userId: string,
  userName: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const workflowRef = doc(db, 'organizations', orgId, 'workflows', workflowId);
  const workflowSnap = await getDoc(workflowRef);

  if (!workflowSnap.exists()) throw new Error('Workflow not found');

  const workflow = workflowSnap.data() as WorkflowDoc;
  const updatedStages = workflow.stages.map(stage =>
    stage.id === stageId ? { ...stage, ...updates } : stage
  );

  await updateDoc(workflowRef, {
    stages: updatedStages,
    updatedAt: serverTimestamp(),
  });

  // Log activity
  const stage = updatedStages.find(s => s.id === stageId);
  if (stage && updates.status) {
    await logActivity({
      projectId: workflow.projectId,
      workflowId,
      userId,
      userName,
      action: 'status_changed',
      entityType: 'stage',
      entityId: stageId,
      entityName: stage.name,
      details: `Changed stage status to: ${updates.status}`,
      metadata: { previousStatus: stage.status, newStatus: updates.status },
    });
  }
};

// Activity Log Operations
export const logActivity = async (
  activityData: Omit<ActivityLogDoc, 'id' | 'createdAt'>
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const activitiesRef = collection(db, 'activities');
  const docRef = await addDoc(activitiesRef, {
    ...activityData,
    createdAt: serverTimestamp(),
  });

  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
};

export const getProjectActivities = async (
  projectId: string,
  limit: number = 50
): Promise<ActivityLogDoc[]> => {
  if (!db) return [];
  const activitiesRef = collection(db, 'activities');
  const q = query(
    activitiesRef,
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.slice(0, limit).map((doc) => doc.data() as ActivityLogDoc);
};

// Real-time Listeners
export const subscribeToTeamProjects = (
  orgId: string,
  teamId: string | undefined,
  callback: (projects: TeamProjectDoc[]) => void
) => {
  if (!db) return () => { };

  const projectsRef = collection(db, 'organizations', orgId, 'projects');
  let q = query(projectsRef, orderBy('updatedAt', 'desc'));

  if (teamId) {
    q = query(projectsRef, where('teamId', '==', teamId), orderBy('updatedAt', 'desc'));
  }

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map((doc) => doc.data() as TeamProjectDoc);
    callback(projects);
  });

  return unsubscribe;
};

export const subscribeToWorkflow = (
  orgId: string,
  workflowId: string,
  callback: (workflow: WorkflowDoc | null) => void
) => {
  if (!db) return () => { };

  const workflowRef = doc(db, 'organizations', orgId, 'workflows', workflowId);

  const unsubscribe = onSnapshot(workflowRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as WorkflowDoc);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

export const subscribeToProjectActivities = (
  projectId: string,
  callback: (activities: ActivityLogDoc[]) => void
) => {
  if (!db) return () => { };

  const activitiesRef = collection(db, 'activities');
  const q = query(
    activitiesRef,
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map((doc) => doc.data() as ActivityLogDoc);
    callback(activities);
  });

  return unsubscribe;
};

