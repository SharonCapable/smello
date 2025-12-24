"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Calendar,
  FileText,
  FolderOpen,
  Download,
  Edit3,
  Target,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Eye,
  Layout,
  Database,
  Server,
  Cpu,
  Lightbulb,
  Plus,
  Search
} from "lucide-react"
import { EnhancedExportDialog } from "@/components/enhanced-export-dialog"
import { JiraIntegration } from "@/components/jira-integration"
import { DocumentViewer } from "@/components/document-viewer"
import type { StoredProject } from "@/lib/storage"

interface ProjectDetailViewProps {
  project: StoredProject
  onBack: () => void
  onEdit?: () => void
  onNavigateToTool?: (tool: string) => void
}

export function ProjectDetailView({ project, onBack, onEdit, onNavigateToTool }: ProjectDetailViewProps) {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null)

  const totalStories = project.epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)
  const totalCriteria = project.epics.reduce(
    (acc, epic) => acc + epic.user_stories.reduce((storyAcc, story) => storyAcc + story.acceptance_criteria.length, 0),
    0,
  )

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-100 text-green-800"
      case "in qa":
        return "bg-purple-100 text-purple-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper to parse PRD if string or object
  const getPrdContent = () => {
    if (!project.prd) return null;
    if (typeof project.prd === 'string') {
      return { fullDocument: project.prd };
    }
    return project.prd;
  }

  const prd = getPrdContent();

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Project Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 pl-0" onClick={onBack}>
          ← Back to Projects
        </Button>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{project.name}</h2>
            <p className="text-muted-foreground text-lg">{project.product.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export
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
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="bg-transparent">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{project.epics.length}</p>
                  <p className="text-xs text-muted-foreground">Epics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{totalStories}</p>
                  <p className="text-xs text-muted-foreground">User Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{totalCriteria}</p>
                  <p className="text-xs text-muted-foreground">Acceptance Criteria</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-sm font-semibold">Updated</p>
                  <p className="text-xs text-muted-foreground">{new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Project Sidebar / Navigation */}
        <div className="md:col-span-1 space-y-4">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                Project Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-3 hover:bg-accent/10 transition-colors"
                onClick={() => { }} // Already on dashboard
              >
                <FolderOpen className="w-4 h-4 text-accent" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-3 hover:bg-accent/10"
                onClick={() => onNavigateToTool?.('prd-generator')}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                PRD & Docs
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-3 hover:bg-accent/10"
                onClick={() => onNavigateToTool?.('manual-flow')}
              >
                <Target className="w-4 h-4 text-orange-500" />
                Epics & Stories
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-3 hover:bg-accent/10"
                onClick={() => onNavigateToTool?.('technical-blueprint')}
              >
                <Cpu className="w-4 h-4 text-purple-500" />
                Architecture
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-10 px-3 hover:bg-accent/10"
                onClick={() => onNavigateToTool?.('research-agent')}
              >
                <Search className="w-4 h-4 text-green-500" />
                Market Research
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer group hover:border-accent/50 transition-all hover:shadow-md"
              onClick={() => onNavigateToTool?.('prd-generator')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  {prd ? (
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Generated</Badge>
                  ) : (
                    <Badge variant="secondary">Missing</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">Product Requirements</h3>
                <p className="text-sm text-muted-foreground">The full PRD including functional and non-functional specs.</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer group hover:border-accent/50 transition-all hover:shadow-md"
              onClick={() => onNavigateToTool?.('manual-flow')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Target className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">{project.epics.length} Epics</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">Backlog & Stories</h3>
                <p className="text-sm text-muted-foreground">Detailed user stories with acceptance criteria and priority.</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer group hover:border-accent/50 transition-all hover:shadow-md"
              onClick={() => onNavigateToTool?.('technical-blueprint')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Cpu className="w-5 h-5" />
                  </div>
                  {project.blueprints ? (
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Ready</Badge>
                  ) : (
                    <Badge variant="secondary">Incomplete</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">Architecture Blueprint</h3>
                <p className="text-sm text-muted-foreground">Technical specs, database schema, and API documentation.</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer group hover:border-accent/50 transition-all hover:shadow-md"
              onClick={() => onNavigateToTool?.('research-agent')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary">Analysis</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">Market Research</h3>
                <p className="text-sm text-muted-foreground">Competitor analysis and market insights for your idea.</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Vision Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Product Vision</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">Description</h4>
                <p className="text-base leading-relaxed">{project.product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {project.product.target_audience && (
                  <div>
                    <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">Target Audience</h4>
                    <p className="text-sm">{project.product.target_audience}</p>
                  </div>
                )}
                {project.product.sector && (
                  <div>
                    <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">Sector</h4>
                    <Badge variant="secondary" className="mt-1">{project.product.sector}</Badge>
                  </div>
                )}
              </div>
              {project.product.key_features && project.product.key_features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1 text-xs uppercase tracking-wider text-muted-foreground">Key Features</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.product.key_features.map((f, i) => (
                      <Badge key={i} variant="outline" className="bg-accent/5">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source Document Section */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-background border flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">{project.documentFileName || "Source Document"}</h4>
                  <p className="text-xs text-muted-foreground">The original document used to bootstrap this project</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Source
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Document Viewer</DialogTitle>
                  </DialogHeader>
                  <DocumentViewer
                    projectData={project}
                    documentContent={project.documentContent || undefined}
                    documentFileName={project.documentFileName || "Source Document"}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
