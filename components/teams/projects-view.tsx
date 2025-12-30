"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Search,
    Filter,
    Folder,
    Clock,
    CheckCircle2,
    Pause,
    XCircle,
    ChevronRight,
    Workflow,
    Building2,
    Calendar,
    MoreVertical,
    Loader2
} from "lucide-react"
import { CreateProjectModal } from "./create-project-modal"
import { WorkflowTracker } from "./workflow-tracker"
import { WorkflowTemplate, createWorkflowFromTemplate, WorkflowStage } from "@/types/workflow"
import {
    createTeamProject,
    createWorkflow,
    subscribeToTeamProjects,
    subscribeToWorkflow,
    updateWorkflow,
    updateWorkflowStage,
    getProjectWorkflow,
    TeamProjectDoc,
    WorkflowDoc
} from "@/lib/firestore-service"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

interface ProjectsViewProps {
    organizationId?: string
    teamId?: string
}

const PROJECT_STATUS_CONFIG = {
    'active': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Active' },
    'completed': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10', label: 'Completed' },
    'on-hold': { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'On Hold' },
    'cancelled': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10', label: 'Cancelled' }
}

export function ProjectsView({ organizationId, teamId }: ProjectsViewProps) {
    const { user } = useUser()
    const { toast } = useToast()
    const [projects, setProjects] = useState<TeamProjectDoc[]>([])
    const [workflows, setWorkflows] = useState<Map<string, WorkflowDoc>>(new Map())
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [loading, setLoading] = useState(true)

    const selectedProject = projects.find(p => p.id === selectedProjectId)
    const selectedWorkflow = selectedProjectId ? workflows.get(selectedProjectId) : undefined

    // Real-time listener for projects
    useEffect(() => {
        if (!organizationId) return

        setLoading(true)
        const unsubscribe = subscribeToTeamProjects(organizationId, teamId, (updatedProjects) => {
            setProjects(updatedProjects)
            setLoading(false)

            // Fetch workflows for projects that have them
            updatedProjects.forEach(async (project) => {
                if (project.workflowId) {
                    const workflow = await getProjectWorkflow(organizationId, project.id)
                    if (workflow) {
                        setWorkflows(prev => new Map(prev).set(project.id, workflow))
                    }
                }
            })
        })

        return () => unsubscribe()
    }, [organizationId, teamId])

    // Real-time listener for selected workflow
    useEffect(() => {
        if (!organizationId || !selectedProject?.workflowId) return

        const unsubscribe = subscribeToWorkflow(organizationId, selectedProject.workflowId, (workflow) => {
            if (workflow) {
                setWorkflows(prev => new Map(prev).set(selectedProject.id, workflow))
            }
        })

        return () => unsubscribe()
    }, [organizationId, selectedProject])

    const handleCreateProject = async (projectData: {
        name: string
        description: string
        clientName?: string
        workflowTemplate?: WorkflowTemplate
    }) => {
        if (!organizationId || !teamId || !user) {
            toast({
                title: "Error",
                description: "Missing organization or team information",
                variant: "destructive"
            })
            return
        }

        try {
            // Create project in Firestore
            const projectId = await createTeamProject({
                name: projectData.name,
                description: projectData.description,
                clientName: projectData.clientName,
                orgId: organizationId,
                teamId: teamId,
                status: 'active',
                createdBy: user.id,
            })

            // Create workflow if template was selected
            if (projectData.workflowTemplate) {
                const workflowData = createWorkflowFromTemplate(projectId, projectData.workflowTemplate)

                // Convert dates to Firestore Timestamps
                const stagesWithTimestamps = workflowData.stages.map(stage => ({
                    ...stage,
                    startedAt: stage.startedAt ? Timestamp.fromDate(stage.startedAt) : undefined,
                    completedAt: stage.completedAt ? Timestamp.fromDate(stage.completedAt) : undefined,
                }))

                const workflowId = await createWorkflow(organizationId, {
                    ...workflowData,
                    stages: stagesWithTimestamps as any,
                })

                // Update project with workflow ID
                // Note: We'd need to add an updateTeamProject call here
            }

            toast({
                title: "Success",
                description: `Project "${projectData.name}" created successfully`,
            })
        } catch (error: any) {
            console.error('Error creating project:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to create project",
                variant: "destructive"
            })
        }
    }

    const handleUpdateWorkflow = async (workflow: any) => {
        if (!organizationId || !user) return

        try {
            await updateWorkflow(
                organizationId,
                workflow.id,
                {
                    currentStageId: workflow.currentStageId,
                    stages: workflow.stages,
                    updatedAt: Timestamp.now() as any,
                },
                user.id,
                user.fullName || user.firstName || 'User'
            )

            toast({
                title: "Workflow Updated",
                description: "Workflow progress has been saved",
            })
        } catch (error: any) {
            console.error('Error updating workflow:', error)
            toast({
                title: "Error",
                description: "Failed to update workflow",
                variant: "destructive"
            })
        }
    }

    const handleUpdateStage = async (projectId: string, stageId: string, updates: Partial<WorkflowStage>) => {
        if (!organizationId || !user) return

        const workflow = workflows.get(projectId)
        if (!workflow) return

        try {
            // Convert Date objects to Timestamps
            const timestampUpdates: any = { ...updates }
            if (updates.startedAt) timestampUpdates.startedAt = Timestamp.fromDate(updates.startedAt)
            if (updates.completedAt) timestampUpdates.completedAt = Timestamp.fromDate(updates.completedAt)

            await updateWorkflowStage(
                organizationId,
                workflow.id,
                stageId,
                timestampUpdates,
                user.id,
                user.fullName || user.firstName || 'User'
            )

            toast({
                title: "Stage Updated",
                description: "Stage information has been saved",
            })
        } catch (error: any) {
            console.error('Error updating stage:', error)
            toast({
                title: "Error",
                description: "Failed to update stage",
                variant: "destructive"
            })
        }
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Show workflow tracker if a project is selected
    if (selectedProject && selectedWorkflow) {
        // Convert Firestore Timestamps to Dates for the component
        const workflowWithDates = {
            ...selectedWorkflow,
            stages: selectedWorkflow.stages.map(stage => ({
                ...stage,
                startedAt: stage.startedAt ? (stage.startedAt as any).toDate() : undefined,
                completedAt: stage.completedAt ? (stage.completedAt as any).toDate() : undefined,
            })),
            createdAt: (selectedWorkflow.createdAt as any).toDate(),
            updatedAt: (selectedWorkflow.updatedAt as any).toDate(),
            completedAt: selectedWorkflow.completedAt ? (selectedWorkflow.completedAt as any).toDate() : undefined,
        }

        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProjectId(null)}
                        className="gap-2"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back to Projects
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                        {selectedProject.clientName && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {selectedProject.clientName}
                            </p>
                        )}
                    </div>
                </div>

                <WorkflowTracker
                    workflow={workflowWithDates as any}
                    onUpdateWorkflow={handleUpdateWorkflow}
                    onUpdateStage={(stageId, updates) => handleUpdateStage(selectedProject.id, stageId, updates)}
                />
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Folder className="w-8 h-8 text-accent" />
                        Team Projects
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Manage and track all team projects with workflow stages
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Project
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(PROJECT_STATUS_CONFIG).map(([status, config]) => {
                    const count = projects.filter(p => p.status === status).length
                    const Icon = config.icon
                    return (
                        <Card key={status} className={cn("border-l-4", config.bg)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {config.label}
                                        </p>
                                        <p className="text-2xl font-bold">{count}</p>
                                    </div>
                                    <Icon className={cn("w-8 h-8", config.color)} />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Folder className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            {searchQuery || statusFilter !== 'all'
                                ? "No projects match your filters. Try adjusting your search."
                                : "Get started by creating your first team project with workflow tracking."
                            }
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create First Project
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredProjects.map((project) => {
                        const StatusIcon = PROJECT_STATUS_CONFIG[project.status].icon
                        const workflow = workflows.get(project.id)
                        const hasWorkflow = !!workflow

                        let workflowProgress = 0
                        if (workflow) {
                            const completed = workflow.stages.filter(s => s.status === 'completed').length
                            workflowProgress = (completed / workflow.stages.length) * 100
                        }

                        return (
                            <Card
                                key={project.id}
                                className="hover:border-accent/40 transition-all cursor-pointer"
                                onClick={() => hasWorkflow && setSelectedProjectId(project.id)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs", PROJECT_STATUS_CONFIG[project.status].bg)}
                                                >
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {PROJECT_STATUS_CONFIG[project.status].label}
                                                </Badge>
                                                {hasWorkflow && (
                                                    <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                                                        <Workflow className="w-3 h-3 mr-1" />
                                                        Workflow Enabled
                                                    </Badge>
                                                )}
                                            </div>
                                            {project.clientName && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{project.clientName}</span>
                                                </div>
                                            )}
                                            <CardDescription className="line-clamp-2">
                                                {project.description}
                                            </CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" className="shrink-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Workflow Progress */}
                                        {hasWorkflow && workflow && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Workflow Progress</span>
                                                    <span className="font-semibold">{Math.round(workflowProgress)}%</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent transition-all duration-500"
                                                        style={{ width: `${workflowProgress}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Current: {workflow.stages.find(s => s.id === workflow.currentStageId)?.name || 'Not started'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Created {(project.createdAt as any).toDate().toLocaleDateString()}</span>
                                            </div>
                                            {hasWorkflow && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs font-semibold text-accent"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedProjectId(project.id)
                                                    }}
                                                >
                                                    View Workflow
                                                    <ChevronRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateProject={handleCreateProject}
                organizationId={organizationId}
                teamId={teamId}
            />
        </div>
    )
}
