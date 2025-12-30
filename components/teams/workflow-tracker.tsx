"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    CheckCircle2,
    Circle,
    Clock,
    Pause,
    AlertCircle,
    ChevronRight,
    Play,
    SkipForward,
    Users,
    MessageSquare,
    Calendar
} from "lucide-react"
import { ProjectWorkflow, WorkflowStage, getCurrentStage, getNextStage } from "@/types/workflow"
import { cn } from "@/lib/utils"

interface WorkflowTrackerProps {
    workflow: ProjectWorkflow
    onUpdateWorkflow: (workflow: ProjectWorkflow) => void
    onUpdateStage: (stageId: string, updates: Partial<WorkflowStage>) => void
}

const TEAM_COLORS: Record<string, string> = {
    'AI Model': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'Product': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Data Science': 'bg-green-500/10 text-green-700 border-green-500/20',
    'ML Ops': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Cloud Ops': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    'Soft Devs': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'Cloud Engr': 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20'
}

const STATUS_CONFIG = {
    'not-started': { icon: Circle, color: 'text-muted-foreground', bg: 'bg-muted' },
    'in-progress': { icon: Play, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    'completed': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    'blocked': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
    'paused': { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-500/10' }
}

export function WorkflowTracker({ workflow, onUpdateWorkflow, onUpdateStage }: WorkflowTrackerProps) {
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
    const currentStage = getCurrentStage(workflow)
    const nextStage = getNextStage(workflow)

    const selectedStage = selectedStageId
        ? workflow.stages.find(s => s.id === selectedStageId)
        : null

    const handleAdvanceStage = () => {
        if (!currentStage || !nextStage) return

        const updatedStages = workflow.stages.map(stage => {
            if (stage.id === currentStage.id) {
                return { ...stage, status: 'completed' as const, completedAt: new Date() }
            }
            if (stage.id === nextStage.id) {
                return { ...stage, status: 'in-progress' as const, startedAt: new Date() }
            }
            return stage
        })

        onUpdateWorkflow({
            ...workflow,
            currentStageId: nextStage.id,
            stages: updatedStages,
            updatedAt: new Date()
        })
    }

    const handleUpdateStageStatus = (stageId: string, status: WorkflowStage['status']) => {
        onUpdateStage(stageId, { status })
    }

    const handleAddNote = (stageId: string, note: string) => {
        const stage = workflow.stages.find(s => s.id === stageId)
        if (!stage) return
        onUpdateStage(stageId, { notes: note })
    }

    const handleAddBlocker = (stageId: string, blocker: string) => {
        const stage = workflow.stages.find(s => s.id === stageId)
        if (!stage) return
        const blockers = [...(stage.blockers || []), blocker]
        onUpdateStage(stageId, { blockers })
    }

    const completedStages = workflow.stages.filter(s => s.status === 'completed').length
    const totalStages = workflow.stages.length
    const progressPercentage = (completedStages / totalStages) * 100

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{workflow.templateName}</CardTitle>
                            <CardDescription>
                                Project Workflow Tracking
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            {completedStages} / {totalStages} Stages Complete
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {currentStage && (
                        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-accent uppercase tracking-wide">
                                        Current Stage
                                    </div>
                                    <div className="text-lg font-bold">{currentStage.name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span className="font-medium">{currentStage.responsibleTeam}</span>
                                    </div>
                                </div>
                                {nextStage && (
                                    <Button onClick={handleAdvanceStage} className="gap-2">
                                        Complete & Advance
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Workflow Stages Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Stages</CardTitle>
                    <CardDescription>Track progress through each stage of the pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {workflow.stages.map((stage, index) => {
                            const StatusIcon = STATUS_CONFIG[stage.status].icon
                            const isSelected = selectedStageId === stage.id
                            const isCurrent = currentStage?.id === stage.id

                            return (
                                <div
                                    key={stage.id}
                                    className={cn(
                                        "border rounded-lg p-4 transition-all cursor-pointer hover:border-accent/40",
                                        isSelected && "border-accent ring-2 ring-accent/20",
                                        isCurrent && "bg-accent/5"
                                    )}
                                    onClick={() => setSelectedStageId(isSelected ? null : stage.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Stage Number & Status */}
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                                STATUS_CONFIG[stage.status].bg,
                                                STATUS_CONFIG[stage.status].color
                                            )}>
                                                {stage.status === 'completed' ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            {index < workflow.stages.length - 1 && (
                                                <div className={cn(
                                                    "w-0.5 h-12",
                                                    stage.status === 'completed' ? 'bg-green-500/30' : 'bg-muted'
                                                )} />
                                            )}
                                        </div>

                                        {/* Stage Details */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{stage.name}</h4>
                                                        {isCurrent && (
                                                            <Badge variant="outline" className="text-xs border-accent text-accent">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {stage.description && (
                                                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                                                    )}
                                                </div>
                                                <StatusIcon className={cn("w-5 h-5", STATUS_CONFIG[stage.status].color)} />
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={cn("text-xs", TEAM_COLORS[stage.responsibleTeam])}>
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {stage.responsibleTeam}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {stage.status.replace('-', ' ')}
                                                </Badge>
                                                {stage.blockers && stage.blockers.length > 0 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {stage.blockers.length} Blocker{stage.blockers.length > 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Expanded Details */}
                                            {isSelected && (
                                                <div className="mt-4 pt-4 border-t space-y-4 animate-fade-in">
                                                    {/* Status Update */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold">Update Status</Label>
                                                        <Select
                                                            value={stage.status}
                                                            onValueChange={(value) => handleUpdateStageStatus(stage.id, value as WorkflowStage['status'])}
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="not-started">Not Started</SelectItem>
                                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                <SelectItem value="blocked">Blocked</SelectItem>
                                                                <SelectItem value="paused">Paused</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Notes */}
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold flex items-center gap-2">
                                                            <MessageSquare className="w-3 h-3" />
                                                            Notes
                                                        </Label>
                                                        <Textarea
                                                            placeholder="Add notes about this stage..."
                                                            value={stage.notes || ''}
                                                            onChange={(e) => handleAddNote(stage.id, e.target.value)}
                                                            className="min-h-[80px] text-sm"
                                                        />
                                                    </div>

                                                    {/* Blockers */}
                                                    {stage.blockers && stage.blockers.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-destructive">Blockers</Label>
                                                            <div className="space-y-1">
                                                                {stage.blockers.map((blocker, i) => (
                                                                    <div key={i} className="text-sm p-2 bg-destructive/5 border border-destructive/20 rounded">
                                                                        {blocker}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Timestamps */}
                                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                                        {stage.startedAt && (
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>Started: {new Date(stage.startedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {stage.completedAt && (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span>Completed: {new Date(stage.completedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
