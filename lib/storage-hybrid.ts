import type { ProjectData } from "@/types/user-story"
import {
  createProject as firestoreCreateProject,
  updateProject as firestoreUpdateProject,
  getProject as firestoreGetProject,
  getUserProjects as firestoreGetUserProjects,
  deleteProject as firestoreDeleteProject,
  type ProjectArtifact,
} from "./firestore-service"
import {
  getStoredProjects as getLocalProjects,
  saveProject as saveLocalProject,
  loadProject as loadLocalProject,
  deleteProject as deleteLocalProject,
  updateProject as updateLocalProject,
  type StoredProject,
} from "./storage"

// Hybrid storage layer that uses Firestore when authenticated, localStorage otherwise

export interface HybridStoredProject extends StoredProject {
  syncedToFirestore?: boolean
}

/**
 * Get current user ID from session (must be called client-side with session available)
 */
function getUserId(): string | null {
  if (typeof window === "undefined") return null

  // Try to get from session storage (set by auth components)
  const userId = sessionStorage.getItem("smello-user-id")
  return userId
}

/**
 * Set current user ID for hybrid storage
 */
export function setUserId(uid: string | null) {
  if (typeof window === "undefined") return

  if (uid) {
    sessionStorage.setItem("smello-user-id", uid)
  } else {
    sessionStorage.removeItem("smello-user-id")
  }
}

/**
 * Convert ProjectData to ProjectArtifact format
 */
function convertToProjectArtifact(
  projectData: ProjectData,
  existingProject?: Partial<ProjectArtifact>
): Partial<ProjectArtifact> {
  return {
    ...existingProject,
    name: projectData.product.name,
    description: projectData.product.description,
    product: projectData.product,
    epics: projectData.epics,
  }
}

/**
 * Get all stored projects (hybrid: Firestore if authenticated, localStorage otherwise)
 */
