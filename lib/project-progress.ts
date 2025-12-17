import type { WorkflowPhase } from "@/components/workflow-stepper"

export interface ProjectProgress {
    projectId: string
    currentPhase: WorkflowPhase
    completedPhases: WorkflowPhase[]
    completedTools: string[]
    lastUpdated: string
}

const PROGRESS_STORAGE_KEY = "smello-project-progress"

export class ProjectProgressManager {
    static getProgress(projectId: string): ProjectProgress | null {
        if (typeof window === "undefined") return null

        try {
            const stored = localStorage.getItem(`${PROGRESS_STORAGE_KEY}-${projectId}`)
            if (!stored) return null
            return JSON.parse(stored) as ProjectProgress
        } catch {
            return null
        }
    }

    static saveProgress(progress: ProjectProgress): void {
        if (typeof window === "undefined") return

        try {
            localStorage.setItem(
                `${PROGRESS_STORAGE_KEY}-${progress.projectId}`,
                JSON.stringify({
                    ...progress,
                    lastUpdated: new Date().toISOString()
                })
            )
        } catch (error) {
            console.error("Failed to save project progress:", error)
        }
    }

    static updatePhase(projectId: string, phase: WorkflowPhase): void {
        const current = this.getProgress(projectId) || {
            projectId,
            currentPhase: "ideation",
            completedPhases: [],
            completedTools: [],
            lastUpdated: new Date().toISOString()
        }

        this.saveProgress({
            ...current,
            currentPhase: phase
        })
    }

    static markPhaseComplete(projectId: string, phase: WorkflowPhase): void {
        const current = this.getProgress(projectId) || {
            projectId,
            currentPhase: phase,
            completedPhases: [],
            completedTools: [],
            lastUpdated: new Date().toISOString()
        }

        if (!current.completedPhases.includes(phase)) {
            this.saveProgress({
                ...current,
                completedPhases: [...current.completedPhases, phase]
            })
        }
    }

    static markToolComplete(projectId: string, toolId: string): void {
        const current = this.getProgress(projectId) || {
            projectId,
            currentPhase: "ideation",
            completedPhases: [],
            completedTools: [],
            lastUpdated: new Date().toISOString()
        }

        if (!current.completedTools.includes(toolId)) {
            this.saveProgress({
                ...current,
                completedTools: [...current.completedTools, toolId]
            })
        }
    }

    static resetProgress(projectId: string): void {
        if (typeof window === "undefined") return
        localStorage.removeItem(`${PROGRESS_STORAGE_KEY}-${projectId}`)
    }

    static initializeProgress(projectId: string): ProjectProgress {
        const existing = this.getProgress(projectId)
        if (existing) return existing

        const initial: ProjectProgress = {
            projectId,
            currentPhase: "ideation",
            completedPhases: [],
            completedTools: [],
            lastUpdated: new Date().toISOString()
        }

        this.saveProgress(initial)
        return initial
    }
}
