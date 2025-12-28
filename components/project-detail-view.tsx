"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  FileText,
  FolderOpen,
  Download,
  Edit3,
  Target,
  Users,
  Building2,
  FileCheck,
  Lightbulb,
  ArrowLeft,
  Layout,
  Shield,
  Swords,
  Map,
  UserCheck,
  GitBranch
} from "lucide-react"
import { EnhancedExportDialog } from "@/components/enhanced-export-dialog"
import { DocumentViewer } from "@/components/document-viewer"
import type { StoredProject } from "@/lib/storage"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProjectDetailViewProps {
  project: StoredProject
  onBack: () => void
  onEdit?: () => void
  onNavigateToTool?: (tool: string) => void
}

export function ProjectDetailView({ project, onBack, onEdit, onNavigateToTool }: ProjectDetailViewProps) {
  const [isEditingOverview, setIsEditingOverview] = useState(false)
  const [editedProject, setEditedProject] = useState(project)

  const totalStories = project.epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)
  const totalCriteria = project.epics.reduce(
    (acc, epic) => acc + epic.user_stories.reduce((storyAcc, story) => storyAcc + story.acceptance_criteria.length, 0),
    0,
  )

  const hasSourceDocument = !!(project.pdf_source_text || project.pdf_source_name)

  // Tool configuration
  const tools = [
    { id: "project-edit", name: "Epics & User Stories", icon: FolderOpen, description: "Manage backlog & requirements" },
    { id: "prd-generator", name: "PRD Generator", icon: FileText, description: "Product Requirements Document" },
    { id: "competitive-intelligence", name: "Competitive Analysis", icon: Swords, description: "SWOT & feature matrix" },
    { id: "feature-prioritization", name: "Feature Prioritization", icon: Target, description: "Prioritize features" },
    { id: "user-journey-map", name: "User Journey", icon: Map, description: "Map user flows" },
    { id: "technical-blueprint", name: "Technical Blueprint", icon: Layout, description: "Architecture design" },
    { id: "research-agent", name: "Research Agent", icon: Lightbulb, description: "AI-powered research" },
    { id: "roadmap-builder", name: "Roadmap Builder", icon: GitBranch, description: "Build product roadmap" },
    { id: "risk-analysis", name: "Risk Analysis", icon: Shield, description: "Identify & mitigate risks" },
    { id: "pitch-deck-generator", name: "Pitch Deck", icon: FileCheck, description: "Investor presentation" },
  ]

  const handleSaveOverview = () => {
    // TODO: Implement save logic to update project in storage
    setIsEditingOverview(false)
    // Call parent update handler if provided
    if (onEdit) {
      // onEdit() could be modified to accept the updated project
    }
  }

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground text-sm">
              Created {new Date(project.created_at).toLocaleDateString()} • Updated {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Export Project</DialogTitle>
                <DialogDescription>
                  Choose how you want to export "{project.name}"
                </DialogDescription>
              </DialogHeader>
              <EnhancedExportDialog project={project} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}

      {/* Main Content - Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          {hasSourceDocument && <TabsTrigger value="source">Source Document</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Key information about your product</CardDescription>
              </div>
              {!isEditingOverview && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingOverview(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Overview
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingOverview ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={editedProject.product.name}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        product: { ...editedProject.product, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editedProject.product.description}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        product: { ...editedProject.product, description: e.target.value }
                      })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input
                      id="target-audience"
                      value={editedProject.product.target_audience}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        product: { ...editedProject.product, target_audience: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={editedProject.product.sector}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        product: { ...editedProject.product, sector: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vision">Product Vision</Label>
                    <Textarea
                      id="vision"
                      value={editedProject.product.vision || ""}
                      onChange={(e) => setEditedProject({
                        ...editedProject,
                        product: { ...editedProject.product, vision: e.target.value }
                      })}
                      rows={3}
                      placeholder="What is the long-term vision for this product?"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setEditedProject(project)
                      setIsEditingOverview(false)
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveOverview}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold">Description</h3>
                    </div>
                    <p className="text-muted-foreground">{project.product.description}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold">Target Audience</h3>
                    </div>
                    <p className="text-muted-foreground">{project.product.target_audience}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold">Sector</h3>
                    </div>
                    <p className="text-muted-foreground">{project.product.sector}</p>
                  </div>

                  {project.product.vision && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-accent" />
                        <h3 className="font-semibold">Product Vision</h3>
                      </div>
                      <p className="text-muted-foreground">{project.product.vision}</p>
                    </div>
                  )}

                  {project.product.key_features && project.product.key_features.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-accent" />
                        <h3 className="font-semibold">Key Features</h3>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {project.product.key_features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                onClick={() => onNavigateToTool?.(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <tool.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <CardDescription className="text-xs">{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Source Document Tab - Only if exists */}
        {hasSourceDocument && (
          <TabsContent value="source" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Document</CardTitle>
                <CardDescription>
                  {project.pdf_source_name || "AI-generated content"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.pdf_source_text ? (
                  <DocumentViewer
                    projectData={project}
                    documentContent={project.pdf_source_text}
                  />
                ) : (
                  <p className="text-muted-foreground">No source document available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
