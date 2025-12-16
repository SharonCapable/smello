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

// User Profile Operations
export const createOrUpdateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
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
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getProject = async (projectId: string): Promise<ProjectArtifact | null> => {
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);

  if (projectSnap.exists()) {
    return projectSnap.data() as ProjectArtifact;
  }
  return null;
};

export const getUserProjects = async (userId: string): Promise<ProjectArtifact[]> => {
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
  const projectRef = doc(db, 'projects', projectId);
  // Soft delete by archiving
  await updateDoc(projectRef, {
    archived: true,
    updatedAt: serverTimestamp(),
  });
};

export const hardDeleteProject = async (projectId: string): Promise<void> => {
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
