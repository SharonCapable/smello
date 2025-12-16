import { updateProject, type HybridStoredProject } from "./storage-hybrid"

/**
 * Centralized manager for project artifacts
 * Ensures all generated content (ideas, PRD, research, blueprints, etc.)
 * is properly saved to the project
 */

export interface ProjectArtifacts {
  // Ideas & Research
  generatedIdeas?: any[]
  selectedIdea?: any
  research?: any[]
  competitorAnalysis?: any

  // PRD Components
  prd?: {
    problemStatement?: string
    goalsNonGoals?: string
    personas?: string
    userStories?: string
    userFlows?: string
    functionalRequirements?: string
    nonFunctionalRequirements?: string
    analytics?: string
    risks?: string
    fullDocument?: string
  }

  // User Journey & Personas
  journeyMaps?: any[]
  personas?: any[]

  // Technical Artifacts
  blueprints?: {
    architecture?: string
    database?: string
    api?: string
    frontend?: string
    backend?: string
  }

  // Roadmap & Strategy
  roadmap?: any
  featurePrioritization?: any

  // Pitch & Risk
  pitchDeck?: any
  riskAnalysis?: any

  // Epics & Stories (existing)
  epics?: any[]
}

/**
 * Save generated ideas to project
 */
export async function saveIdeasToProject(
  projectId: string,
  ideas: any[],
  selectedIdea?: any
): Promise<void> {
  await updateProject(projectId, {
    generatedIdeas: ideas,
    selectedIdea: selectedIdea,
  } as any)
}

/**
 * Save PRD section to project
 */
export async function savePRDToProject(
  projectId: string,
  prdData: Partial<ProjectArtifacts['prd']>
): Promise<void> {
  // Get current project to merge PRD data
  const currentProject = await import('./storage-hybrid').then(m => m.loadProject(projectId))

  const existingPRD = currentProject?.prd || {}
  const updatedPRD = {
    ...existingPRD,
    ...prdData
  }

  await updateProject(projectId, {
    prd: updatedPRD,
  } as any)
}

/**
 * Save full PRD document to project
 */
export async function saveFullPRDToProject(
  projectId: string,
  fullDocument: string
): Promise<void> {
  await savePRDToProject(projectId, { fullDocument })
}

/**
 * Save research to project
 */
export async function saveResearchToProject(
  projectId: string,
  research: any[]
): Promise<void> {
  await updateProject(projectId, {
    research: research,
  } as any)
}

/**
 * Save technical blueprints to project
 */
export async function saveBlueprintsToProject(
  projectId: string,
  blueprints: Partial<ProjectArtifacts['blueprints']>
): Promise<void> {
  const currentProject = await import('./storage-hybrid').then(m => m.loadProject(projectId))

  const existingBlueprints = currentProject?.blueprints || {}
  const updatedBlueprints = {
    ...existingBlueprints,
    ...blueprints
  }

  await updateProject(projectId, {
    blueprints: updatedBlueprints,
  } as any)
}

/**
 * Save competitor analysis to project
 */
export async function saveCompetitorAnalysisToProject(
  projectId: string,
  analysis: any
): Promise<void> {
  await updateProject(projectId, {
    competitorAnalysis: analysis,
  } as any)
}

/**
 * Save user journey maps to project
 */
export async function saveJourneyMapsToProject(
  projectId: string,
  journeyMaps: any[]
): Promise<void> {
  await updateProject(projectId, {
    journeyMaps: journeyMaps,
  } as any)
}

/**
 * Save user personas to project
 */
export async function savePersonasToProject(
  projectId: string,
  personas: any[]
): Promise<void> {
  await updateProject(projectId, {
    personas: personas,
  } as any)
}

/**
 * Save roadmap to project
 */
export async function saveRoadmapToProject(
  projectId: string,
  roadmap: any
): Promise<void> {
  await updateProject(projectId, {
    roadmap: roadmap,
  } as any)
}

/**
 * Save pitch deck to project
 */
export async function savePitchDeckToProject(
  projectId: string,
  pitchDeck: any
): Promise<void> {
  await updateProject(projectId, {
    pitchDeck: pitchDeck,
  } as any)
}

/**
 * Save risk analysis to project
 */
export async function saveRiskAnalysisToProject(
  projectId: string,
  riskAnalysis: any
): Promise<void> {
  await updateProject(projectId, {
    riskAnalysis: riskAnalysis,
  } as any)
}

/**
 * Get all artifacts for a project
 */
export async function getProjectArtifacts(projectId: string): Promise<ProjectArtifacts | null> {
  const project = await import('./storage-hybrid').then(m => m.loadProject(projectId))

  if (!project) return null

  return {
    generatedIdeas: project.generatedIdeas,
    selectedIdea: project.selectedIdea,
    research: project.research,
    competitorAnalysis: project.competitorAnalysis,
    prd: project.prd as any,
    journeyMaps: project.journeyMaps,
    personas: project.personas,
    blueprints: project.blueprints,
    roadmap: project.roadmap,
    featurePrioritization: project.featurePrioritization,
    pitchDeck: project.pitchDeck,
    riskAnalysis: project.riskAnalysis,
    epics: project.epics,
  }
}
