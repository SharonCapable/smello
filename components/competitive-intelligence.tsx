"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Sparkles, Plus, Trash2, Shield, Swords, History, Clock, RotateCcw } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { StoredProject } from "@/lib/storage"

interface CompetitiveIntelligenceProps {
    project?: StoredProject | null
    onBack: () => void
}

export function CompetitiveIntelligence({ project, onBack }: CompetitiveIntelligenceProps) {
    const [competitors, setCompetitors] = useState<string[]>([])
    const [newCompetitor, setNewCompetitor] = useState("")
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nSector: ${project.product.sector}` : "")
    const [swot, setSwot] = useState("")
    const [featureMatrix, setFeatureMatrix] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [history, setHistory] = useState<Array<{
        id: string
        date: string
        type: "swot" | "matrix"
        content: string
        competitors: string[]
        context: string
    }>>([])
    const [showHistory, setShowHistory] = useState(false)

    // Load history on mount
    useState(() => {
        if (typeof window !== "undefined") {
            const savedKey = project ? `smello-ci-history-${project.id}` : "smello-ci-history-global"
            const saved = localStorage.getItem(savedKey)
            if (saved) {
                try {
                    setHistory(JSON.parse(saved))
                } catch (e) {
                    console.error("Failed to parse history", e)
                }
            }
        }
    })

    const saveHistory = (newItem: any) => {
        const updated = [newItem, ...history]
        setHistory(updated)
        if (typeof window !== "undefined") {
            const savedKey = project ? `smello-ci-history-${project.id}` : "smello-ci-history-global"
            localStorage.setItem(savedKey, JSON.stringify(updated))
        }
    }

    const cleanContent = (text: string) => {
        // Remove markdown code blocks if the LLM wrapped it
        return text.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/\n```$/, '')
    }

    const handleAddCompetitor = () => {
        if (newCompetitor.trim()) {
            setCompetitors([...competitors, newCompetitor.trim()])
            setNewCompetitor("")
        }
    }

    const handleRemoveCompetitor = (index: number) => {
        setCompetitors(competitors.filter((_, i) => i !== index))
    }

    const handleGenerate = async (type: "swot" | "matrix") => {
        // Delegate key selection and quota enforcement to server `/api/generate`.

        if (competitors.length === 0) {
            // Check if user wants to proceed without competitors (using AI to guess)
            if (!confirm("No competitors added. Do you want the AI to identify potential competitors and proceed?")) {
                return
            }
        }

        setIsGenerating(true)
        setError(null)

        try {

            let prompt = ""
            if (type === "swot") {
                prompt = `
          Context:
          ${context}
          
          Competitors:
          ${competitors.join(", ")}

          Task:
          Generate a SWOT analysis for the product, considering the listed competitors.
          
          Output Format:
          Markdown with sections for Strengths, Weaknesses, Opportunities, Threats.
        `
            } else {
                prompt = `
          Context:
          ${context}
          
          Competitors:
          ${competitors.join(", ")}

          Task:
          Generate a Feature Comparison Matrix comparing the product against its competitors.
          
          Output Format:
          Markdown table.
        `
            }

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
                const cleaned = cleanContent(content)
                if (type === "swot") setSwot(cleaned)
                else setFeatureMatrix(cleaned)

                saveHistory({
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type,
                    content: cleaned,
                    competitors: [...competitors],
                    context
                })
            }

        } catch (error) {
            console.error("Error generating intelligence:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="w-full h-full p-6 space-y-6">
            <ApiKeySetup
                isOpen={showApiKeySetup}
                onApiKeySet={() => setShowApiKeySetup(false)}
                onClose={() => setShowApiKeySetup(false)}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <Search className="w-8 h-8 text-accent" />
                        Competitive Intelligence
                    </h2>
                    <p className="text-muted-foreground">
                        Analyze competitors and generate SWOT & feature matrices.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Sheet open={showHistory} onOpenChange={setShowHistory}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <History className="w-4 h-4 mr-2" />
                                History
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Analysis History</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                                <div className="space-y-4">
                                    {history.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">No history yet.</p>
                                    ) : (
                                        history.map((item) => (
                                            <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                                                if (item.type === "swot") setSwot(item.content)
                                                else setFeatureMatrix(item.content)
                                                setContext(item.context)
                                                setCompetitors(item.competitors)
                                                setShowHistory(false)
                                            }}>
                                                <CardHeader className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-semibold text-sm capitalize flex items-center gap-2">
                                                            {item.type === "swot" ? <Shield className="w-3 h-3" /> : <Swords className="w-3 h-3" />}
                                                            {item.type === "matrix" ? "Feature Matrix" : "SWOT Analysis"}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <CardDescription className="line-clamp-2 text-xs mt-1">
                                                        {item.competitors.length} Competitors: {item.competitors.join(", ")}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                    <Button variant="outline" onClick={onBack}>Back</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Competitors</CardTitle>
                            <CardDescription>Add key competitors to analyze against.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newCompetitor}
                                    onChange={(e) => setNewCompetitor(e.target.value)}
                                    placeholder="Competitor Name"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                                />
                                <Button onClick={handleAddCompetitor} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {competitors.map((comp, index) => (
                                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                                        <span>{comp}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveCompetitor(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {competitors.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">No competitors added.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product Context</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="swot">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="swot" className="flex gap-2">
                                <Shield className="w-4 h-4" /> SWOT Analysis
                            </TabsTrigger>
                            <TabsTrigger value="matrix" className="flex gap-2">
                                <Swords className="w-4 h-4" /> Feature Matrix
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="swot" className="space-y-4 mt-6">
                            <div className="flex justify-end">
                                <Button onClick={() => handleGenerate("swot")} disabled={isGenerating}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate SWOT
                                </Button>
                            </div>
                            {swot ? (
                                <Card>
                                    <CardContent className="pt-6 overflow-x-auto">
                                        <MarkdownRenderer content={swot} />
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No SWOT Analysis</h3>
                                    <p className="text-muted-foreground">Click generate to analyze strengths, weaknesses, opportunities, and threats.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="matrix" className="space-y-4 mt-6">
                            <div className="flex justify-end">
                                <Button onClick={() => handleGenerate("matrix")} disabled={isGenerating}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Matrix
                                </Button>
                            </div>
                            {featureMatrix ? (
                                <Card>
                                    <CardContent className="pt-6 overflow-x-auto">
                                        <MarkdownRenderer content={featureMatrix} />
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No Feature Matrix</h3>
                                    <p className="text-muted-foreground">Click generate to compare features against competitors.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div >
    )
}
