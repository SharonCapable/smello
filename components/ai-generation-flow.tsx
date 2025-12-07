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
import { Sparkles, Loader2, CheckCircle, Plus, ArrowRight, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { ApiKeySetup } from "@/components/api-key-setup"
import { UsageBanner } from "@/components/usage-banner"
import { generateEpicsFromProduct, generateUserStoriesForEpic } from "@/lib/ai-generation"
import type { Epic, Product, ProjectData } from "@/types/user-story"

interface AIGenerationFlowProps {
  onComplete: (data: ProjectData) => void
  onBack: () => void
  initialProduct?: Product
}

type GenerationStep = "input" | "generating-epics" | "epic-selection" | "generating-stories" | "complete"

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

export function AIGenerationFlow({ onComplete, onBack, initialProduct }: AIGenerationFlowProps) {
  const [currentStep, setCurrentStep] = useState<GenerationStep>(initialProduct ? "generating-epics" : "input")
  const [product, setProduct] = useState<Product>(initialProduct || {
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
  const [selectedEpics, setSelectedEpics] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkApiKey = () => {
    if (!ApiKeyManager.hasApiKey()) {
      setShowApiKeySetup(true)
      return false
    }
    return true
  }

  const handleProductSubmit = async () => {
    if (!product.name.trim() || !product.description.trim()) return
    if (!checkApiKey()) return

    setCurrentStep("generating-epics")
    setIsGenerating(true)
    setError(null)

    try {
      const epics = await generateEpicsFromProduct(product, userStoryFeatures)
      setGeneratedEpics(epics)
      setSelectedEpics(epics.map((epic) => epic.id))
      setCurrentStep("epic-selection")
    } catch (error) {
      console.error("Error generating epics:", error)
      setError(error instanceof Error ? error.message : "Failed to generate epics")
      setCurrentStep("input")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEpicSelection = async () => {
    if (selectedEpics.length === 0) return
    if (!checkApiKey()) return

    setCurrentStep("generating-stories")
    setIsGenerating(true)
    setError(null)

    try {
      const epicsWithStories = await Promise.all(
        generatedEpics
          .filter((epic) => selectedEpics.includes(epic.id))
          .map(async (epic) => {
            const userStories = await generateUserStoriesForEpic(epic, product, userStoryFeatures)
            return {
              ...epic,
              user_stories: userStories,
            }
          }),
      )

      const projectData: ProjectData = {
        product,
        epics: epicsWithStories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCurrentStep("complete")
      onComplete(projectData)
    } catch (error) {
      console.error("Error generating user stories:", error)
      setError(error instanceof Error ? error.message : "Failed to generate user stories")
      setCurrentStep("epic-selection")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEpicToggle = (epicId: string) => {
    setSelectedEpics((prev) => (prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]))
  }

  const generateMoreEpics = async () => {
    if (!checkApiKey()) return

    setIsGenerating(true)
    setError(null)

    try {
      const additionalEpics = await generateEpicsFromProduct(product, userStoryFeatures)
      // Filter out duplicates based on title similarity
      const newEpics = additionalEpics.filter(
        (newEpic) => !generatedEpics.some((existing) => existing.title === newEpic.title),
      )
      setGeneratedEpics((prev) => [...prev, ...newEpics])
    } catch (error) {
      console.error("Error generating additional epics:", error)
      setError(error instanceof Error ? error.message : "Failed to generate additional epics")
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-start generation if initialProduct is provided
  if (initialProduct && currentStep === "generating-epics" && !isGenerating && generatedEpics.length === 0 && !error) {
    handleProductSubmit()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* API Key Setup Dialog */}
      <ApiKeySetup
        isOpen={showApiKeySetup}
        onApiKeySet={() => setShowApiKeySetup(false)}
        onClose={() => setShowApiKeySetup(false)}
      />

      {/* Usage Banner */}
      <UsageBanner onUpgradeClick={() => setShowApiKeySetup(true)} />

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">AI Generation Workflow</h2>
          <Badge variant="secondary">
            Step {currentStep === "input" ? 1 : currentStep === "epic-selection" ? 2 : 3}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-2 rounded-full ${currentStep !== "input" ? "bg-accent" : "bg-accent/30"}`} />
          <div
            className={`w-8 h-2 rounded-full ${["epic-selection", "generating-stories", "complete"].includes(currentStep) ? "bg-accent" : "bg-accent/30"
              }`}
          />
          <div className={`w-8 h-2 rounded-full ${currentStep === "complete" ? "bg-accent" : "bg-accent/30"}`} />
        </div>
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

      {/* Step 1: Product Input */}
      {currentStep === "input" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Describe Your Product
            </CardTitle>
            <CardDescription>
              Provide details about your product. The AI will use this information to generate relevant epics and user
              stories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ApiKeyManager.isUsingDefaultKey('gemini') && (
              <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3">
                <div className="flex">
                  <Sparkles className="h-4 w-4 text-green-400 mt-0.5" />
                  <div className="ml-2 text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium">Free Trial Active</p>
                    <p className="mt-1">Using SMELLO's free trial with limited generations.</p>
                  </div>
                </div>
              </div>
            )}

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
              <Button onClick={handleProductSubmit} disabled={!product.name.trim() || !product.description.trim()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Epics
              </Button>
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generating Epics */}
      {currentStep === "generating-epics" && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Generating Epics</h3>
            <p className="text-muted-foreground">Analyzing your product description and creating relevant epics...</p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Epic Selection */}
      {currentStep === "epic-selection" && (
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Select Epics to Develop
              </CardTitle>
              <CardDescription>
                Choose which epics you want to develop into detailed user stories. You can always add more later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedEpics.map((epic) => (
                <div
                  key={epic.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <Checkbox
                    id={epic.id}
                    checked={selectedEpics.includes(epic.id)}
                    onCheckedChange={() => handleEpicToggle(epic.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={epic.id} className="text-sm font-medium cursor-pointer">
                      {epic.title}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Epic ID: {epic.id}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={generateMoreEpics}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Generate More Epics
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleEpicSelection} disabled={selectedEpics.length === 0}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Generate User Stories ({selectedEpics.length} epics)
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep("input")}>
              Back to Input
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Generating Stories */}
      {currentStep === "generating-stories" && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Generating User Stories</h3>
            <p className="text-muted-foreground">
              Creating detailed user stories with acceptance criteria, edge cases, and validations...
            </p>
            <div className="mt-6 text-sm text-muted-foreground">
              This may take a moment as we generate comprehensive stories for {selectedEpics.length} epics
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
