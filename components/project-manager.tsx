"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import { FolderOpen, Plus, Search, Calendar, FileText, Trash2, Download, Sparkles, Edit3, Upload } from "lucide-react"
import { getStoredProjects, deleteProject, saveProject } from "@/lib/storage-hybrid"
import type { StoredProject } from "@/lib/storage"
import { EnhancedExportDialog } from "@/components/enhanced-export-dialog"
import type { InputMode, ProjectData } from "@/types/user-story"
import { NewProjectModal } from "@/components/new-project-modal"
import { useToast } from "@/hooks/use-toast"

interface ProjectManagerProps {
  onCreateNew: () => void
  onLoadProject: (project: StoredProject) => void
  onModeSelect: (mode: InputMode) => void
}

export function ProjectManager({ onCreateNew, onLoadProject, onModeSelect }: ProjectManagerProps) {
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadProjects = async () => {
      const stored = await getStoredProjects()
      setProjects(stored)
    }
    loadProjects()
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId)
    const stored = await getStoredProjects()
    setProjects(stored)
  }

  const handleLoadProject = (project: StoredProject) => {
    onLoadProject(project)
  }

  const getProjectStats = (project: StoredProject) => {
    const totalStories = project.epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)
    return {
      epics: project.epics.length,
      stories: totalStories,
    }
  }

  const getModeIcon = (project: StoredProject) => {
    const hasStructuredContent = project.epics.some((epic) =>
      epic.user_stories.some(
        (story) =>
          story.acceptance_criteria.length >= 3 && story.edge_cases.length >= 2 && story.validations.length >= 2,
      ),
    )
    return hasStructuredContent ? <Sparkles className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />
  }

  const handleCreateManualProject = async (data: { name: string; description: string; sector: string; targetAudience: string }) => {
    try {
      const newProject: ProjectData = {
        product: {
          name: data.name,
          description: data.description,
          sector: data.sector,
          target_audience: data.targetAudience
        },
        epics: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const saved = await saveProject(newProject)
      setShowNewProjectModal(false)
      onLoadProject(saved)

      toast({
        title: "Project Created",
        description: `Project "${saved.name}" has been created successfully.`
      })
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Project Manager</h2>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{projects.length} Projects</Badge>
            <Button onClick={() => setShowNewProjectModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">Manage your saved user story projects and export data.</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            {projects.length === 0 ? (
              <>
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6">Create your first user story project to get started.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setShowNewProjectModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Matching Projects</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project)
            return (
              <Card key={project.id} className="bg-card border-border hover:border-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getModeIcon(project)}
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Export Project</DialogTitle>
                            <DialogDescription>
                              Choose how you want to export "{project.name}" with enhanced PM tool integrations
                            </DialogDescription>
                          </DialogHeader>
                          <EnhancedExportDialog project={project} />
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{project.product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      {stats.epics} epics
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {stats.stories} stories
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                  <Separator />
                  <Button onClick={() => handleLoadProject(project)} className="w-full" size="sm">
                    Open Project
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onCreateFromIdea={() => {
          setShowNewProjectModal(false)
          onCreateNew()
        }}
        onCreateFromDescription={handleCreateManualProject}
        onCreateFromDocument={(file) => {
          toast({
            title: "Coming Soon",
            description: "Document upload and parsing will be available in Phase 3.",
          })
        }}
      />
    </div>
  )
}
