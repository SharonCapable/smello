"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Sparkles, RefreshCw, AlertCircle, Save, Download, Plus, Trash2, Edit3, Eye } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { StoredProject } from "@/lib/storage"
import { savePRDToProject } from "@/lib/project-artifacts-manager"
import { useRouter } from "next/navigation"

interface PRDGeneratorProps {
    project?: StoredProject | null
    onBack: () => void
}

type PRDSectionType =
    | "problem_statement"
    | "goals_nongoals"
    | "personas"
    | "user_stories"
    | "user_flows"
    | "functional_requirements"
    | "non_functional_requirements"
    | "analytics"
    | "risks"

interface PRDSection {
    id: string
    type: PRDSectionType
    title: string
    content: string
    isPreview: boolean
}

const SECTION_TYPES: { type: PRDSectionType; label: string; description: string }[] = [
    { type: "problem_statement", label: "Problem Statement", description: "Define the core problem and why it needs solving." },
    { type: "goals_nongoals", label: "Goals & Non-Goals", description: "What are we trying to achieve? What is out of scope?" },
    { type: "personas", label: "User Personas", description: "Who are the users?" },
    { type: "user_flows", label: "User Flows", description: "How do users interact with the product?" },
    { type: "functional_requirements", label: "Functional Requirements", description: "What must the system do?" },
    { type: "non_functional_requirements", label: "Non-Functional Requirements", description: "Performance, security, etc." },
    { type: "analytics", label: "Analytics & Success Metrics", description: "How do we measure success?" },
    { type: "risks", label: "Risks & Mitigation", description: "What could go wrong?" },
]

export function PRDGenerator({ project, onBack }: PRDGeneratorProps) {
    const [sections, setSections] = useState<PRDSection[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nTarget Audience: ${project.product.target_audience}` : "")

    const handleAddSection = (type: PRDSectionType) => {
        const sectionDef = SECTION_TYPES.find(s => s.type === type)
        if (!sectionDef) return

        setSections([
            ...sections,
            {
                id: crypto.randomUUID(),
                type,
                title: sectionDef.label,
                content: "",
                isPreview: false
            }
        ])
    }

    const handleRemoveSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id))
    }

    const handleUpdateSection = (id: string, content: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, content } : s))
    }

    const toggleSectionPreview = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isPreview: !s.isPreview } : s))
    }

    const generateSectionContent = async (sectionId: string, type: PRDSectionType) => {
        if (!ApiKeyManager.hasApiKey()) {
            setShowApiKeySetup(true)
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const apiKey = ApiKeyManager.getApiKey('gemini')
            if (!apiKey) throw new Error("No Gemini API key configured")

            const sectionDef = SECTION_TYPES.find(s => s.type === type)
            const prompt = `
        Context:
        ${context}

        Task:
        Generate a detailed "${sectionDef?.label}" section for a Product Requirement Document (PRD).
        
        Guidelines:
        - Be specific and actionable.
        - Use professional product management terminology.
        - Format with Markdown (bullet points, bold text, etc.).
        - Focus on the "${sectionDef?.description}".
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
                // Update content and switch to preview mode automatically
                setSections(prev => prev.map(s =>
                    s.id === sectionId ? { ...s, content: content, isPreview: true } : s
                ))
            }

        } catch (error) {
            console.error("Error generating section:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveToProject = async () => {
        if (!project?.id) {
            setError("No project selected. Please create a project first.")
            return
        }

        setIsSaving(true)
        setError(null)
        setSaveSuccess(false)

        try {
            // Build PRD object from sections
            const prdData: any = {
                fullDocument: sections.map(s => `# ${s.title}\n\n${s.content}\n`).join("\n---\n\n")
            }

            // Map sections to specific fields
            sections.forEach(section => {
                switch (section.type) {
                    case "problem_statement":
                        prdData.problemStatement = section.content
                        break
                    case "goals_nongoals":
                        prdData.goalsNonGoals = section.content
                        break
                    case "personas":
                        prdData.personas = section.content
                        break
                    case "user_flows":
                        prdData.userFlows = section.content
                        break
                    case "functional_requirements":
                        prdData.functionalRequirements = section.content
                        break
                    case "non_functional_requirements":
                        prdData.nonFunctionalRequirements = section.content
                        break
                    case "analytics":
                        prdData.analytics = section.content
                        break
                    case "risks":
                        prdData.risks = section.content
                        break
                }
            })

            await savePRDToProject(project.id, prdData)
            setSaveSuccess(true)

            // Clear success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error("Error saving PRD:", error)
            setError("Failed to save PRD to project")
        } finally {
            setIsSaving(false)
        }
    }

    const handleExport = () => {
        const content = sections.map(s => `# ${s.title}\n\n${s.content}\n`).join("\n---\n\n")
        const blob = new Blob([content], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${project?.name || "product"}-prd.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
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
                        <FileText className="w-8 h-8 text-accent" />
                        PRD Generator
                    </h2>
                    <p className="text-muted-foreground">
                        Build modular Product Requirement Documents with AI assistance.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    {project && (
                        <Button onClick={handleSaveToProject} disabled={sections.length === 0 || isSaving} variant={saveSuccess ? "default" : "outline"}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Project"}
                        </Button>
                    )}
                    <Button onClick={handleExport} disabled={sections.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Markdown
                    </Button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300">PRD successfully saved to project!</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Product Context</CardTitle>
                    <CardDescription>Provide context for the AI to generate relevant content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your product, target audience, and main goals..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-[250px_1fr] gap-6">
                <div className="space-y-4">
                    <div className="font-semibold mb-2">Add Section</div>
                    <div className="space-y-2">
                        {SECTION_TYPES.map((type) => (
                            <Button
                                key={type.type}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleAddSection(type.type)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {sections.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No Sections Added</h3>
                            <p className="text-muted-foreground">Select a section type from the left to start building your PRD.</p>
                        </div>
                    )}

                    {sections.map((section) => (
                        <Card key={section.id} className="relative group">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">{section.title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => generateSectionContent(section.id, section.type)}
                                            disabled={isGenerating}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2 text-accent" />
                                            {section.content ? "Regenerate" : "Generate"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSectionPreview(section.id)}
                                            title={section.isPreview ? "Edit" : "Preview"}
                                        >
                                            {section.isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveSection(section.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {section.isPreview ? (
                                    <div className="min-h-[200px] p-4 border rounded-md bg-muted/30">
                                        <MarkdownRenderer content={section.content || "*No content yet*"} />
                                    </div>
                                ) : (
                                    <Textarea
                                        value={section.content}
                                        onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                                        placeholder={`Content for ${section.title}...`}
                                        className="min-h-[200px] font-mono text-sm"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
