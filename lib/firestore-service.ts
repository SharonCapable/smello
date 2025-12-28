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

// Organization Operations
export const createOrganization = async (userId: string, name: string): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const orgId = `org_${Date.now()}`;
  const orgRef = doc(db, 'organizations', orgId);
  await setDoc(orgRef, {
    id: orgId,
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return orgId;
};

// Team Operations
export const createTeam = async (orgId: string, name: string, creatorId: string): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const teamId = `team_${Date.now()}`;
  const teamRef = doc(db, 'organizations', orgId, 'teams', teamId);
  await setDoc(teamRef, {
    id: teamId,
    orgId,
    name,
    members: [{ userId: creatorId, role: 'admin' }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return teamId;
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
