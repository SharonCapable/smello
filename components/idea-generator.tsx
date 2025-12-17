"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, Sparkles, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import type { InputMode } from "@/types/user-story"
import { Textarea } from "@/components/ui/textarea"

interface IdeaGeneratorProps {
  onCreateProject: (idea: GeneratedIdea, mode: InputMode) => void
  onBack: () => void
}

interface GeneratedIdea {
  title: string
  description: string
  sector: string
  keywords: string[]
  targetAudience: string
  keyFeatures: string[]
}

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Entertainment",
  "Travel",
  "Food & Beverage",
  "Real Estate",
  "Fitness",
  "Social Media",
  "Productivity",
  "Gaming",
  "Transportation",
  "Energy",
]

export function IdeaGenerator({ onCreateProject, onBack }: IdeaGeneratorProps) {
  const [keyword, setKeyword] = useState("")
  const [selectedSector, setSelectedSector] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [editableIdeas, setEditableIdeas] = useState<GeneratedIdea[]>([]);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<'Gemini' | 'Claude'>('Gemini');

  const handleGenerate = async () => {
    // Delegate quota enforcement to the server; do not block client-side.
    setIsGenerating(true)
    setError(null)

    try {
      let ideas: GeneratedIdea[] = [];
      if (selectedModel === 'Gemini') {
        ideas = await generateIdeasWithGemini(keyword, selectedSector)
      } else if (selectedModel === 'Claude') {
        ideas = await generateIdeasWithClaude(keyword, selectedSector)
      }
      setGeneratedIdeas(ideas);
      setEditableIdeas(ideas.map(i => ({ ...i })));
    } catch (error) {
      console.error("Error generating ideas:", error)
      setError(error instanceof Error ? error.message : "Failed to generate ideas")
    } finally {
      setIsGenerating(false)
    }
  }



  // Placeholder async functions for new providers
  const generateIdeasWithGemini = async (keyword: string, sector: string): Promise<GeneratedIdea[]> => {

    const prompt = `Generate 3 innovative product ideas based on the keyword "${keyword}" ${sector ? `in the ${sector} sector` : ""}. 

For each idea, provide:
- A compelling product title
- A detailed description (2-3 sentences)
- Target audience
- 4 key features
- 4 relevant keywords

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Product Title",
    "description": "Detailed product description explaining the value proposition and main functionality.",
    "sector": "${sector || "Technology"}",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "targetAudience": "Specific target audience description",
    "keyFeatures": ["feature1", "feature2", "feature3", "feature4"]
  }
]`

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'gemini', prompt, model: 'gemini-2.0-flash-exp' }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate ideas. Please check your API key.")
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error("No content received from AI")
    }

    const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
    return JSON.parse(cleanedText) as GeneratedIdea[]
  }

  const generateIdeasWithClaude = async (keyword: string, sector: string): Promise<GeneratedIdea[]> => {
    const apiKey = ApiKeyManager.getApiKey('anthropic') || null

    const prompt = `Generate 3 innovative product ideas based on the keyword "${keyword}" ${sector ? `in the ${sector} sector` : ""}. 

For each idea, provide:
- A compelling product title
- A detailed description (2-3 sentences)
- Target audience
- 4 key features
- 4 relevant keywords

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Product Title",
    "description": "Detailed product description explaining the value proposition and main functionality.",
    "sector": "${sector || "Technology"}",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "targetAudience": "Specific target audience description",
    "keyFeatures": ["feature1", "feature2", "feature3", "feature4"]
  }
]`

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "anthropic",
        apiKey,
        prompt,
        model: "claude-3-haiku-20240307"
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Claude API Error: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    const content = data.text

    if (!content) {
      throw new Error("No content received from AI")
    }

    const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
    return JSON.parse(cleanedText) as GeneratedIdea[]
  }

  const handleCreateProject = (idea: GeneratedIdea, mode: InputMode) => {
    onCreateProject(idea, mode)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* API Key Setup Dialog */}
      <ApiKeySetup
        isOpen={showApiKeySetup}
        onApiKeySet={() => setShowApiKeySetup(false)}
        onClose={() => setShowApiKeySetup(false)}
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-accent" />
          Idea Generator
        </h2>
        <p className="text-muted-foreground text-lg">
          Generate product ideas based on keywords and industry sectors. Perfect for brainstorming new projects.
        </p>
      </div>

      {/* Model selection UI, goes above input section */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Label htmlFor="model-select" className="font-semibold">AI Provider:</Label>
        <div className="flex gap-1">
          {['Gemini', 'Claude'].map(m => (
            <Button
              key={m}
              type="button"
              variant={selectedModel === m ? 'default' : 'outline'}
              onClick={() => setSelectedModel(m as any)}
              className={`px-4 py-2 ${selectedModel === m ? '' : 'bg-transparent'}`}
            >
              {m}
            </Button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-2">Currently using <strong>{selectedModel}</strong> for idea generation</span>
      </div>

      {/* Input Section */}
      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <CardTitle>Generate New Ideas</CardTitle>
          <CardDescription>Enter a keyword and select a sector to generate tailored product ideas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Status Indicator */}
          {(() => {
            const getApiKeyMessage = () => {
              switch (selectedModel) {
                case 'Gemini':
                  return {
                    title: "Gemini API Key Required",
                    message: "You'll need to set your Gemini API key to generate ideas.",
                    color: "blue"
                  };
                case 'Claude':
                  return {
                    title: "Claude API Key Required",
                    message: "You'll need to set your Claude API key to generate ideas.",
                    color: "orange"
                  };
                default:
                  return {
                    title: "API Key Required",
                    message: "You'll need to set the appropriate API key.",
                    color: "gray"
                  };
              }
            };

            const keyInfo = getApiKeyMessage();
            const hasApiKeyForSelectedModel = ApiKeyManager.hasApiKey(selectedModel === 'Gemini' ? 'gemini' : 'anthropic');

            return !hasApiKeyForSelectedModel ? (
              <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-12 h-12 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">API Key Not Configured</h3>
                  <p className="mt-1">Please set your {selectedModel} API key in Settings to generate ideas.</p>
                </div>
              </div>
            ) : null;
          })()}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., productivity, health, education"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sector">Sector (Optional)</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={!keyword.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ideas Display */}
      <div className="space-y-6">
        {generatedIdeas.length === 0 && !isGenerating && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Ideas Generated Yet</h3>
            <p className="text-muted-foreground">Enter a keyword above and click "Generate Ideas" to get started.</p>
          </div>
        )}

        {generatedIdeas.map((idea, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Idea {index + 1}: {idea.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {idea.sector}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{idea.targetAudience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">Product Title</Label>
                <Input
                  value={editableIdeas[index].title}
                  onChange={e => {
                    const newIdeas = [...editableIdeas];
                    newIdeas[index].title = e.target.value;
                    setEditableIdeas(newIdeas);
                  }}
                  placeholder="AI-generated product name"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">Description</Label>
                <Textarea
                  rows={2}
                  value={editableIdeas[index].description}
                  onChange={e => {
                    const newIdeas = [...editableIdeas];
                    newIdeas[index].description = e.target.value;
                    setEditableIdeas(newIdeas);
                  }}
                  placeholder="Describe your idea in 2-3 sentences."
                />
              </div>
              <div className="space-y-2 grid md:grid-cols-2 gap-2">
                <div>
                  <Label className="font-semibold text-xs">Sector</Label>
                  <Input
                    value={editableIdeas[index].sector}
                    onChange={e => {
                      const newIdeas = [...editableIdeas];
                      newIdeas[index].sector = e.target.value;
                      setEditableIdeas(newIdeas);
                    }}
                  />
                </div>
                <div>
                  <Label className="font-semibold text-xs">Target Audience</Label>
                  <Input
                    value={editableIdeas[index].targetAudience}
                    onChange={e => {
                      const newIdeas = [...editableIdeas];
                      newIdeas[index].targetAudience = e.target.value;
                      setEditableIdeas(newIdeas);
                    }}
                  />
                </div>
              </div>
              {/* Key Features as editable chips/input */}
              <div>
                <h4 className="font-semibold text-sm mb-1">Key Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {editableIdeas[index].keyFeatures.map((feature, idx) => (
                    <Input
                      key={idx}
                      className="w-full"
                      value={feature}
                      onChange={e => {
                        const newIdeas = [...editableIdeas];
                        newIdeas[index].keyFeatures[idx] = e.target.value;
                        setEditableIdeas(newIdeas);
                      }}
                      placeholder={`Feature ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              {/* Editable Keywords */}
              <div>
                <h4 className="font-semibold text-sm mb-1">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {editableIdeas[index].keywords.map((kw, idx) => (
                    <Input
                      key={idx}
                      className="w-32 mb-1"
                      value={kw}
                      onChange={e => {
                        const newIdeas = [...editableIdeas];
                        newIdeas[index].keywords[idx] = e.target.value;
                        setEditableIdeas(newIdeas);
                      }}
                      placeholder={`Keyword ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Button onClick={() => handleCreateProject(editableIdeas[index], "ai")} className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
