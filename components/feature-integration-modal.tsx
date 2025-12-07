"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Plus, FolderOpen } from "lucide-react"
import { getStoredProjects, type StoredProject } from "@/lib/storage"

interface FeatureForIntegration {
  name: string
  description: string
  priorityScore: number
  action: string
  source: string
}

interface FeatureIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  feature: FeatureForIntegration | null
}

export function FeatureIntegrationModal({ isOpen, onClose, feature }: FeatureIntegrationModalProps) {
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [integrationType, setIntegrationType] = useState<"new" | "existing">("new")
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedEpicType, setSelectedEpicType] = useState<"epic" | "story">("epic")

  useEffect(() => {
    if (isOpen) {
      const loadedProjects = getStoredProjects()
      setProjects(loadedProjects)
      if (loadedProjects.length > 0) {
        setSelectedProjectId(loadedProjects[0].id)
        setIntegrationType("existing")
      }
    }
  }, [isOpen])

  const handleIntegrate = () => {
    if (!feature) return

    let targetProject: StoredProject | null = null

    if (integrationType === "existing") {
      targetProject = projects.find(p => p.id === selectedProjectId) || null
    } else if (integrationType === "new" && newProjectName.trim()) {
      // Create new project with the feature
      const newProject: StoredProject = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        product: {
          name: newProjectName.trim(),
          description: feature.description || `Project based on ${feature.name}`
        },
        epics: selectedEpicType === "epic" ? [{
          id: "E1",
          title: feature.name,
          user_stories: []
        }] : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Save to localStorage using the storage module
      const existingProjects = getStoredProjects()
      const updatedProjects = [...existingProjects, newProject]
      localStorage.setItem('user-story-projects', JSON.stringify(updatedProjects))
      
      targetProject = newProject
    }

    if (targetProject) {
      // Store the selected project for navigation
      localStorage.setItem('smello-selected-project', JSON.stringify(targetProject))
      
      // Navigate to project management
      window.location.href = '/?state=project-manager&project=' + targetProject.id
    }

    onClose()
  }

  if (!feature) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Integrate Feature
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Feature Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Feature to Integrate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium text-sm">{feature.name}</span>
                {feature.description && (
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Score: {feature.priorityScore.toFixed(2)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {feature.action}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Integration Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Integration Method</Label>
            <RadioGroup value={integrationType} onValueChange={(value: "new" | "existing") => setIntegrationType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="text-sm">Create New Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" disabled={projects.length === 0} />
                <Label htmlFor="existing" className="text-sm">
                  Add to Existing Project {projects.length === 0 && "(no projects available)"}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* New Project Options */}
          {integrationType === "new" && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="project-name" className="text-sm font-medium">Project Name</Label>
                <input
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Create as</Label>
                <Select value={selectedEpicType} onValueChange={(value: "epic" | "story") => setSelectedEpicType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic">New Epic</SelectItem>
                    <SelectItem value="story">User Story (in existing epic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Existing Project Selection */}
          {integrationType === "existing" && projects.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleIntegrate}
              disabled={
                (integrationType === "new" && !newProjectName.trim()) ||
                (integrationType === "existing" && !selectedProjectId)
              }
              className="flex-1"
            >
              Integrate Feature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
