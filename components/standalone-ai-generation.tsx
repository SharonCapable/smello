"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Plus, 
  AlertCircle, 
  Target,
  FileText,
  Copy,
  Download
} from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { UsageBanner } from "@/components/usage-banner"
import { generateEpicsFromProduct, generateUserStoriesForEpic } from "@/lib/ai-generation"
import type { Epic, UserStory, Product } from "@/types/user-story"

const SECTORS = [
  "Technology", "Healthcare", "Finance", "Education", "E-commerce",
  "Entertainment", "Travel", "Food & Beverage", "Real Estate", 
  "Fitness", "Social Media", "Productivity", "Gaming", "Transportation", "Energy"
]

interface StandaloneAIGenerationProps {
  onBack?: () => void
}

export function StandaloneAIGeneration({ onBack }: StandaloneAIGenerationProps) {
  const [activeTab, setActiveTab] = useState("epics")
  const [provider, setProvider] = useState<'openai' | 'gemini'>('openai')
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    sector: "",
    target_audience: "",
    key_features: [],
    business_goals: [],
  })
  const [context, setContext] = useState("")
  const [userStoryFeatures, setUserStoryFeatures] = useState({
    includePersonas: true,
    includeBusinessValue: true,
    includeTestScenarios: true,
    includeDependencies: true,
  })
  const [generatedEpics, setGeneratedEpics] = useState<Epic[]>([])
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([])
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = () => {
    // Do not block client-side. Server will enforce quota and key selection.
    return true
  }

  const handleGenerateEpics = async () => {
    if (!product.name.trim() || !product.description.trim()) return
    if (!checkApiKey()) return

    setIsGenerating(true)
    setError(null)

    try {
      const epics = await generateEpicsFromProduct(product, {
        ...userStoryFeatures,
        provider
      })
      setGeneratedEpics(epics)
    } catch (error) {
      console.error("Error generating epics:", error)
      setError(error instanceof Error ? error.message : "Failed to generate epics")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateStories = async () => {
    if (!selectedEpic) return
    if (!checkApiKey()) return

    setIsGenerating(true)
    setError(null)

    try {
      const stories = await generateUserStoriesForEpic(selectedEpic, product, {
        ...userStoryFeatures,
        provider
      })
      setGeneratedStories(stories)
    } catch (error) {
      console.error("Error generating user stories:", error)
      setError(error instanceof Error ? error.message : "Failed to generate user stories")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Usage Banner */}
      <UsageBanner onUpgradeClick={() => setShowApiKeySetup(true)} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Standalone AI Generation</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="provider">AI Provider:</Label>
            <Select value={provider} onValueChange={(value: 'openai' | 'gemini') => setProvider(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-muted-foreground">
          Generate EPICs or User Stories independently without creating a full project
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="epics" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Generate EPICs
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate User Stories
          </TabsTrigger>
        </TabsList>

        {/* EPICs Generation Tab */}
        <TabsContent value="epics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Product Information
              </CardTitle>
              <CardDescription>
                Provide details about your product to generate relevant EPICs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., AI SaaS for Student Loans"
                    value={product.name}
                    onChange={(e) => setProduct((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Industry Sector</Label>
                  <Select
                    value={product.sector}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, sector: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
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

              <div className="space-y-2">
                <Label htmlFor="product-description">Product Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="e.g., A platform that uses AI to optimize student loan repayment strategies and provide personalized financial guidance."
                  rows={4}
                  value={product.description}
                  onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  placeholder="e.g., College students and recent graduates with student loans"
                  value={product.target_audience}
                  onChange={(e) => setProduct((prev) => ({ ...prev, target_audience: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Any specific requirements, constraints, or business goals..."
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerateEpics} 
                  disabled={!product.name.trim() || !product.description.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate EPICs
                </Button>
                {onBack && (
                  <Button variant="outline" onClick={onBack}>
                    Back
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated EPICs */}
          {generatedEpics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Generated EPICs ({generatedEpics.length})
                </CardTitle>
                <CardDescription>
                  Click on any EPIC to generate user stories for it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedEpics.map((epic, index) => (
                  <Card 
                    key={epic.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEpic?.id === epic.id ? 'ring-2 ring-accent' : ''
                    }`}
                    onClick={() => setSelectedEpic(epic)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">EPIC {index + 1}</Badge>
                          <h3 className="font-semibold">{epic.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(epic.title)
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadAsText(epic.title, `epic-${index + 1}.txt`)
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("stories")}
                    disabled={!selectedEpic}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate User Stories for Selected EPIC
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allEpics = generatedEpics.map(e => e.title).join('\n\n')
                      downloadAsText(allEpics, 'all-epics.txt')
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All EPICs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Stories Generation Tab */}
        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                User Stories Generation
              </CardTitle>
              <CardDescription>
                Generate user stories for a specific EPIC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedEpic ? (
                <>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Selected EPIC:</h3>
                    <p className="text-muted-foreground">{selectedEpic.title}</p>
                  </div>

                  <div className="space-y-4">
                    <Label>User Story Generation Features</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="personas"
                          checked={userStoryFeatures.includePersonas}
                          onCheckedChange={(checked) =>
                            setUserStoryFeatures((prev) => ({ ...prev, includePersonas: !!checked }))
                          }
                        />
                        <Label htmlFor="personas" className="text-sm">
                          Include user personas
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="business-value"
                          checked={userStoryFeatures.includeBusinessValue}
                          onCheckedChange={(checked) =>
                            setUserStoryFeatures((prev) => ({ ...prev, includeBusinessValue: !!checked }))
                          }
                        />
                        <Label htmlFor="business-value" className="text-sm">
                          Include business value
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="test-scenarios"
                          checked={userStoryFeatures.includeTestScenarios}
                          onCheckedChange={(checked) =>
                            setUserStoryFeatures((prev) => ({ ...prev, includeTestScenarios: !!checked }))
                          }
                        />
                        <Label htmlFor="test-scenarios" className="text-sm">
                          Include test scenarios
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dependencies"
                          checked={userStoryFeatures.includeDependencies}
                          onCheckedChange={(checked) =>
                            setUserStoryFeatures((prev) => ({ ...prev, includeDependencies: !!checked }))
                          }
                        />
                        <Label htmlFor="dependencies" className="text-sm">
                          Include dependencies
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button onClick={handleGenerateStories} disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate User Stories
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("epics")}>
                      Back to EPICs
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Please select an EPIC from the EPICs tab to generate user stories</p>
                  <Button variant="outline" onClick={() => setActiveTab("epics")} className="mt-4">
                    Go to EPICs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated User Stories */}
          {generatedStories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Generated User Stories ({generatedStories.length})
                </CardTitle>
                <CardDescription>
                  User stories for "{selectedEpic?.title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedStories.map((story, index) => (
                  <Card key={story.id} className="border-l-4 border-l-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{story.title}</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(story.description)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{story.description}</p>
                      
                      {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold mb-2 text-accent">Acceptance Criteria:</h5>
                          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                            {story.acceptance_criteria.map((criteria, idx) => (
                              <li key={idx}>{criteria}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allStories = generatedStories.map(s => 
                        `${s.title}\n${s.description}\n\n${s.acceptance_criteria?.join('\n') || ''}`
                      ).join('\n\n---\n\n')
                      downloadAsText(allStories, 'user-stories.txt')
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Stories
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
