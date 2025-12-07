"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Map, Plus, Trash2, Sparkles, ArrowRight, Smile, Frown, Meh } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import type { StoredProject } from "@/lib/storage"

interface UserJourneyMapProps {
    project?: StoredProject | null
    onBack: () => void
}

interface JourneyStage {
    id: string
    name: string
    actions: string
    touchpoints: string
    emotion: number // 1-5
    painPoints: string
    opportunities: string
}

const DEFAULT_STAGES = [
    { name: "Awareness", emotion: 3 },
    { name: "Consideration", emotion: 3 },
    { name: "Onboarding", emotion: 4 },
    { name: "Usage", emotion: 4 },
    { name: "Retention", emotion: 5 },
]

export function UserJourneyMap({ project, onBack }: UserJourneyMapProps) {
    const [stages, setStages] = useState<JourneyStage[]>(
        DEFAULT_STAGES.map(s => ({
            id: crypto.randomUUID(),
            name: s.name,
            actions: "",
            touchpoints: "",
            emotion: s.emotion,
            painPoints: "",
            opportunities: ""
        }))
    )
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nTarget Audience: ${project.product.target_audience}` : "")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdateStage = (id: string, field: keyof JourneyStage, value: any) => {
        setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s))
    }

    const handleAddStage = () => {
        setStages([
            ...stages,
            {
                id: crypto.randomUUID(),
                name: "New Stage",
                actions: "",
                touchpoints: "",
                emotion: 3,
                painPoints: "",
                opportunities: ""
            }
        ])
    }

    const handleRemoveStage = (id: string) => {
        setStages(stages.filter(s => s.id !== id))
    }

    const handleGenerate = async () => {
        if (!ApiKeyManager.hasApiKey()) {
            setShowApiKeySetup(true)
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const apiKey = ApiKeyManager.getApiKey('gemini')
            if (!apiKey) throw new Error("No Gemini API key configured")

            const prompt = `
        Context:
        ${context}

        Task:
        Generate a detailed user journey map.
        
        Stages:
        ${stages.map(s => s.name).join(", ")}

        For each stage, provide:
        - User Actions
        - Touchpoints
        - Emotional Score (1-5, where 1 is frustrated, 5 is delighted)
        - Pain Points
        - Opportunities

        Return ONLY a JSON array with this structure:
        [
          {
            "name": "Stage Name",
            "actions": "...",
            "touchpoints": "...",
            "emotion": 3,
            "painPoints": "...",
            "opportunities": "..."
          }
        ]
      `

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                    }
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate content")
            }

            const data = await response.json()
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (content) {
                const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
                const generatedStages = JSON.parse(cleanedText) as any[]

                const newStages = generatedStages.map(gs => ({
                    id: crypto.randomUUID(),
                    name: gs.name,
                    actions: gs.actions,
                    touchpoints: gs.touchpoints,
                    emotion: gs.emotion,
                    painPoints: gs.painPoints,
                    opportunities: gs.opportunities
                }))

                setStages(newStages)
            }

        } catch (error) {
            console.error("Error generating journey:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const getEmotionIcon = (score: number) => {
        if (score <= 2) return <Frown className="w-5 h-5 text-red-500" />
        if (score === 3) return <Meh className="w-5 h-5 text-yellow-500" />
        return <Smile className="w-5 h-5 text-green-500" />
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
                        <Map className="w-8 h-8 text-accent" />
                        User Journey Map
                    </h2>
                    <p className="text-muted-foreground">
                        Visualize the user's path from awareness to retention.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Auto-Generate Journey
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your user persona and their goals..."
                        className="min-h-[80px]"
                    />
                </CardContent>
            </Card>

            <div className="space-y-6 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                    {stages.map((stage, index) => (
                        <Card key={stage.id} className="w-[300px] flex-shrink-0 relative group">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Input
                                        value={stage.name}
                                        onChange={(e) => handleUpdateStage(stage.id, "name", e.target.value)}
                                        className="font-bold text-lg border-none px-0 h-auto focus-visible:ring-0"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveStage(stage.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Actions</label>
                                    <Textarea
                                        value={stage.actions}
                                        onChange={(e) => handleUpdateStage(stage.id, "actions", e.target.value)}
                                        className="text-sm min-h-[80px]"
                                        placeholder="What is the user doing?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Touchpoints</label>
                                    <Input
                                        value={stage.touchpoints}
                                        onChange={(e) => handleUpdateStage(stage.id, "touchpoints", e.target.value)}
                                        className="text-sm"
                                        placeholder="Website, App, Email..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">Emotion</label>
                                        {getEmotionIcon(stage.emotion)}
                                    </div>
                                    <Slider
                                        value={[stage.emotion]}
                                        min={1}
                                        max={5}
                                        step={1}
                                        onValueChange={(val) => handleUpdateStage(stage.id, "emotion", val[0])}
                                        className="py-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase text-red-500">Pain Points</label>
                                    <Textarea
                                        value={stage.painPoints}
                                        onChange={(e) => handleUpdateStage(stage.id, "painPoints", e.target.value)}
                                        className="text-sm min-h-[60px] border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                                        placeholder="Frustrations..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase text-green-500">Opportunities</label>
                                    <Textarea
                                        value={stage.opportunities}
                                        onChange={(e) => handleUpdateStage(stage.id, "opportunities", e.target.value)}
                                        className="text-sm min-h-[60px] border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10"
                                        placeholder="Ideas to improve..."
                                    />
                                </div>
                            </CardContent>

                            {index < stages.length - 1 && (
                                <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 z-10 text-muted-foreground">
                                    <ArrowRight className="w-8 h-8 opacity-20" />
                                </div>
                            )}
                        </Card>
                    ))}

                    <Button
                        variant="outline"
                        className="h-auto w-[100px] flex-shrink-0 flex flex-col items-center justify-center gap-2 border-dashed"
                        onClick={handleAddStage}
                    >
                        <Plus className="w-6 h-6" />
                        Add Stage
                    </Button>
                </div>
            </div>
        </div>
    )
}
