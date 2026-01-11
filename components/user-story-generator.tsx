"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Save, Download, Plus, Trash2, Edit3, Loader2, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApiKeySetup } from "@/components/api-key-setup"
import type { StoredProject } from "@/lib/storage"
import { updateProject } from "@/lib/firestore-service"
import type { Epic, UserStory } from "@/types/user-story"

interface UserStoryGeneratorProps {
    project?: StoredProject | null
    onBack: () => void
    onProjectUpdate?: (project: StoredProject) => void
}

export function UserStoryGenerator({ project, onBack, onProjectUpdate }: UserStoryGeneratorProps) {
    const { toast } = useToast()
    const [epics, setEpics] = useState<Epic[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nTarget Audience: ${project.product.target_audience}` : "")

    // Load existing epics if available
    React.useEffect(() => {
        if (project?.epics && Array.isArray(project.epics) && epics.length === 0) {
            setEpics(project.epics as Epic[])
        }
    }, [project])

    const handleAddEpic = () => {
        setEpics([
            ...epics,
            {
                id: crypto.randomUUID(),
                title: "New Epic",
                description: "",
                user_stories: []
            }
        ])
    }

    const handleUpdateEpic = (id: string, field: keyof Epic, value: any) => {
        setEpics(epics.map(e => e.id === id ? { ...e, [field]: value } : e))
    }

    const handleRemoveEpic = (id: string) => {
        setEpics(epics.filter(e => e.id !== id))
    }

    const generateEpics = async () => {
        if (!context.trim()) {
            setError("Please provide some product context first.")
            return
        }
        setIsGenerating(true)
        setError(null)

        try {
            const prompt = `
        Context:
        ${context}

        Task:
        Generate 3-5 high-level Epics for this product.
        Return the result as a JSON array of objects with the following structure:
        [
          {
            "title": "Epic Title",
            "description": "Brief description of the epic"
          }
        ]
        Do not include any markdown formatting or extra text, just the JSON array.
      `

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'gemini', prompt, model: 'gemini-1.5-pro' }),
            })

            if (!response.ok) throw new Error("Failed to generate content")

            const data = await response.json()
            let content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.text
            content = content.replace(/```json/g, '').replace(/```/g, '').trim()

            let generatedEpics = []
            try {
                generatedEpics = JSON.parse(content)
            } catch (e) {
                console.error("Failed to parse JSON", content)
                throw new Error("Failed to parse AI response")
            }

            if (Array.isArray(generatedEpics)) {
                const newEpics: Epic[] = generatedEpics.map((e: any) => ({
                    id: crypto.randomUUID(),
                    title: e.title,
                    description: e.description,
                    user_stories: []
                }))
                setEpics([...epics, ...newEpics])
            }

        } catch (error) {
            console.error("Error generating epics:", error)
            setError(error instanceof Error ? error.message : "Failed to generate epics")
        } finally {
            setIsGenerating(false)
        }
    }

    const generateStoriesForEpic = async (epicId: string) => {
        const epic = epics.find(e => e.id === epicId)
        if (!epic) return

        setIsGenerating(true)
        setError(null)

        try {
            const prompt = `
        Context:
        ${context}
        
        Epic: ${epic.title} - ${epic.description}

        Task:
        Generate 3-5 key User Stories for this specific Epic.
        Return the result as a JSON array of objects with the following structure:
        [
          {
            "title": "Story Title",
            "asA": "user role",
            "iWantTo": "action",
            "soThat": "benefit",
            "acceptanceCriteria": ["criterion 1", "criterion 2"],
            "priority": "High"
          }
        ]
        Do not include any markdown formatting or extra text, just the JSON array.
        Priority should be High, Medium, or Low.
      `

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'gemini', prompt, model: 'gemini-1.5-pro' }),
            })

            if (!response.ok) throw new Error("Failed to generate content")

            const data = await response.json()
            let content = data.candidates?.[0]?.content?.parts?.[0]?.text || data.text
            content = content.replace(/```json/g, '').replace(/```/g, '').trim()

            let generatedStories = []
            try {
                generatedStories = JSON.parse(content)
            } catch (e) {
                console.error("Failed to parse JSON", content)
                throw new Error("Failed to parse AI response")
            }

            if (Array.isArray(generatedStories)) {
                const newStories: UserStory[] = generatedStories.map((s: any) => ({
                    id: crypto.randomUUID(),
                    title: s.title,
                    description: `As a ${s.asA}, I want to ${s.iWantTo}, so that ${s.soThat}`,
                    acceptance_criteria: s.acceptanceCriteria || [],
                    edge_cases: [],
                    validations: [],
                    story_points: 1,
                    optional_fields: {
                        priority: s.priority || "Medium"
                    }
                }))

                setEpics(epics.map(e => e.id === epicId ? { ...e, user_stories: [...e.user_stories, ...newStories] } : e))
            }

        } catch (error) {
            console.error("Error generating stories:", error)
            setError("Failed to generate stories")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveToProject = async () => {
        if (!project?.id) {
            setError("No project selected.")
            return
        }

        setIsSaving(true)
        setSaveSuccess(false)

        try {
            await updateProject(project.id, {
                epics: epics
            })

            // Update local project reference if function provided
            if (onProjectUpdate) {
                onProjectUpdate({
                    ...project,
                    epics: epics
                })
            }

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
            toast({ title: "Success", description: "User stories saved to project." })
        } catch (error) {
            console.error("Save failed:", error)
            setError("Failed to save to project")
        } finally {
            setIsSaving(false)
        }
    }

    const handleExport = () => {
        let mdContent = `# User Stories for ${project?.product.name || 'Product'}\n\n`

        epics.forEach(epic => {
            mdContent += `## Epic: ${epic.title}\n${epic.description}\n\n`
            if (epic.user_stories.length > 0) {
                epic.user_stories.forEach(story => {
                    const priority = story.optional_fields?.priority || "Medium";
                    mdContent += `### ${story.title} (${priority})\n`
                    mdContent += `${story.description}\n\n`
                    mdContent += `**Acceptance Criteria:**\n`
                    story.acceptance_criteria.forEach(ac => mdContent += `- ${ac}\n`)
                    mdContent += `\n`
                })
            } else {
                mdContent += `_No stories yet_\n\n`
            }
            mdContent += `---\n\n`
        })

        const blob = new Blob([mdContent], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `user-stories-${project?.name || "project"}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
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
                        <FileText className="w-8 h-8 text-accent" />
                        User Story Generator
                    </h2>
                    <p className="text-muted-foreground">
                        Define high-level Epics and generate detailed User Stories with acceptance criteria.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    {project && (
                        <Button onClick={handleSaveToProject} disabled={isSaving} variant={saveSuccess ? "default" : "outline"}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Project"}
                        </Button>
                    )}
                    <Button onClick={handleExport} disabled={epics.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-[300px_1fr] gap-6">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Product Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                className="min-h-[150px] text-sm"
                                placeholder="Describe product context..."
                            />
                            <Button className="w-full" onClick={generateEpics} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Generate Epics
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleAddEpic}>
                                <Plus className="w-4 h-4 mr-2" />
                                Manual Epic
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Label>Epics Queue</Label>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {epics.map(epic => (
                                <div key={epic.id} className="p-3 bg-muted rounded-lg text-sm border hover:border-accent cursor-pointer">
                                    <div className="font-semibold">{epic.title}</div>
                                    <div className="text-muted-foreground text-xs truncate">{epic.description || "No description"}</div>
                                    <div className="mt-2 text-xs bg-background inline-block px-2 py-1 rounded border">
                                        {epic.user_stories.length} stories
                                    </div>
                                </div>
                            ))}
                            {epics.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm p-4">
                                    No epics defined yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {epics.map((epic) => (
                        <Card key={epic.id} className="animate-fade-in-up">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={epic.title}
                                            onChange={(e) => handleUpdateEpic(epic.id, "title", e.target.value)}
                                            className="text-lg font-semibold bg-transparent border-transparent hover:border-input transition-colors h-auto p-0 rounded-none focus-visible:ring-0"
                                        />
                                        <Textarea
                                            value={epic.description}
                                            onChange={(e) => handleUpdateEpic(epic.id, "description", e.target.value)}
                                            placeholder="Epic description..."
                                            className="min-h-[60px] resize-none bg-transparent border-transparent hover:border-input transition-colors"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEpic(epic.id)} className="text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => generateStoriesForEpic(epic.id)}
                                        disabled={isGenerating}
                                    >
                                        <Sparkles className="w-3 h-3 mr-2" />
                                        Generate Stories for this Epic
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {epic.user_stories.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground italic border-2 border-dashed rounded-lg">
                                        No user stories generated for this epic yet.
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {epic.user_stories.map((story) => (
                                            <div key={story.id} className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium text-base">{story.title}</div>
                                                    <Badge variant={
                                                        story.optional_fields?.priority === "High" ? "destructive" :
                                                            story.optional_fields?.priority === "Medium" ? "default" :
                                                                "secondary"
                                                    }>
                                                        {story.optional_fields?.priority || "Medium"}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm space-y-1 mb-3 text-muted-foreground">
                                                    <div className="italic">{story.description}</div>
                                                </div>
                                                <div className="bg-muted/50 rounded p-3 text-sm">
                                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                                        <CheckCircle2 className="w-3 h-3" /> Acceptance Criteria
                                                    </div>
                                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                                                        {story.acceptance_criteria.map((ac, i) => (
                                                            <li key={i}>{ac}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