export async function getStoredProjects(): Promise<HybridStoredProject[]> {
  const userId = getUserId()

  if (userId) {
    try {
      // Fetch from Firestore
      const firestoreProjects = await firestoreGetUserProjects(userId)

      // Convert to StoredProject format
      return firestoreProjects.map((fp) => ({
        id: fp.id,
        name: fp.name || "",
        product: fp.product || { name: "", description: "", sector: "", targetAudience: "" },
        epics: fp.epics || [],
        created_at: fp.createdAt ? new Date(fp.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
        updated_at: fp.updatedAt ? new Date(fp.updatedAt.seconds * 1000).toISOString() : new Date().toISOString(),
        documentContent: fp.documentContent,
        documentFileName: fp.documentFileName,
        prd: typeof fp.prd === "string" ? fp.prd : undefined,
        blueprints: fp.blueprints,
        research: fp.research,
        competitorAnalysis: fp.competitorAnalysis,
        personas: fp.personas,
        journeyMaps: fp.journeyMaps,
        syncedToFirestore: true,
      }))
    } catch (error) {
      console.error("Error fetching Firestore projects, falling back to localStorage:", error)
      return getLocalProjects()
    }
  } else {
    // Use localStorage for anonymous users
    return getLocalProjects()
  }
}

/**
 * Save a project (hybrid)
 */
export async function saveProject(
  projectData: ProjectData,
  documentContent?: string,
  documentFileName?: string
): Promise<HybridStoredProject> {
  const userId = getUserId()

  if (userId) {
    try {
      // Save to Firestore
      const projectId = await firestoreCreateProject(userId, {
        name: projectData.product.name,
        description: projectData.product.description,
        product: projectData.product,
        epics: projectData.epics,
        documentContent,
        documentFileName,
      })

      // Fetch the created project to return
      const firestoreProject = await firestoreGetProject(projectId)
      if (firestoreProject) {
        return {
          id: firestoreProject.id,
          name: firestoreProject.name || "",
          product: firestoreProject.product || projectData.product,
          epics: firestoreProject.epics || [],
          created_at: new Date(firestoreProject.createdAt.seconds * 1000).toISOString(),
          updated_at: new Date(firestoreProject.updatedAt.seconds * 1000).toISOString(),
          documentContent: firestoreProject.documentContent,
          documentFileName: firestoreProject.documentFileName,
          syncedToFirestore: true,
        }
      }
    } catch (error) {
      console.error("Error saving to Firestore, falling back to localStorage:", error)
    }
  }

  // Fallback to localStorage
  const localProject = saveLocalProject(projectData, documentContent, documentFileName)
  return { ...localProject, syncedToFirestore: false }
}

/**
 * Load a specific project (hybrid)
 */
export async function loadProject(id: string): Promise<HybridStoredProject | null> {
  const userId = getUserId()

  if (userId) {
    try {
      const firestoreProject = await firestoreGetProject(id)
      if (firestoreProject) {
        return {
          id: firestoreProject.id,
          name: firestoreProject.name || "",
          product: firestoreProject.product || { name: "", description: "", sector: "", targetAudience: "" },
          epics: firestoreProject.epics || [],
          created_at: new Date(firestoreProject.createdAt.seconds * 1000).toISOString(),
          updated_at: new Date(firestoreProject.updatedAt.seconds * 1000).toISOString(),
          documentContent: firestoreProject.documentContent,
          documentFileName: firestoreProject.documentFileName,
          prd: typeof firestoreProject.prd === "string" ? firestoreProject.prd : undefined,
          blueprints: firestoreProject.blueprints,
          research: firestoreProject.research,
          competitorAnalysis: firestoreProject.competitorAnalysis,
          personas: firestoreProject.personas,
          journeyMaps: firestoreProject.journeyMaps,
          syncedToFirestore: true,
        }
      }
    } catch (error) {
      console.error("Error loading from Firestore, trying localStorage:", error)
    }
  }

  // Fallback to localStorage
  const localProject = loadLocalProject(id)
  return localProject ? { ...localProject, syncedToFirestore: false } : null
}

/**
 * Update a project with partial data (hybrid)
 */
export async function updateProject(
  id: string,
  updates: Partial<HybridStoredProject>
): Promise<HybridStoredProject | null> {
  const userId = getUserId()

  if (userId) {
    try {
      // Update in Firestore
      const firestoreUpdates: Partial<ProjectArtifact> = {
        name: updates.name,
        description: updates.product?.description,
        product: updates.product,
        epics: updates.epics,
        documentContent: updates.documentContent,
        documentFileName: updates.documentFileName,
        prd: updates.prd ? { fullDocument: updates.prd } : undefined,
        blueprints: updates.blueprints,
        research: updates.research,
        competitorAnalysis: updates.competitorAnalysis,
        personas: updates.personas,
        journeyMaps: updates.journeyMaps,
      }

      await firestoreUpdateProject(id, firestoreUpdates)

      // Fetch updated project
      const updatedProject = await firestoreGetProject(id)
      if (updatedProject) {
        return {
          id: updatedProject.id,
          name: updatedProject.name || "",
          product: updatedProject.product || { name: "", description: "", sector: "", targetAudience: "" },
          epics: updatedProject.epics || [],
          created_at: new Date(updatedProject.createdAt.seconds * 1000).toISOString(),
          updated_at: new Date(updatedProject.updatedAt.seconds * 1000).toISOString(),
          documentContent: updatedProject.documentContent,
          documentFileName: updatedProject.documentFileName,
          prd: typeof updatedProject.prd === "string" ? updatedProject.prd : undefined,
          blueprints: updatedProject.blueprints,
          research: updatedProject.research,
          competitorAnalysis: updatedProject.competitorAnalysis,
          personas: updatedProject.personas,
          journeyMaps: updatedProject.journeyMaps,
          syncedToFirestore: true,
        }
      }
    } catch (error) {
      console.error("Error updating Firestore project, trying localStorage:", error)
    }
  }

  // Fallback to localStorage
  const localProject = updateLocalProject(id, updates)
  return localProject ? { ...localProject, syncedToFirestore: false } : null
}

/**
 * Delete a project (hybrid)
 */
export async function deleteProject(id: string): Promise<void> {
  const userId = getUserId()

  if (userId) {
    try {
      await firestoreDeleteProject(id)
    } catch (error) {
      console.error("Error deleting from Firestore:", error)
    }
  }

  // Also delete from localStorage (in case it's cached)
  deleteLocalProject(id)
}

/**
 * Migrate all localStorage projects to Firestore for authenticated user
 */
export async function migrateToFirestore(userId: string): Promise<number> {
  const localProjects = getLocalProjects()
  let migrated = 0

  for (const project of localProjects) {
    try {
      await firestoreCreateProject(userId, {
        id: project.id, // Preserve original ID
        name: project.name,
        description: project.product.description,
        product: project.product,
        epics: project.epics,
        documentContent: project.documentContent,
        documentFileName: project.documentFileName,
        prd: project.prd ? { fullDocument: project.prd } : undefined,
        blueprints: project.blueprints,
        research: project.research,
        competitorAnalysis: project.competitorAnalysis,
        personas: project.personas,
        journeyMaps: project.journeyMaps,
      })
      migrated++
    } catch (error) {
      console.error(`Error migrating project ${project.id}:`, error)
    }
  }

  return migrated
}
