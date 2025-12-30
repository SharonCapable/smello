"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Sparkles, Plus, Trash2, Activity, Save } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import type { StoredProject } from "@/lib/storage"
import { saveRiskAnalysisToProject } from "@/lib/project-artifacts-manager"

interface RiskAnalysisProps {
    project?: StoredProject | null
    onBack: () => void
}

type RiskCategory = "Technical" | "Business" | "Market" | "Operational"

interface Risk {
    id: string
    description: string
    category: RiskCategory
    probability: number // 1-5
    impact: number // 1-5
    mitigation: string
}

export function RiskAnalysis({ project, onBack }: RiskAnalysisProps) {
    const [risks, setRisks] = useState<Risk[]>([])
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nSector: ${project.product.sector}` : "")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Load existing risks if available
    useEffect(() => {
        if (project?.riskAnalysis && Array.isArray(project.riskAnalysis) && risks.length === 0) {
            setRisks(project.riskAnalysis)
        }
    }, [project])

    const handleAddRisk = () => {
        setRisks([
            ...risks,
            {
                id: crypto.randomUUID(),
                description: "",
                category: "Technical",
                probability: 3,
                impact: 3,
                mitigation: ""
            }
        ])
    }

    const handleRemoveRisk = (id: string) => {
        setRisks(risks.filter(r => r.id !== id))
    }

    const handleUpdateRisk = (id: string, field: keyof Risk, value: any) => {
        setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r))
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
        Identify potential risks for this product across 4 categories:
        - Technical Risks
        - Business Risks
        - Market Risks
        - Operational Risks
        
        For each risk, provide:
        - Risk description
        - Probability (1-5)
        - Impact (1-5)
        - Mitigation strategy

        Return ONLY a JSON array with this structure:
        [
          {
            "category": "Technical",
            "description": "...",
            "probability": 3,
            "impact": 4,
            "mitigation": "..."
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
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (content) {
                const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
                const generatedRisks = JSON.parse(cleanedText) as any[]

                const newRisks = generatedRisks.map(gr => ({
                    id: crypto.randomUUID(),
                    category: gr.category as RiskCategory,
                    description: gr.description,
                    probability: gr.probability,
                    impact: gr.impact,
                    mitigation: gr.mitigation
                }))

                setRisks([...risks, ...newRisks])
            }

        } catch (error) {
            console.error("Error generating risks:", error)
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
            await saveRiskAnalysisToProject(project.id, risks)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error("Error saving risk analysis:", error)
            setError("Failed to save risks to project")
        } finally {
            setIsSaving(false)
        }
    }

    const getRiskScore = (risk: Risk) => risk.probability * risk.impact
    const getRiskColor = (score: number) => {
        if (score >= 15) return "text-red-500"
        if (score >= 8) return "text-yellow-500"
        return "text-green-500"
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <ApiKeySetup
                isOpen={showApiKeySetup}
                onApiKeySet={() => setShowApiKeySetup(false)}
                onClose={() => setShowApiKeySetup(false)}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-accent" />
                        Risk & Impact Analysis
                    </h2>
                    <p className="text-muted-foreground">
                        Identify potential risks and mitigation strategies.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    {project && (
                        <Button
                            onClick={handleSaveToProject}
                            disabled={risks.length === 0 || isSaving}
                            variant={saveSuccess ? "default" : "outline"}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Project"}
                        </Button>
                    )}
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Auto-Detect Risks
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your product context..."
                        className="min-h-[80px]"
                    />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Risk Register</h3>
                    <Button onClick={handleAddRisk} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Risk
                    </Button>
                </div>

                {risks.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Risks Identified</h3>
                        <p className="text-muted-foreground">Add risks manually or use AI to detect them.</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {risks.map((risk) => (
                        <Card key={risk.id} className="relative">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={risk.description}
                                            onChange={(e) => handleUpdateRisk(risk.id, "description", e.target.value)}
                                            placeholder="Risk Description"
                                            className="font-medium"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={risk.category}
                                                onChange={(e) => handleUpdateRisk(risk.id, "category", e.target.value)}
                                            >
                                                <option value="Technical">Technical</option>
                                                <option value="Business">Business</option>
                                                <option value="Market">Market</option>
                                                <option value="Operational">Operational</option>
                                            </select>
                                            <div className={`flex items-center gap-1 font-bold ${getRiskColor(getRiskScore(risk))}`}>
                                                <Activity className="w-4 h-4" />
                                                Score: {getRiskScore(risk)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={() => handleRemoveRisk(risk.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs uppercase font-semibold text-muted-foreground">
                                            <span>Probability</span>
                                            <span>{risk.probability}/5</span>
                                        </div>
                                        <Slider
                                            value={[risk.probability]}
                                            min={1}
                                            max={5}
                                            step={1}
                                            onValueChange={(val) => handleUpdateRisk(risk.id, "probability", val[0])}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs uppercase font-semibold text-muted-foreground">
                                            <span>Impact</span>
                                            <span>{risk.impact}/5</span>
                                        </div>
                                        <Slider
                                            value={[risk.impact]}
                                            min={1}
                                            max={5}
                                            step={1}
                                            onValueChange={(val) => handleUpdateRisk(risk.id, "impact", val[0])}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Mitigation Strategy</label>
                                    <Textarea
                                        value={risk.mitigation}
                                        onChange={(e) => handleUpdateRisk(risk.id, "mitigation", e.target.value)}
                                        className="h-[80px] text-sm"
                                        placeholder="How will you handle this risk?"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
