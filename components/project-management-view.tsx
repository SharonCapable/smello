"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  Target,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  X,
  Wrench,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Epic, UserStory } from "@/types/user-story"
import type { StoredProject } from "@/lib/storage"
import { updateProject } from "@/lib/storage-hybrid"
import { generateUserStoriesForEpic, generateAdditionalUserStories, type GenerationOptions } from "@/lib/ai-generation"

interface ProjectManagementViewProps {
  project: StoredProject
  onBack: () => void
  onProjectUpdate: (updatedProject: StoredProject) => void
  onNavigateToTool: (tool: string) => void
}

export function ProjectManagementView({ project, onBack, onProjectUpdate, onNavigateToTool }: ProjectManagementViewProps) {
  const [currentProject, setCurrentProject] = useState<StoredProject>(project)
  const [editingStory, setEditingStory] = useState<{ epicId: string; storyId: string } | null>(null)
  const [editingEpic, setEditingEpic] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newEpicTitle, setNewEpicTitle] = useState("")
  const [showNewEpicDialog, setShowNewEpicDialog] = useState(false)
  const { toast } = useToast()

  const handleSaveProject = async () => {
    try {
      const updatedProject = await updateProject(currentProject.id, currentProject)
      if (updatedProject) {
        setCurrentProject(updatedProject)
        onProjectUpdate(updatedProject)
        toast({
          title: "Project Saved",
          description: "Your changes have been saved successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save project changes.",
        variant: "destructive",
      })
    }
  }

  const handleAddEpic = () => {
    if (!newEpicTitle.trim()) return

    const newEpic: Epic = {
      id: `epic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newEpicTitle,
      user_stories: [],
    }

    setCurrentProject((prev) => ({
      ...prev,
      epics: [...prev.epics, newEpic],
      updated_at: new Date().toISOString(),
    }))

    setNewEpicTitle("")
    setShowNewEpicDialog(false)
    toast({
      title: "Epic Added",
      description: `"${newEpicTitle}" has been added to your project.`,
    })
  }

  const handleDeleteEpic = (epicId: string) => {
    setCurrentProject((prev) => ({
      ...prev,
      epics: prev.epics.filter((epic) => epic.id !== epicId),
      updated_at: new Date().toISOString(),
    }))
    toast({
      title: "Epic Deleted",
      description: "The epic and all its user stories have been removed.",
    })
  }

  const handleGenerateUserStories = async (epicId: string, options: GenerationOptions = {}) => {
    setIsGenerating(true)
    try {
      const epic = currentProject.epics.find((e) => e.id === epicId)
      if (!epic) return

      const newStories = await generateUserStoriesForEpic(epic, currentProject.product, options)

      setCurrentProject((prev) => ({
        ...prev,
        epics: prev.epics.map((e) =>
          e.id === epicId ? { ...e, user_stories: [...e.user_stories, ...newStories] } : e,
        ),
        updated_at: new Date().toISOString(),
      }))

      toast({
        title: "User Stories Generated",
        description: `Generated ${newStories.length} new user stories for "${epic.title}".`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate user stories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddMoreStories = async (epicId: string) => {
    setIsGenerating(true)
    try {
      const epic = currentProject.epics.find((e) => e.id === epicId)
      if (!epic) return

      const additionalStories = await generateAdditionalUserStories(epic, currentProject.product, epic.user_stories, 2)

      setCurrentProject((prev) => ({
        ...prev,
        epics: prev.epics.map((e) =>
          e.id === epicId ? { ...e, user_stories: [...e.user_stories, ...additionalStories] } : e,
        ),
        updated_at: new Date().toISOString(),
      }))

      toast({
        title: "Additional Stories Generated",
        description: `Added ${additionalStories.length} more user stories.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate additional stories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteUserStory = (epicId: string, storyId: string) => {
    setCurrentProject((prev) => ({
      ...prev,
      epics: prev.epics.map((epic) =>
        epic.id === epicId
          ? { ...epic, user_stories: epic.user_stories.filter((story) => story.id !== storyId) }
          : epic,
      ),
      updated_at: new Date().toISOString(),
    }))
    toast({
      title: "User Story Deleted",
      description: "The user story has been removed.",
    })
  }

  const handleUpdateUserStory = (epicId: string, storyId: string, updatedStory: Partial<UserStory>) => {
    setCurrentProject((prev) => ({
      ...prev,
      epics: prev.epics.map((epic) =>
        epic.id === epicId
          ? {
            ...epic,
            user_stories: epic.user_stories.map((story) =>
              story.id === storyId ? { ...story, ...updatedStory } : story,
            ),
          }
          : epic,
      ),
      updated_at: new Date().toISOString(),
    }))
    setEditingStory(null)
    toast({
      title: "User Story Updated",
      description: "Your changes have been saved.",
    })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "bg-red-600/10 text-red-600 border-red-600/20"
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{currentProject.name}</h2>
          <p className="text-muted-foreground">{currentProject.product.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Wrench className="w-4 h-4 mr-2" />
                Project Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuLabel>Strategy & Research</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNavigateToTool('research-agent')}>
                Product Research
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToTool('competitive-intelligence')}>
                Competitor Analysis
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Definition & Design</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNavigateToTool('prd-generator')}>
                PRD Generator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigateToTool('user-journey-map')}>
                User Journey Map
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Technical</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onNavigateToTool('technical-blueprint')}>
                Technical Blueprint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSaveProject}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Projects
          </Button>
        </div>
      </div>

      {/* Add New Epic */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Epic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={showNewEpicDialog} onOpenChange={setShowNewEpicDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Epic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Epic</DialogTitle>
                <DialogDescription>Add a new epic to organize related user stories.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="epic-title">Epic Title</Label>
                  <Input
                    id="epic-title"
                    value={newEpicTitle}
                    onChange={(e) => setNewEpicTitle(e.target.value)}
                    placeholder="e.g., User Authentication System"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewEpicDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEpic} disabled={!newEpicTitle.trim()}>
                    Create Epic
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Epics Management */}
      <div className="space-y-6">
        {currentProject.epics.map((epic) => (
          <EpicManagementCard
            key={epic.id}
            epic={epic}
            project={currentProject}
            onDeleteEpic={handleDeleteEpic}
            onGenerateStories={handleGenerateUserStories}
            onAddMoreStories={handleAddMoreStories}
            onDeleteStory={handleDeleteUserStory}
            onUpdateStory={handleUpdateUserStory}
            editingStory={editingStory}
            setEditingStory={setEditingStory}
            isGenerating={isGenerating}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  )
}

// Epic Management Card Component
interface EpicManagementCardProps {
  epic: Epic
  project: StoredProject
  onDeleteEpic: (epicId: string) => void
  onGenerateStories: (epicId: string, options?: GenerationOptions) => void
  onAddMoreStories: (epicId: string) => void
  onDeleteStory: (epicId: string, storyId: string) => void
  onUpdateStory: (epicId: string, storyId: string, updatedStory: Partial<UserStory>) => void
  editingStory: { epicId: string; storyId: string } | null
  setEditingStory: (editing: { epicId: string; storyId: string } | null) => void
  isGenerating: boolean
  getPriorityColor: (priority?: string) => string
}

function EpicManagementCard({
  epic,
  project,
  onDeleteEpic,
  onGenerateStories,
  onAddMoreStories,
  onDeleteStory,
  onUpdateStory,
  editingStory,
  setEditingStory,
  isGenerating,
  getPriorityColor,
}: EpicManagementCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              {epic.title}
            </CardTitle>
            <CardDescription>{epic.user_stories.length} user stories</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onGenerateStories(epic.id)} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Stories
            </Button>
            {epic.user_stories.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => onAddMoreStories(epic.id)} disabled={isGenerating}>
                <Plus className="w-4 h-4 mr-2" />
                Add More
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Epic</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{epic.title}" and all its user stories? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteEpic(epic.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Epic
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {epic.user_stories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No user stories yet. Generate some to get started!</p>
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {epic.user_stories.map((story) => (
              <UserStoryManagementItem
                key={story.id}
                story={story}
                epicId={epic.id}
                onDelete={onDeleteStory}
                onUpdate={onUpdateStory}
                isEditing={editingStory?.epicId === epic.id && editingStory?.storyId === story.id}
                setEditing={setEditingStory}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

// User Story Management Item Component
interface UserStoryManagementItemProps {
  story: UserStory
  epicId: string
  onDelete: (epicId: string, storyId: string) => void
  onUpdate: (epicId: string, storyId: string, updatedStory: Partial<UserStory>) => void
  isEditing: boolean
  setEditing: (editing: { epicId: string; storyId: string } | null) => void
  getPriorityColor: (priority?: string) => string
}

function UserStoryManagementItem({
  story,
  epicId,
  onDelete,
  onUpdate,
  isEditing,
  setEditing,
  getPriorityColor,
}: UserStoryManagementItemProps) {
  const [editForm, setEditForm] = useState(story)

  const handleSave = () => {
    onUpdate(epicId, story.id, editForm)
  }

  const handleCancel = () => {
    setEditForm(story)
    setEditing(null)
  }

  return (
    <AccordionItem value={story.id} className="border-border">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full mr-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {story.id}
            </Badge>
            <span className="text-left font-medium">{story.title || story.description}</span>
          </div>
          <div className="flex items-center gap-2">
            {story.optional_fields?.priority && (
              <Badge className={getPriorityColor(story.optional_fields.priority)}>
                {story.optional_fields.priority}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        {isEditing ? (
          <UserStoryEditForm story={editForm} onChange={setEditForm} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <UserStoryDisplay
            story={story}
            onEdit={() => setEditing({ epicId, storyId: story.id })}
            onDelete={() => onDelete(epicId, story.id)}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

// User Story Display Component
interface UserStoryDisplayProps {
  story: UserStory
  onEdit: () => void
  onDelete: () => void
}

function UserStoryDisplay({ story, onEdit, onDelete }: UserStoryDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User Story</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user story? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Story
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Story Content Display */}
      <div>
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
        </h4>
        <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">{story.description}</p>
      </div>

      {/* Acceptance Criteria */}
      {story.acceptance_criteria.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Acceptance Criteria
          </h4>
          <ul className="space-y-2">
            {story.acceptance_criteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validations */}
      {story.validations.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Validations
          </h4>
          <ul className="space-y-2">
            {story.validations.map((validation, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Target className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{validation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edge Cases */}
      {story.edge_cases.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Edge Cases
          </h4>
          <ul className="space-y-2">
            {story.edge_cases.map((edge, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                <span>{edge}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// User Story Edit Form Component
interface UserStoryEditFormProps {
  story: UserStory
  onChange: (story: UserStory) => void
  onSave: () => void
  onCancel: () => void
}

function UserStoryEditForm({ story, onChange, onSave, onCancel }: UserStoryEditFormProps) {
  const updateField = (field: keyof UserStory, value: any) => {
    onChange({ ...story, [field]: value })
  }

  const updateOptionalField = (field: string, value: any) => {
    onChange({
      ...story,
      optional_fields: {
        ...story.optional_fields,
        [field]: value,
      },
    })
  }

  const updateArrayField = (field: keyof UserStory, index: number, value: string) => {
    const array = story[field] as string[]
    const newArray = [...array]
    newArray[index] = value
    onChange({ ...story, [field]: newArray })
  }

  const addArrayItem = (field: keyof UserStory) => {
    const array = story[field] as string[]
    onChange({ ...story, [field]: [...array, ""] })
  }

  const removeArrayItem = (field: keyof UserStory, index: number) => {
    const array = story[field] as string[]
    onChange({ ...story, [field]: array.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="story-title">Story Title</Label>
        <Input
          id="story-title"
          value={story.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Brief descriptive title"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="story-description">Description</Label>
        <Textarea
          id="story-description"
          value={story.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="As a [user], I want [goal] so that [benefit]"
          rows={3}
        />
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="story-priority">Priority</Label>
        <Select
          value={story.optional_fields?.priority || ""}
          onValueChange={(value) => updateOptionalField("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Effort Estimate */}
      <div>
        <Label htmlFor="story-effort">Effort Estimate</Label>
        <Input
          id="story-effort"
          value={story.optional_fields?.effort_estimate || ""}
          onChange={(e) => updateOptionalField("effort_estimate", e.target.value)}
          placeholder="e.g., 3 story points, 2 days"
        />
      </div>

      {/* Acceptance Criteria */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Acceptance Criteria</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("acceptance_criteria")}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {story.acceptance_criteria.map((criteria, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={criteria}
                onChange={(e) => updateArrayField("acceptance_criteria", index, e.target.value)}
                placeholder="Acceptance criteria"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem("acceptance_criteria", index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Validations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Validations</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("validations")}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {story.validations.map((validation, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={validation}
                onChange={(e) => updateArrayField("validations", index, e.target.value)}
                placeholder="Validation rule"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("validations", index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Edge Cases */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Edge Cases</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("edge_cases")}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {story.edge_cases.map((edge, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={edge}
                onChange={(e) => updateArrayField("edge_cases", index, e.target.value)}
                placeholder="Edge case scenario"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeArrayItem("edge_cases", index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Notes */}
      <div>
        <Label htmlFor="story-risk">Risk Notes</Label>
        <Textarea
          id="story-risk"
          value={story.optional_fields?.risk_notes || ""}
          onChange={(e) => updateOptionalField("risk_notes", e.target.value)}
          placeholder="Any risks or concerns related to this story"
          rows={2}
        />
      </div>
    </div>
  )
}
