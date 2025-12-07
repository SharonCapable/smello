import type { ProjectData } from "@/types/user-story"

const STORAGE_KEY = "user-story-projects"

export interface StoredProject extends ProjectData {
  id: string
  name: string
  documentContent?: string
  documentFileName?: string
  prd?: string
  blueprints?: {
    architecture?: string
    database?: string
    api?: string
  }
  research?: any[]
  competitorAnalysis?: any
  personas?: any[]
  journeyMaps?: any[]
}

// Get all stored projects
export function getStoredProjects(): StoredProject[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading projects:", error)
    return []
  }
}

// Save a project
export function saveProject(projectData: ProjectData, documentContent?: string, documentFileName?: string): StoredProject {
  const projects = getStoredProjects()

  const storedProject: StoredProject = {
    ...projectData,
    id: generateProjectId(),
    name: projectData.product.name,
    updated_at: new Date().toISOString(),
    documentContent,
    documentFileName,
  }

  // Check for existing project with same product description (consistency guarantee)
  const existingIndex = projects.findIndex((p) => p.product.description === projectData.product.description)

  if (existingIndex >= 0) {
    // Update existing project
    projects[existingIndex] = storedProject
  } else {
    // Add new project
    projects.push(storedProject)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  return storedProject
}

// Load a specific project
export function loadProject(id: string): StoredProject | null {
  const projects = getStoredProjects()
  return projects.find((p) => p.id === id) || null
}

// Delete a project
export function deleteProject(id: string): void {
  const projects = getStoredProjects()
  const filtered = projects.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// Update a project with partial data (e.g. adding PRD, blueprints)
export function updateProject(id: string, updates: Partial<StoredProject>): StoredProject | null {
  const projects = getStoredProjects()
  const index = projects.findIndex((p) => p.id === id)

  if (index === -1) return null

  const updatedProject = { ...projects[index], ...updates, updated_at: new Date().toISOString() }
  projects[index] = updatedProject
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))

  return updatedProject
}

// Check if a similar project exists (for duplicate detection)
export function findSimilarProject(description: string): StoredProject | null {
  const projects = getStoredProjects()
  return (
    projects.find(
      (p) =>
        p.product.description.toLowerCase().includes(description.toLowerCase()) ||
        description.toLowerCase().includes(p.product.description.toLowerCase()),
    ) || null
  )
}

// Generate unique project ID
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export project data as JSON
export function exportProjectAsJSON(project: StoredProject): string {
  return JSON.stringify(project, null, 2)
}

// Export project data as CSV
export function exportProjectAsCSV(project: StoredProject): string {
  const headers = [
    "Epic ID",
    "Epic Title",
    "Story ID",
    "Story Description",
    "Acceptance Criteria",
    "Edge Cases",
    "Validations",
    "Priority",
    "Effort Estimate",
    "Risk Notes",
  ]

  const rows = [headers.join(",")]

  project.epics.forEach((epic) => {
    epic.user_stories.forEach((story) => {
      const row = [
        epic.id,
        `"${epic.title}"`,
        story.id,
        `"${story.description}"`,
        `"${story.acceptance_criteria.join("; ")}"`,
        `"${story.edge_cases.join("; ")}"`,
        `"${story.validations.join("; ")}"`,
        story.optional_fields?.priority || "",
        `"${story.optional_fields?.effort_estimate || ""}"`,
        `"${story.optional_fields?.risk_notes || ""}"`,
      ]
      rows.push(row.join(","))
    })
  })

  return rows.join("\n")
}

// Export project data as Markdown
export function exportProjectAsMarkdown(project: StoredProject): string {
  let markdown = `# ${project.product.name}\n\n`
  markdown += `${project.product.description}\n\n`
  markdown += `**Created:** ${new Date(project.created_at).toLocaleDateString()}\n`
  markdown += `**Updated:** ${new Date(project.updated_at).toLocaleDateString()}\n\n`

  project.epics.forEach((epic) => {
    markdown += `## ${epic.title} (${epic.id})\n\n`

    epic.user_stories.forEach((story) => {
      markdown += `### ${story.id}\n\n`
      markdown += `${story.description}\n\n`

      if (story.acceptance_criteria.length > 0) {
        markdown += `**Acceptance Criteria:**\n`
        story.acceptance_criteria.forEach((criteria) => {
          markdown += `- ${criteria}\n`
        })
        markdown += `\n`
      }

      if (story.edge_cases.length > 0) {
        markdown += `**Edge Cases:**\n`
        story.edge_cases.forEach((edge) => {
          markdown += `- ${edge}\n`
        })
        markdown += `\n`
      }

      if (story.validations.length > 0) {
        markdown += `**Validations:**\n`
        story.validations.forEach((validation) => {
          markdown += `- ${validation}\n`
        })
        markdown += `\n`
      }

      if (story.optional_fields) {
        markdown += `**Details:**\n`
        if (story.optional_fields.priority) {
          markdown += `- Priority: ${story.optional_fields.priority}\n`
        }
        if (story.optional_fields.effort_estimate) {
          markdown += `- Effort: ${story.optional_fields.effort_estimate}\n`
        }
        if (story.optional_fields.risk_notes) {
          markdown += `- Risk Notes: ${story.optional_fields.risk_notes}\n`
        }
        markdown += `\n`
      }

      markdown += `---\n\n`
    })
  })

  return markdown
}
