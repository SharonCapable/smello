"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Sparkles, Plus, Trash2, Milestone } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import type { StoredProject } from "@/lib/storage"
import { saveRoadmapToProject } from "@/lib/project-artifacts-manager"
import { useEffect } from "react"

interface RoadmapBuilderProps {
    project?: StoredProject | null
    onBack: () => void
}

interface RoadmapPhase {
    id: string
    name: string
    timeframe: string
    features: string[]
    goals: string
}

export function RoadmapBuilder({ project, onBack }: RoadmapBuilderProps) {
    const [phases, setPhases] = useState<RoadmapPhase[]>([
        { id: "1", name: "MVP", timeframe: "Month 1-2", features: [], goals: "Core value proposition" },
        { id: "2", name: "V1.0", timeframe: "Month 3-4", features: [], goals: "Market readiness" },
        { id: "3", name: "V2.0", timeframe: "Month 5-6", features: [], goals: "Scale and optimization" },
    ])
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nKey Features: ${project.product.key_features?.join(", ")}` : "")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Load existing roadmap if available
    useEffect(() => {
        if (project?.roadmap && Array.isArray(project.roadmap) && project.roadmap.length > 0) {
            setPhases(project.roadmap)
        }
    }, [project])

    const handleUpdatePhase = (id: string, field: keyof RoadmapPhase, value: any) => {
        setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const handleAddFeature = (phaseId: string) => {
        const phase = phases.find(p => p.id === phaseId)
        if (phase) {
            handleUpdatePhase(phaseId, "features", [...phase.features, ""])
        }
    }

    const handleUpdateFeature = (phaseId: string, index: number, value: string) => {
        const phase = phases.find(p => p.id === phaseId)
        if (phase) {
            const newFeatures = [...phase.features]
            newFeatures[index] = value
            handleUpdatePhase(phaseId, "features", newFeatures)
        }
    }

    const handleRemoveFeature = (phaseId: string, index: number) => {
        const phase = phases.find(p => p.id === phaseId)
        if (phase) {
            const newFeatures = phase.features.filter((_, i) => i !== index)
            handleUpdatePhase(phaseId, "features", newFeatures)
        }
    }

    const handleGenerate = async () => {
        // Delegate key selection and quota enforcement to server `/api/generate`.
        setIsGenerating(true)
        setError(null)

        try {

            const prompt = `
        Context:
        ${context}

        Task:
        Generate a product roadmap with 3 phases: MVP, V1.0, and V2.0.
        
        For each phase, provide:
        - Timeframe
        - Key Goals
        - List of Features (be specific)

        Return ONLY a JSON array with this structure:
        [
          {
            "name": "MVP",
            "timeframe": "...",
            "goals": "...",
            "features": ["feature1", "feature2", ...]
          },
          ...
        ]
      `

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'anthropic', prompt, model: 'claude-3-5-sonnet-latest' }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate content")
            }

            const data = await response.json()
            const content = data.content?.[0]?.text || data.candidates?.[0]?.content?.parts?.[0]?.text

            if (content) {
                const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
                const generatedPhases = JSON.parse(cleanedText) as any[]

                const newPhases = generatedPhases.map((gp, idx) => ({
                    id: phases[idx]?.id || crypto.randomUUID(),
                    name: gp.name,
                    timeframe: gp.timeframe,
                    goals: gp.goals,
                    features: gp.features
                }))

                setPhases(newPhases)
            }

        } catch (error) {
            console.error("Error generating roadmap:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveToProject = async () => {
        if (!project?.id) return
        setIsSaving(true)
        setError(null)
        try {
            await saveRoadmapToProject(project.id, phases)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error("Error saving roadmap:", error)
            setError("Failed to save roadmap to project")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <ApiKeySetup
                isOpen={showApiKeySetup}
                onApiKeySet={() => setShowApiKeySetup(false)}
                onClose={() => setShowApiKeySetup(false)}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <Milestone className="w-8 h-8 text-accent" />
                        Roadmap Builder
                    </h2>
                    <p className="text-muted-foreground">
                        Plan your product evolution from MVP to scale.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    {project && (
                        <Button
                            onClick={handleSaveToProject}
                            disabled={phases.length === 0 || isSaving}
                            variant={saveSuccess ? "default" : "outline"}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Project"}
                        </Button>
                    )}
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Auto-Generate Roadmap
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your product vision and key features..."
                        className="min-h-[80px]"
                    />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                {phases.map((phase) => (
                    <Card key={phase.id} className="relative flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <Input
                                    value={phase.name}
                                    onChange={(e) => handleUpdatePhase(phase.id, "name", e.target.value)}
                                    className="font-bold text-xl border-none px-0 h-auto focus-visible:ring-0 w-2/3"
                                />
                                <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <Input
                                        value={phase.timeframe}
                                        onChange={(e) => handleUpdatePhase(phase.id, "timeframe", e.target.value)}
                                        className="border-none px-0 h-auto focus-visible:ring-0 w-20 text-right bg-transparent"
                                    />
                                </div>
                            </div>
                            <Textarea
                                value={phase.goals}
                                onChange={(e) => handleUpdatePhase(phase.id, "goals", e.target.value)}
                                className="text-sm min-h-[60px] bg-accent/5 border-accent/20"
                                placeholder="Key goals for this phase..."
                            />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-2">
                            <div className="font-semibold text-sm text-muted-foreground uppercase">Features</div>
                            <div className="space-y-2 flex-1">
                                {phase.features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => handleUpdateFeature(phase.id, idx, e.target.value)}
                                            className="text-sm"
                                            placeholder="Feature description"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() => handleRemoveFeature(phase.id, idx)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 border-dashed"
                                onClick={() => handleAddFeature(phase.id)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Feature
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
