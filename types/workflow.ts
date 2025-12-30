// Workflow Management Types for Smello for Teams

export type WorkflowStage = {
    id: string
    name: string
    description?: string
    responsibleTeam: 'AI Model' | 'Product' | 'Data Science' | 'ML Ops' | 'Cloud Ops' | 'Soft Devs' | 'Cloud Engr'
    order: number
    status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'paused'
    assignees?: string[]
    startedAt?: Date
    completedAt?: Date
    notes?: string
    blockers?: string[]
}

export type WorkflowTemplate = {
    id: string
    name: string
    description: string
    category: 'research-required' | 'tech-stack-ready' | 'custom'
    stages: Omit<WorkflowStage, 'id' | 'status' | 'startedAt' | 'completedAt' | 'assignees' | 'notes' | 'blockers'>[]
}

export type ProjectWorkflow = {
    id: string
    projectId: string
    templateId: string
    templateName: string
    currentStageId: string | null
    stages: WorkflowStage[]
    createdAt: Date
    updatedAt: Date
    completedAt?: Date
}

export type TeamProject = {
    id: string
    name: string
    description: string
    clientName?: string
    orgId: string
    teamId: string
    workflowId?: string
    status: 'active' | 'completed' | 'on-hold' | 'cancelled'
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

// Predefined Workflow Templates
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'research-required',
        name: 'Full Research & Development Pipeline',
        description: 'For projects requiring new research, model development, and deployment',
        category: 'research-required',
        stages: [
            {
                name: 'Research',
                description: 'Initial research and exploration phase',
                responsibleTeam: 'AI Model',
                order: 1
            },
            {
                name: 'Feasibility Review',
                description: 'Assess technical and business feasibility',
                responsibleTeam: 'Product',
                order: 2
            },
            {
                name: 'Dataset Sourcing',
                description: 'Identify and acquire necessary datasets',
                responsibleTeam: 'Data Science',
                order: 3
            },
            {
                name: 'Dataset Review',
                description: 'Validate dataset quality and completeness',
                responsibleTeam: 'Product',
                order: 4
            },
            {
                name: 'Data Annotation',
                description: 'Annotate and prepare training data',
                responsibleTeam: 'Data Science',
                order: 5
            },
            {
                name: 'Model Training and Development',
                description: 'Train and optimize ML models',
                responsibleTeam: 'Product',
                order: 6
            },
            {
                name: 'Pre-production',
                description: 'Prepare model for production deployment',
                responsibleTeam: 'Data Science',
                order: 7
            },
            {
                name: 'Production Ready',
                description: 'Final validation before deployment',
                responsibleTeam: 'ML Ops',
                order: 8
            },
            {
                name: 'Pipeline Setup (AWS)',
                description: 'Set up AWS infrastructure and pipelines',
                responsibleTeam: 'ML Ops',
                order: 9
            },
            {
                name: 'SAAS Integration (AWS)',
                description: 'Integrate with SAAS platform on AWS',
                responsibleTeam: 'Cloud Ops',
                order: 10
            },
            {
                name: 'Pipeline Setup (GCP)',
                description: 'Set up GCP infrastructure and pipelines',
                responsibleTeam: 'ML Ops',
                order: 11
            },
            {
                name: 'SAAS Integration (GCP)',
                description: 'Integrate with SAAS platform on GCP',
                responsibleTeam: 'Cloud Ops',
                order: 12
            }
        ]
    },
    {
        id: 'tech-stack-ready',
        name: 'Tech Stack Ready Pipeline',
        description: 'For projects using existing tech stack - skip research phase',
        category: 'tech-stack-ready',
        stages: [
            {
                name: 'Feasibility Review',
                description: 'Quick feasibility check with existing stack',
                responsibleTeam: 'Product',
                order: 1
            },
            {
                name: 'Dataset Review',
                description: 'Validate existing dataset compatibility',
                responsibleTeam: 'Product',
                order: 2
            },
            {
                name: 'Model Training and Development',
                description: 'Train model with existing infrastructure',
                responsibleTeam: 'Product',
                order: 3
            },
            {
                name: 'Pre-production',
                description: 'Prepare for deployment',
                responsibleTeam: 'Data Science',
                order: 4
            },
            {
                name: 'Production Ready',
                description: 'Final validation',
                responsibleTeam: 'ML Ops',
                order: 5
            },
            {
                name: 'Pipeline Setup',
                description: 'Deploy to production infrastructure',
                responsibleTeam: 'ML Ops',
                order: 6
            },
            {
                name: 'SAAS Integration',
                description: 'Integrate with platform',
                responsibleTeam: 'Cloud Ops',
                order: 7
            }
        ]
    }
]

// Helper function to create a workflow from a template
export function createWorkflowFromTemplate(
    projectId: string,
    template: WorkflowTemplate
): Omit<ProjectWorkflow, 'id' | 'createdAt' | 'updatedAt'> {
    const stages: WorkflowStage[] = template.stages.map((stage, index) => ({
        id: `stage_${Date.now()}_${index}`,
        ...stage,
        status: 'not-started',
        assignees: [],
        notes: '',
        blockers: []
    }))

    return {
        projectId,
        templateId: template.id,
        templateName: template.name,
        currentStageId: stages[0]?.id || null,
        stages
    }
}

// Helper to get current stage
export function getCurrentStage(workflow: ProjectWorkflow): WorkflowStage | null {
    if (!workflow.currentStageId) return null
    return workflow.stages.find(s => s.id === workflow.currentStageId) || null
}

// Helper to get next stage
export function getNextStage(workflow: ProjectWorkflow): WorkflowStage | null {
    const current = getCurrentStage(workflow)
    if (!current) return workflow.stages[0] || null

    const currentIndex = workflow.stages.findIndex(s => s.id === current.id)
    return workflow.stages[currentIndex + 1] || null
}

// Helper to advance to next stage
export function advanceToNextStage(workflow: ProjectWorkflow): ProjectWorkflow {
    const current = getCurrentStage(workflow)
    const next = getNextStage(workflow)

    if (!current || !next) return workflow

    const updatedStages = workflow.stages.map(stage => {
        if (stage.id === current.id) {
            return { ...stage, status: 'completed' as const, completedAt: new Date() }
        }
        if (stage.id === next.id) {
            return { ...stage, status: 'in-progress' as const, startedAt: new Date() }
        }
        return stage
    })

    return {
        ...workflow,
        currentStageId: next.id,
        stages: updatedStages,
        updatedAt: new Date()
    }
}
