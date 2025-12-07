"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Edit3,
  Plus,
  Trash2,
  Save,
  FolderPlus,
  FileText,
  AlertCircle,
  CheckSquare,
  Shield,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react"
import type { Epic, Product, ProjectData, UserStory } from "@/types/user-story"

interface ManualInputFlowProps {
  onComplete: (data: ProjectData) => void
  onBack: () => void
}

export function ManualInputFlow({ onComplete, onBack }: ManualInputFlowProps) {
  const [product, setProduct] = useState<Product>({ name: "", description: "" })
  const [epics, setEpics] = useState<Epic[]>([])
  const [activeEpic, setActiveEpic] = useState<string | null>(null)
  const [isGeneratingEpics, setIsGeneratingEpics] = useState(false)
  const [isGeneratingStories, setIsGeneratingStories] = useState<string | null>(null)

  const addEpic = () => {
    const newEpic: Epic = {
      id: `E${epics.length + 1}`,
      title: "",
      user_stories: [],
    }
    setEpics([...epics, newEpic])
    setActiveEpic(newEpic.id)
  }

  const updateEpic = (epicId: string, updates: Partial<Epic>) => {
    setEpics(epics.map((epic) => (epic.id === epicId ? { ...epic, ...updates } : epic)))
  }

  const deleteEpic = (epicId: string) => {
    setEpics(epics.filter((epic) => epic.id !== epicId))
    if (activeEpic === epicId) {
      setActiveEpic(null)
    }
  }

  const addUserStory = (epicId: string) => {
    const epic = epics.find((e) => e.id === epicId)
    if (!epic) return

    const newStory: UserStory = {
      id: `${epicId}-US${epic.user_stories.length + 1}`,
      description: "",
      acceptance_criteria: [""],
      edge_cases: [""],
      validations: [""],
      optional_fields: {
        priority: "Medium",
        effort_estimate: "",
        dependencies: [],
        risk_notes: "",
        custom_fields: {},
      },
    }

    updateEpic(epicId, {
      user_stories: [...epic.user_stories, newStory],
    })
  }

  const updateUserStory = (epicId: string, storyId: string, updates: Partial<UserStory>) => {
    const epic = epics.find((e) => e.id === epicId)
    if (!epic) return

    const updatedStories = epic.user_stories.map((story) => (story.id === storyId ? { ...story, ...updates } : story))

    updateEpic(epicId, { user_stories: updatedStories })
  }

  const deleteUserStory = (epicId: string, storyId: string) => {
    const epic = epics.find((e) => e.id === epicId)
    if (!epic) return

    updateEpic(epicId, {
      user_stories: epic.user_stories.filter((story) => story.id !== storyId),
    })
  }

  const addArrayItem = (
    epicId: string,
    storyId: string,
    field: "acceptance_criteria" | "edge_cases" | "validations",
  ) => {
    const epic = epics.find((e) => e.id === epicId)
    const story = epic?.user_stories.find((s) => s.id === storyId)
    if (!story) return

    updateUserStory(epicId, storyId, {
      [field]: [...story[field], ""],
    })
  }

  const updateArrayItem = (
    epicId: string,
    storyId: string,
    field: "acceptance_criteria" | "edge_cases" | "validations",
    index: number,
    value: string,
  ) => {
    const epic = epics.find((e) => e.id === epicId)
    const story = epic?.user_stories.find((s) => s.id === storyId)
    if (!story) return

    const newArray = [...story[field]]
    newArray[index] = value

    updateUserStory(epicId, storyId, {
      [field]: newArray,
    })
  }

  const removeArrayItem = (
    epicId: string,
    storyId: string,
    field: "acceptance_criteria" | "edge_cases" | "validations",
    index: number,
  ) => {
    const epic = epics.find((e) => e.id === epicId)
    const story = epic?.user_stories.find((s) => s.id === storyId)
    if (!story) return

    updateUserStory(epicId, storyId, {
      [field]: story[field].filter((_, i) => i !== index),
    })
  }

  const generateEpicsWithAI = async () => {
    if (!product.name || !product.description) return
    
    setIsGeneratingEpics(true)
    try {
      // Mock AI generation - replace with actual AI call
      const mockEpics = [
        "User Authentication & Security",
        "Core Product Features",
        "User Dashboard & Analytics",
        "Integration & API",
        "Support & Documentation"
      ]
      
      const newEpics: Epic[] = mockEpics.map((title, index) => ({
        id: `E${epics.length + index + 1}`,
        title,
        user_stories: []
      }))
      
      setEpics([...epics, ...newEpics])
      if (newEpics.length > 0) {
        setActiveEpic(newEpics[0].id)
      }
    } catch (error) {
      console.error('Failed to generate epics:', error)
    } finally {
      setIsGeneratingEpics(false)
    }
  }

  const generateStoriesWithAI = async (epicId: string) => {
    const epic = epics.find(e => e.id === epicId)
    if (!epic || !epic.title) return
    
    setIsGeneratingStories(epicId)
    try {
      // Mock AI generation - replace with actual AI call
      const mockStories = [
        {
          id: `${epicId}-S1`,
          title: `As a user, I want to access ${epic.title.toLowerCase()}`,
          description: `Enable users to interact with ${epic.title} functionality`,
          acceptance_criteria: ["User can access the feature", "Feature loads correctly"],
          edge_cases: [],
          validations: [],
          priority: "medium" as const,
          story_points: 3,
          optional_fields: {
            risk_notes: "",
            dependencies: [],
            definition_of_done: ["Feature is accessible", "Tests pass"]
          }
        },
        {
          id: `${epicId}-S2`,
          title: `As an admin, I want to manage ${epic.title.toLowerCase()}`,
          description: `Administrative controls for ${epic.title}`,
          acceptance_criteria: ["Admin can manage the feature", "Permissions work correctly"],
          edge_cases: [],
          validations: [],
          priority: "high" as const,
          story_points: 5,
          optional_fields: {
            risk_notes: "",
            dependencies: [],
            definition_of_done: ["Admin controls work", "Security measures in place"]
          }
        }
      ]
      
      const updatedEpics = epics.map(e => 
        e.id === epicId 
          ? { ...e, user_stories: [...e.user_stories, ...mockStories] }
          : e
      )
      
      setEpics(updatedEpics)
    } catch (error) {
      console.error('Failed to generate stories:', error)
    } finally {
      setIsGeneratingStories(null)
    }
  }

  const handleSave = () => {
    if (!product.name.trim() || !product.description.trim() || epics.length === 0) return

    const projectData: ProjectData = {
      product,
      epics,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onComplete(projectData)
  }

  const canSave = product.name.trim() && product.description.trim() && epics.length > 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Manual Input Workflow</h2>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{epics.length} Epics</Badge>
            <Badge variant="outline">{epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)} Stories</Badge>
          </div>
        </div>
        <p className="text-muted-foreground">Create and organize your epics and user stories with complete control.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel: Product & Epic Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Information */}
          <Card className="bg-card border-border shadow-xl notched-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-2">
                <Edit3 className="w-5 h-5 text-accent" /> Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-product-name" title="What is the product name?" className="font-semibold">Product Name</Label>
                <Input
                  id="manual-product-name"
                  placeholder="Enter a succinct, searchable product name (e.g. Acme AI Assistant)"
                  value={product.name}
                  onChange={e => setProduct(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-product-description" title="Summarize product's primary function/purpose." className="font-semibold">Description</Label>
                <Textarea
                  id="manual-product-description"
                  placeholder="Describe the target user, main value, unique selling points, and key goals."
                  rows={3}
                  value={product.description}
                  onChange={e => setProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Epic Management */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-accent" />
                Epics
              </CardTitle>
              <CardDescription>Organize your features into epics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {epics.map((epic) => (
                <div
                  key={epic.id}
                  className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer group notched-card \
                ${activeEpic === epic.id ? 'border-accent bg-accent/10 shadow-md' : 'border-border hover:border-accent/60 hover:bg-accent/5'} \
                flex flex-col gap-1`}
                  onClick={() => setActiveEpic(epic.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="block font-mono text-muted-foreground text-[11px] mr-1">{epic.id}</span>
                    <input
                      className="bg-transparent w-full font-medium text-sm focus:outline-none focus:ring-2 focus:ring-accent/60 focus:bg-accent/5 rounded px-1 select-all transition shadow-none border-none"
                      value={epic.title}
                      onClick={e => e.stopPropagation()}
                      placeholder="Unnamed Epic"
                      onChange={e => updateEpic(epic.id, { title: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => { e.stopPropagation(); deleteEpic(epic.id); }}
                      className="h-8 w-8 p-0 text-destructive group-hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-6">
                    {epic.user_stories.length} stories
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={addEpic} className="flex-1 bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Epic
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateEpicsWithAI} 
                  disabled={!product.name || !product.description || isGeneratingEpics}
                  className="flex-1 bg-transparent"
                >
                  {isGeneratingEpics ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Epics
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleSave} disabled={!canSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
              Back
            </Button>
          </div>
        </div>

        {/* Right Panel: Epic & Story Details */}
        <div className="lg:col-span-2">
          {activeEpic ? (
            <EpicEditor
              epic={epics.find((e) => e.id === activeEpic)!}
              onUpdateEpic={(updates) => updateEpic(activeEpic, updates)}
              onAddUserStory={() => addUserStory(activeEpic)}
              onUpdateUserStory={(storyId, updates) => updateUserStory(activeEpic, storyId, updates)}
              onDeleteUserStory={(storyId) => deleteUserStory(activeEpic, storyId)}
              onAddArrayItem={(storyId, field) => addArrayItem(activeEpic, storyId, field)}
              onUpdateArrayItem={(storyId, field, index, value) =>
                updateArrayItem(activeEpic, storyId, field, index, value)
              }
              onRemoveArrayItem={(storyId, field, index) => removeArrayItem(activeEpic, storyId, field, index)}
              onGenerateStories={() => generateStoriesWithAI(activeEpic)}
              isGeneratingStories={isGeneratingStories === activeEpic}
            />
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Epic Selected</h3>
                <p className="text-muted-foreground mb-6">Create an epic or select an existing one to start editing.</p>
                <Button onClick={addEpic}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Epic
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

interface EpicEditorProps {
  epic: Epic
  onUpdateEpic: (updates: Partial<Epic>) => void
  onAddUserStory: () => void
  onUpdateUserStory: (storyId: string, updates: Partial<UserStory>) => void
  onDeleteUserStory: (storyId: string) => void
  onAddArrayItem: (storyId: string, field: "acceptance_criteria" | "edge_cases" | "validations") => void
  onUpdateArrayItem: (
    storyId: string,
    field: "acceptance_criteria" | "edge_cases" | "validations",
    index: number,
    value: string,
  ) => void
  onRemoveArrayItem: (
    storyId: string,
    field: "acceptance_criteria" | "edge_cases" | "validations",
    index: number,
  ) => void
  onGenerateStories: () => void
  isGeneratingStories: boolean
}

function EpicEditor({
  epic,
  onUpdateEpic,
  onAddUserStory,
  onUpdateUserStory,
  onDeleteUserStory,
  onAddArrayItem,
  onUpdateArrayItem,
  onRemoveArrayItem,
  onGenerateStories,
  isGeneratingStories,
}: EpicEditorProps) {
  return (
    <div className="space-y-6">
      {/* Epic Details */}
      <Card className="bg-card border-border shadow-xl notched-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-2">
            <Edit3 className="w-5 h-5 text-accent" /> Epic Details
          </CardTitle>
          <CardDescription>Define the epic title and scope</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="epic-title" title="What is the epic title?">Epic Title</Label>
            <Input
              id="epic-title"
              placeholder="e.g., User Authentication & Account Management"
              value={epic.title}
              onChange={(e) => onUpdateEpic({ title: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Epic ID: {epic.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* User Stories */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                User Stories
              </CardTitle>
              <CardDescription>Create detailed user stories for this epic</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onAddUserStory} size="sm" variant="outline" className="bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
              <Button 
                onClick={onGenerateStories} 
                size="sm"
                disabled={!epic.title || isGeneratingStories}
              >
                {isGeneratingStories ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Stories
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {epic.user_stories.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No user stories yet</p>
              <Button onClick={onAddUserStory} variant="outline" className="bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create First Story
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {epic.user_stories.map((story, index) => (
                <AccordionItem key={story.id} value={story.id} className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="text-left">
                        <p className="font-medium">{story.description || "Untitled User Story"}</p>
                        <p className="text-xs text-muted-foreground">{story.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {story.optional_fields?.priority && (
                          <Badge variant="outline" className="text-xs">
                            {story.optional_fields.priority}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteUserStory(story.id)
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <UserStoryEditor
                      story={story}
                      onUpdate={(updates) => onUpdateUserStory(story.id, updates)}
                      onAddArrayItem={(field) => onAddArrayItem(story.id, field)}
                      onUpdateArrayItem={(field, index, value) => onUpdateArrayItem(story.id, field, index, value)}
                      onRemoveArrayItem={(field, index) => onRemoveArrayItem(story.id, field, index)}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface UserStoryEditorProps {
  story: UserStory
  onUpdate: (updates: Partial<UserStory>) => void
  onAddArrayItem: (field: "acceptance_criteria" | "edge_cases" | "validations") => void
  onUpdateArrayItem: (field: "acceptance_criteria" | "edge_cases" | "validations", index: number, value: string) => void
  onRemoveArrayItem: (field: "acceptance_criteria" | "edge_cases" | "validations", index: number) => void
}

function UserStoryEditor({
  story,
  onUpdate,
  onAddArrayItem,
  onUpdateArrayItem,
  onRemoveArrayItem,
}: UserStoryEditorProps) {
  const renderArrayField = (
    field: "acceptance_criteria" | "edge_cases" | "validations",
    label: string,
    icon: React.ReactNode,
    placeholder: string,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <Button variant="outline" size="sm" onClick={() => onAddArrayItem(field)} className="h-8 bg-transparent">
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {story[field].map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={item}
              onChange={(e) => onUpdateArrayItem(field, index, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveArrayItem(field, index)}
              className="h-10 w-10 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Story Description */}
      <div className="space-y-2">
        <Label htmlFor="story-description" title="What is the user story?">Story Description</Label>
        <Textarea
          id="story-description"
          placeholder="As a [user], I want [goal], so that [reason]"
          rows={2}
          value={story.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>

      {/* Required Fields */}
      <div className="grid md:grid-cols-1 gap-6">
        {renderArrayField(
          "acceptance_criteria",
          "Acceptance Criteria",
          <CheckSquare className="w-4 h-4 text-green-500" />,
          "Enter acceptance criterion",
        )}

        {renderArrayField(
          "edge_cases",
          "Edge Cases",
          <AlertCircle className="w-4 h-4 text-orange-500" />,
          "Enter edge case",
        )}

        {renderArrayField(
          "validations",
          "Validations",
          <Shield className="w-4 h-4 text-blue-500" />,
          "Enter validation rule",
        )}
      </div>

      <Separator />

      {/* Optional Fields */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent" />
          Optional Fields
        </Label>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority" title="How important is this user story?">Priority</Label>
            <Select
              value={story.optional_fields?.priority || "Medium"}
              onValueChange={(value) =>
                onUpdate({
                  optional_fields: {
                    ...story.optional_fields,
                    priority: value as "Low" | "Medium" | "High" | "Critical",
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effort-estimate" title="How many story points does this story estimate?">Effort Estimate</Label>
            <Input
              id="effort-estimate"
              placeholder="e.g., 5 story points"
              value={story.optional_fields?.effort_estimate || ""}
              onChange={(e) =>
                onUpdate({
                  optional_fields: {
                    ...story.optional_fields,
                    effort_estimate: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk-notes" title="Any risks or concerns for this story?">Risk Notes</Label>
          <Textarea
            id="risk-notes"
            placeholder="Any risks or concerns for this story"
            rows={2}
            value={story.optional_fields?.risk_notes || ""}
            onChange={(e) =>
              onUpdate({
                optional_fields: {
                  ...story.optional_fields,
                  risk_notes: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
