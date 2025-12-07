"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, FileText, ArrowRight, Brain, Edit3 } from "lucide-react"
import type { InputMode } from "@/types/user-story"

interface ModeSelectorProps {
  onModeSelect: (mode: InputMode) => void
}

export function ModeSelector({ onModeSelect }: ModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<InputMode | null>(null)
  const [selectedMode, setSelectedMode] = useState<InputMode | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Choose your workflow</h2>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Select how you want to create your user stories. Both modes produce the same structured, professional output.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* AI Generation Mode */}
        <Card
          className={`bg-card border-border cursor-pointer transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 ${
            hoveredMode === "ai" ? "border-accent/50 shadow-lg shadow-accent/10" : ""
          } ${
            selectedMode === "ai" ? "border-accent bg-accent/5 shadow-lg shadow-accent/20" : ""
          }`}
          onMouseEnter={() => setHoveredMode("ai")}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => {
            setSelectedMode("ai")
            onModeSelect("ai")
          }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            </div>
            <CardTitle className="text-xl flex items-center gap-2">
              AI Generation Mode
              {mounted && selectedMode === "ai" ? (
                <div className="w-2 h-2 bg-accent rounded-full" />
              ) : (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription className="text-base">
              Describe your product and let AI generate comprehensive epics and user stories with all required fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Consistent Output</p>
                  <p className="text-xs text-muted-foreground">Same input always generates identical results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Complete Structure</p>
                  <p className="text-xs text-muted-foreground">Includes acceptance criteria, edge cases, validations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Professional Quality</p>
                  <p className="text-xs text-muted-foreground">Ready for product management tools</p>
                </div>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg">
              <Brain className="w-4 h-4 mr-2" />
              Start with AI
            </Button>
          </CardContent>
        </Card>

        {/* Manual Input Mode */}
        <Card
          className={`bg-card border-border cursor-pointer transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 ${
            hoveredMode === "manual" ? "border-accent/50 shadow-lg shadow-accent/10" : ""
          } ${
            selectedMode === "manual" ? "border-accent bg-accent/5 shadow-lg shadow-accent/20" : ""
          }`}
          onMouseEnter={() => setHoveredMode("manual")}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => {
            setSelectedMode("manual")
            onModeSelect("manual")
          }}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
              <Badge variant="outline" className="text-xs">
                Full Control
              </Badge>
            </div>
            <CardTitle className="text-xl flex items-center gap-2">
              Manual Input Mode
              {mounted && selectedMode === "manual" ? (
                <div className="w-2 h-2 bg-accent rounded-full" />
              ) : (
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription className="text-base">
              Create and organize your epics and user stories manually with complete control over every detail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Complete Control</p>
                  <p className="text-xs text-muted-foreground">Define every aspect of your user stories</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Custom Fields</p>
                  <p className="text-xs text-muted-foreground">Add priority, estimates, dependencies, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Structured Format</p>
                  <p className="text-xs text-muted-foreground">Same professional output as AI mode</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 bg-transparent" size="lg">
              <Edit3 className="w-4 h-4 mr-2" />
              Start Manual Input
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Preview */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-8">How it works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm font-semibold text-accent">1</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">Choose Mode</h4>
            <p className="text-sm text-muted-foreground text-center">Select AI generation or manual input</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm font-semibold text-accent">2</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">Create Epics</h4>
            <p className="text-sm text-muted-foreground text-center">Generate or input your product epics</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm font-semibold text-accent">3</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">Build Stories</h4>
            <p className="text-sm text-muted-foreground text-center">Create detailed user stories with criteria</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm font-semibold text-accent">4</span>
            </div>
            <h4 className="font-medium text-foreground mb-2">Export & Use</h4>
            <p className="text-sm text-muted-foreground text-center">Export to your favorite PM tools</p>
          </div>
        </div>
      </div>
    </div>
  )
}
