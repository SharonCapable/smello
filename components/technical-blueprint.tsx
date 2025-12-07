"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Database, Server, Code, Sparkles, Download, Copy, Check } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { type StoredProject, updateProject } from "@/lib/storage"

interface TechnicalBlueprintProps {
    project?: StoredProject | null
    onBack: () => void
}

type BlueprintType = "architecture" | "database" | "api"

export function TechnicalBlueprint({ project, onBack }: TechnicalBlueprintProps) {
    const [activeTab, setActiveTab] = useState<BlueprintType>("architecture")
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nKey Features: ${project.product.key_features?.join(", ")}` : "")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    const [blueprints, setBlueprints] = useState<{
        architecture: string
        database: string
        api: string
    }>({
        architecture: "",
        database: "",
        api: ""
    })

    const handleGenerate = async (type: BlueprintType) => {
        if (!ApiKeyManager.hasApiKey()) {
            setShowApiKeySetup(true)
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const apiKey = ApiKeyManager.getApiKey('anthropic') || ApiKeyManager.getApiKey('gemini')
            const provider = ApiKeyManager.getApiKey('anthropic') ? 'anthropic' : 'gemini'

            if (!apiKey) throw new Error("No API key configured. Please add your API key in Settings.")

            let prompt = ""
            if (type === "architecture") {
                prompt = `
          Context:
          ${context}

          Task:
          Generate a high-level system architecture description and a Mermaid.js diagram code block.
          Include:
          - Frontend <-> Backend flow
          - API endpoints overview
          - Data pipelines
          - 3rd party integrations
          - Authentication flow

          Output Format:
          Provide a textual description followed by a Mermaid diagram in a code block like:
          \`\`\`mermaid
          graph TD
            A[Client] --> B[Load Balancer]
            ...
          \`\`\`
        `
            } else if (type === "database") {
                prompt = `
          Context:
          ${context}

          Task:
          Generate a database schema design.
          Include:
          - Suggested entities and tables
          - Relationships (ERD description)
          - Constraints
          - Storage recommendations

          Output Format:
          Provide a textual description followed by a Mermaid ER diagram in a code block like:
          \`\`\`mermaid
          erDiagram
            USER ||--o{ ORDER : places
            ...
          \`\`\`
        `
            } else if (type === "api") {
                prompt = `
          Context:
          ${context}

          Task:
          Generate an API blueprint draft.
          Include:
          - Endpoint list (RESTful)
          - Request/Response models (JSON examples)
          - Error codes

          Output Format:
          Markdown format with code blocks for JSON examples.
        `
            }

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    prompt,
                    model: provider === 'anthropic' ? "claude-3-haiku-20240307" : undefined
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to generate content")
            }

            const data = await response.json()
            const content = data.text

            if (content) {
                setBlueprints(prev => {
                    const newBlueprints = { ...prev, [type]: content }
                    if (project) {
                        updateProject(project.id, { blueprints: newBlueprints })
                    }
                    return newBlueprints
                })
            }

        } catch (error) {
            console.error("Error generating blueprint:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
        setCopied(type)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleExport = (type: BlueprintType) => {
        const content = blueprints[type]
        if (!content) return

        const blob = new Blob([content], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${project?.name || "project"}-${type}-blueprint.md`
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
                        <Server className="w-8 h-8 text-accent" />
                        Technical Blueprint
                    </h2>
                    <p className="text-muted-foreground">
                        Generate architecture diagrams, database schemas, and API specifications.
                    </p>
                </div>
                <Button variant="outline" onClick={onBack}>Back</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Technical Context</CardTitle>
                    <CardDescription>Review the context used to generate technical artifacts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your product technical requirements..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BlueprintType)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="architecture" className="flex gap-2">
                        <Server className="w-4 h-4" /> Architecture
                    </TabsTrigger>
                    <TabsTrigger value="database" className="flex gap-2">
                        <Database className="w-4 h-4" /> Database
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex gap-2">
                        <Code className="w-4 h-4" /> API Blueprint
                    </TabsTrigger>
                </TabsList>

                {(["architecture", "database", "api"] as const).map((type) => (
                    <TabsContent key={type} value={type} className="space-y-4 mt-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold capitalize">{type} Design</h3>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleGenerate(type)}
                                    disabled={isGenerating}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {blueprints[type] ? "Regenerate" : "Generate"}
                                </Button>
                                {blueprints[type] && (
                                    <>
                                        <Button variant="outline" onClick={() => copyToClipboard(blueprints[type], type)}>
                                            {copied === type ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button variant="outline" onClick={() => handleExport(type)}>
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {blueprints[type] ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <MarkdownRenderer content={blueprints[type]} className="bg-muted p-4 rounded-lg" />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                {type === "architecture" && <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
                                {type === "database" && <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
                                {type === "api" && <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />}
                                <h3 className="text-lg font-medium">No {type} generated yet</h3>
                                <p className="text-muted-foreground">Click generate to create a {type} blueprint.</p>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
