"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Zap, Lightbulb, FileText, Map, TrendingUp, Presentation, AlertTriangle, Server, Swords, Search, BarChart3 } from "lucide-react"
import type { WorkflowPhase } from "./workflow-stepper"

interface WorkflowHomeProps {
    onStartJourney: () => void
    onQuickAccess: (toolId: string) => void
    onLoadProject: () => void
}

const PHASE_CARDS = [
    {
        phase: "ideation" as WorkflowPhase,
        icon: Lightbulb,
        title: "1. Ideation",
        description: "Generate and refine your product idea",
        tools: [
            { id: "idea-generator", name: "Idea Generator", icon: Lightbulb },
            { id: "research-agent", name: "Research Agent", icon: Search }
        ],
        color: "from-purple-500/20 to-pink-500/20"
    },
    {
        phase: "foundation" as WorkflowPhase,
        icon: FileText,
        title: "2. Foundation",
        description: "Build core product documents",
        tools: [
            { id: "prd-generator", name: "PRD", icon: FileText },
            { id: "technical-blueprint", name: "Blueprint", icon: Server },
            { id: "user-story-generator", name: "User Stories", icon: FileText }
        ],
        color: "from-blue-500/20 to-cyan-500/20"
    },
    {
        phase: "strategy" as WorkflowPhase,
        icon: Map,
        title: "3. Strategy",
        description: "Plan your execution strategy",
        tools: [
            { id: "roadmap-builder", name: "Roadmap", icon: TrendingUp },
            { id: "user-journey-map", name: "User Journey", icon: Map },
            { id: "competitive-intelligence", name: "Competition", icon: Swords },
            { id: "feature-prioritization", name: "Prioritization", icon: BarChart3 }
        ],
        color: "from-green-500/20 to-emerald-500/20"
    },
    {
        phase: "execution" as WorkflowPhase,
        icon: Rocket,
        title: "4. Execution",
        description: "Pitch and manage risks",
        tools: [
            { id: "pitch-deck-generator", name: "Pitch Deck", icon: Presentation },
            { id: "risk-analysis", name: "Risk Analysis", icon: AlertTriangle }
        ],
        color: "from-orange-500/20 to-red-500/20"
    }
]

export function WorkflowHome({ onStartJourney, onQuickAccess, onLoadProject }: WorkflowHomeProps) {
    const [selectedMode, setSelectedMode] = useState<"guided" | "quick">("guided")

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                    Turn Your Idea Into a Product
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Smello guides you through every step of product development—from ideation to execution.
                </p>
            </div>

            {/* Mode Selection */}
            <div className="flex justify-center gap-4">
                <Button
                    size="lg"
                    variant={selectedMode === "guided" ? "default" : "outline"}
                    onClick={() => setSelectedMode("guided")}
                    className="gap-2"
                >
                    <Rocket className="w-5 h-5" />
                    Guided Journey
                </Button>
                <Button
                    size="lg"
                    variant={selectedMode === "quick" ? "default" : "outline"}
                    onClick={() => setSelectedMode("quick")}
                    className="gap-2"
                >
                    <Zap className="w-5 h-5" />
                    Quick Tool Access
                </Button>
            </div>

            {/* Guided Journey Mode */}
            {selectedMode === "guided" && (
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold">The Product Journey</h2>
                        <p className="text-muted-foreground">
                            Follow these 4 phases to transform your idea into a complete product specification
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {PHASE_CARDS.map((phase, index) => {
                            const Icon = phase.icon
                            return (
                                <Card key={phase.phase} className="relative overflow-hidden group hover:shadow-lg transition-all">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <CardHeader className="relative">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <CardTitle>{phase.title}</CardTitle>
                                                <CardDescription>{phase.description}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="relative space-y-2">
                                        <div className="text-sm font-semibold text-muted-foreground mb-2">Tools:</div>
                                        {phase.tools.map(tool => {
                                            const ToolIcon = tool.icon
                                            return (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => onQuickAccess(tool.id)}
                                                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent/10 transition-colors text-left"
                                                >
                                                    <ToolIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{tool.name}</span>
                                                </button>
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={onStartJourney} className="gap-2">
                            <Rocket className="w-5 h-5" />
                            Start New Product Journey
                        </Button>
                        <Button size="lg" variant="outline" onClick={onLoadProject}>
                            Continue Existing Project
                        </Button>
                    </div>
                </div>
            )}

            {/* Quick Access Mode */}
            {selectedMode === "quick" && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold">Quick Tool Access</h2>
                        <p className="text-muted-foreground">
                            Jump directly to any tool without following the guided workflow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {PHASE_CARDS.flatMap(phase =>
                            phase.tools.map(tool => {
                                const ToolIcon = tool.icon
                                return (
                                    <Card
                                        key={tool.id}
                                        className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                                        onClick={() => onQuickAccess(tool.id)}
                                    >
                                        <CardHeader className="text-center space-y-2">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                                                <ToolIcon className="w-6 h-6 text-accent" />
                                            </div>
                                            <CardTitle className="text-base">{tool.name}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
