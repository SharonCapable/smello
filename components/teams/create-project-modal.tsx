"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Rocket,
    Zap,
    Settings,
    CheckCircle2,
    Building2,
    Workflow
} from "lucide-react"
import { WORKFLOW_TEMPLATES, WorkflowTemplate, createWorkflowFromTemplate } from "@/types/workflow"
import { cn } from "@/lib/utils"

interface CreateProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onCreateProject: (projectData: {
        name: string
        description: string
        clientName?: string
        workflowTemplate?: WorkflowTemplate
    }) => void
    organizationId?: string
    teamId?: string
}

export function CreateProjectModal({
    isOpen,
    onClose,
    onCreateProject,
    organizationId,
    teamId
}: CreateProjectModalProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [projectName, setProjectName] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [clientName, setClientName] = useState("")
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [useWorkflow, setUseWorkflow] = useState<'yes' | 'no' | null>(null)

    const selectedTemplate = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplateId)

    const handleCreate = () => {
        if (!projectName.trim()) return

        onCreateProject({
            name: projectName,
            description: projectDescription,
            clientName: clientName || undefined,
            workflowTemplate: useWorkflow === 'yes' ? selectedTemplate : undefined
        })

        // Reset form
        setProjectName("")
        setProjectDescription("")
        setClientName("")
        setSelectedTemplateId(null)
        setUseWorkflow(null)
        setStep(1)
        onClose()
    }

    const handleNext = () => {
        if (step === 1 && projectName.trim()) {
            setStep(2)
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Rocket className="w-6 h-6 text-accent" />
                        {step === 1 ? "Create New Project" : "Select Workflow Template"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Set up a new project for your team to collaborate on"
                            : "Choose a workflow template to track project stages"
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        {/* Project Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="project-name" className="text-sm font-semibold">
                                    Project Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="e.g., Customer Churn Prediction Model"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="h-11"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client-name" className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Client Name (Optional)
                                </Label>
                                <Input
                                    id="client-name"
                                    placeholder="e.g., Acme Corp"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the project goals, requirements, and expected outcomes..."
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        {/* Workflow Selection */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">
                                    Do you want to track this project with a workflow?
                                </Label>
                                <RadioGroup value={useWorkflow || ''} onValueChange={(v) => setUseWorkflow(v as 'yes' | 'no')}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="workflow-yes" />
                                        <Label htmlFor="workflow-yes" className="font-normal cursor-pointer">
                                            Yes, use workflow tracking
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="workflow-no" />
                                        <Label htmlFor="workflow-no" className="font-normal cursor-pointer">
                                            No, just create the project
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {useWorkflow === 'yes' && (
                                <div className="space-y-3 animate-fade-in">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Workflow className="w-4 h-4" />
                                        Select Workflow Template
                                    </Label>
                                    <div className="grid gap-3">
                                        {WORKFLOW_TEMPLATES.map((template) => (
                                            <Card
                                                key={template.id}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:border-accent/40",
                                                    selectedTemplateId === template.id && "border-accent ring-2 ring-accent/20 bg-accent/5"
                                                )}
                                                onClick={() => setSelectedTemplateId(template.id)}
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <CardTitle className="text-base flex items-center gap-2">
                                                                {template.id === 'research-required' ? (
                                                                    <Settings className="w-4 h-4 text-purple-600" />
                                                                ) : (
                                                                    <Zap className="w-4 h-4 text-blue-600" />
                                                                )}
                                                                {template.name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {template.description}
                                                            </CardDescription>
                                                        </div>
                                                        {selectedTemplateId === template.id && (
                                                            <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="text-xs">
                                                            {template.stages.length} Stages
                                                        </Badge>
                                                        <span>•</span>
                                                        <span className="capitalize">{template.category.replace('-', ' ')}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Preview Selected Template */}
                                    {selectedTemplate && (
                                        <Card className="bg-muted/30 animate-fade-in">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm">Workflow Stages Preview</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {selectedTemplate.stages.map((stage, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-3 text-sm p-2 bg-background rounded border"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{stage.name}</div>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs shrink-0">
                                                                {stage.responsibleTeam}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {step === 2 && (
                        <Button variant="outline" onClick={handleBack}>
                            Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {step === 1 ? (
                        <Button onClick={handleNext} disabled={!projectName.trim()}>
                            Next: Workflow Setup
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCreate}
                            disabled={useWorkflow === 'yes' && !selectedTemplateId}
                        >
                            Create Project
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
