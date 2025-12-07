"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export type WorkflowPhase = "ideation" | "foundation" | "strategy" | "execution"

interface WorkflowStep {
    id: WorkflowPhase
    label: string
    description: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
    { id: "ideation", label: "Ideation", description: "Start with an idea" },
    { id: "foundation", label: "Foundation", description: "Build core documents" },
    { id: "strategy", label: "Strategy", description: "Plan execution" },
    { id: "execution", label: "Execution", description: "Pitch & manage risks" },
]

interface WorkflowStepperProps {
    currentPhase: WorkflowPhase
    completedPhases: WorkflowPhase[]
    onPhaseClick?: (phase: WorkflowPhase) => void
}

export function WorkflowStepper({ currentPhase, completedPhases, onPhaseClick }: WorkflowStepperProps) {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === currentPhase)

    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {WORKFLOW_STEPS.map((step, index) => {
                    const isCompleted = completedPhases.includes(step.id)
                    const isCurrent = step.id === currentPhase
                    const isAccessible = index <= currentIndex || isCompleted
                    const isLast = index === WORKFLOW_STEPS.length - 1

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <button
                                onClick={() => isAccessible && onPhaseClick?.(step.id)}
                                disabled={!isAccessible}
                                className={cn(
                                    "flex flex-col items-center gap-2 transition-all",
                                    isAccessible ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                                        isCompleted && "bg-accent border-accent text-accent-foreground",
                                        isCurrent && !isCompleted && "border-accent bg-accent/10 text-accent scale-110",
                                        !isCurrent && !isCompleted && "border-muted-foreground/30 bg-background"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <Circle className={cn("w-6 h-6", isCurrent && "fill-accent")} />
                                    )}
                                </div>

                                <div className="text-center">
                                    <div className={cn(
                                        "font-semibold text-sm",
                                        isCurrent && "text-accent",
                                        isCompleted && "text-accent",
                                        !isCurrent && !isCompleted && "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground max-w-[100px]">
                                        {step.description}
                                    </div>
                                </div>
                            </button>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 h-0.5 mx-2 relative">
                                    <div className="absolute inset-0 bg-muted-foreground/20" />
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-accent transition-all duration-500",
                                            isCompleted ? "w-full" : "w-0"
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Helper to get phase tools
export function getPhaseTools(phase: WorkflowPhase): string[] {
    switch (phase) {
        case "ideation":
            return ["idea-generator", "research-agent"]
        case "foundation":
            return ["prd-generator", "technical-blueprint", "user-story-generator"]
        case "strategy":
            return ["roadmap-builder", "user-journey-map", "competitive-intelligence", "feature-prioritization"]
        case "execution":
            return ["pitch-deck-generator", "risk-analysis"]
        default:
            return []
    }
}

// Helper to get next phase
export function getNextPhase(currentPhase: WorkflowPhase): WorkflowPhase | null {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === currentPhase)
    if (currentIndex === -1 || currentIndex === WORKFLOW_STEPS.length - 1) return null
    return WORKFLOW_STEPS[currentIndex + 1].id
}

// Helper to get phase info
export function getPhaseInfo(phase: WorkflowPhase) {
    return WORKFLOW_STEPS.find(step => step.id === phase)
}
