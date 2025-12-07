"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Presentation, Sparkles, Download, Plus, Trash2, Copy, Check, Edit3, Eye } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { StoredProject } from "@/lib/storage"

interface PitchDeckGeneratorProps {
    project?: StoredProject | null
    onBack: () => void
}

type SlideType =
    | "title"
    | "problem"
    | "opportunity"
    | "solution"
    | "persona"
    | "roadmap"
    | "business_model"
    | "team"

interface Slide {
    id: string
    type: SlideType
    title: string
    content: string
    isPreview: boolean
}

const SLIDE_TYPES: { type: SlideType; label: string; description: string }[] = [
    { type: "title", label: "Title Slide", description: "Product name and tagline." },
    { type: "problem", label: "The Problem", description: "What pain point are we solving?" },
    { type: "opportunity", label: "Market Opportunity", description: "Why now? How big is the market?" },
    { type: "solution", label: "The Solution", description: "How does our product solve the problem?" },
    { type: "persona", label: "Target Persona", description: "Who is this for?" },
    { type: "roadmap", label: "Roadmap", description: "What is the plan?" },
    { type: "business_model", label: "Business Model", description: "How do we make money / impact?" },
    { type: "team", label: "The Team", description: "Who is building this?" },
]

export function PitchDeckGenerator({ project, onBack }: PitchDeckGeneratorProps) {
    const [slides, setSlides] = useState<Slide[]>([])
    const [context, setContext] = useState(project ? `Product: ${project.product.name}\nDescription: ${project.product.description}\nTarget Audience: ${project.product.target_audience}` : "")
    const [isGenerating, setIsGenerating] = useState(false)
    const [showApiKeySetup, setShowApiKeySetup] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    const handleAddSlide = (type: SlideType) => {
        const slideDef = SLIDE_TYPES.find(s => s.type === type)
        if (!slideDef) return

        setSlides([
            ...slides,
            {
                id: crypto.randomUUID(),
                type,
                title: slideDef.label,
                content: "",
                isPreview: false
            }
        ])
    }

    const handleRemoveSlide = (id: string) => {
        setSlides(slides.filter(s => s.id !== id))
    }

    const handleUpdateSlide = (id: string, content: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, content } : s))
    }

    const toggleSlidePreview = (id: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, isPreview: !s.isPreview } : s))
    }

    const generateSlideContent = async (slideId: string, type: SlideType) => {
        if (!ApiKeyManager.hasApiKey()) {
            setShowApiKeySetup(true)
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const apiKey = ApiKeyManager.getApiKey('gemini')
            if (!apiKey) throw new Error("No Gemini API key configured")

            const slideDef = SLIDE_TYPES.find(s => s.type === type)
            const prompt = `
        Context:
        ${context}

        Task:
        Generate content for a "${slideDef?.label}" slide for a pitch deck.
        
        Guidelines:
        - Be concise and persuasive.
        - Use bullet points where appropriate.
        - Focus on the "${slideDef?.description}".
        - Format with Markdown.
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
                setSlides(prev => prev.map(s =>
                    s.id === slideId ? { ...s, content: content, isPreview: true } : s
                ))
            }

        } catch (error) {
            console.error("Error generating slide:", error)
            setError(error instanceof Error ? error.message : "Failed to generate content")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleExport = () => {
        const content = slides.map(s => `# ${s.title}\n\n${s.content}\n`).join("\n---\n\n")
        const blob = new Blob([content], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${project?.product.name || "pitch"}-deck.md`
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
                        <Presentation className="w-8 h-8 text-accent" />
                        Pitch Deck Generator
                    </h2>
                    <p className="text-muted-foreground">
                        Create compelling product pitch decks with AI.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={handleExport} disabled={slides.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Markdown
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pitch Context</CardTitle>
                    <CardDescription>Provide context for the AI to generate relevant slides.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe your product, value proposition, and market..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-[250px_1fr] gap-6">
                <div className="space-y-4">
                    <div className="font-semibold mb-2">Add Slide</div>
                    <div className="space-y-2">
                        {SLIDE_TYPES.map((type) => (
                            <Button
                                key={type.type}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleAddSlide(type.type)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {type.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {slides.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Presentation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No Slides Added</h3>
                            <p className="text-muted-foreground">Select a slide type from the left to start building your deck.</p>
                        </div>
                    )}

                    {slides.map((slide, index) => (
                        <Card key={slide.id} className="relative group">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">Slide {index + 1}: {slide.title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => generateSlideContent(slide.id, slide.type)}
                                            disabled={isGenerating}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2 text-accent" />
                                            {slide.content ? "Regenerate" : "Generate"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSlidePreview(slide.id)}
                                            title={slide.isPreview ? "Edit" : "Preview"}
                                        >
                                            {slide.isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(slide.content, slide.id)}
                                            disabled={!slide.content}
                                        >
                                            {copied === slide.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleRemoveSlide(slide.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {slide.isPreview ? (
                                    <div className="min-h-[150px] p-4 border rounded-md bg-muted/30">
                                        <MarkdownRenderer content={slide.content || "*No content yet*"} />
                                    </div>
                                ) : (
                                    <Textarea
                                        value={slide.content}
                                        onChange={(e) => handleUpdateSlide(slide.id, e.target.value)}
                                        placeholder={`Content for ${slide.title}...`}
                                        className="min-h-[150px] font-mono text-sm"
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
