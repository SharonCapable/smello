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
  Plus
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prd">PRD & Docs</TabsTrigger>
          <TabsTrigger value="stories">Epics & Stories</TabsTrigger>
          <TabsTrigger value="tech">Technical Blueprint</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in-up">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Vision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Description</h4>
                    <p>{project.product.description}</p>
                  </div>
                  {project.product.target_audience && (
                    <div>
                      <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Target Audience</h4>
                      <p>{project.product.target_audience}</p>
                    </div>
                  )}
                  {project.product.key_features && project.product.key_features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Key Features</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {project.product.key_features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {project.generatedIdeas && project.generatedIdeas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Original Idea Candidates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {project.generatedIdeas.map((idea, idx) => (
                        <AccordionItem key={idx} value={`idea-${idx}`}>
                          <AccordionTrigger>{idea.title}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {idea.keywords?.map((k: string, ki: number) => (
                                <Badge key={ki} variant="secondary" className="text-xs">{k}</Badge>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.product.sector && (
                    <div>
                      <span className="text-sm text-muted-foreground block mb-1">Sector</span>
                      <Badge variant="outline">{project.product.sector}</Badge>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Project ID</span>
                    <code className="text-xs bg-muted p-1 rounded">{project.id}</code>
                  </div>
                </CardContent>
              </Card>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Source Document
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
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PRD & DOCS */}
        <TabsContent value="prd" className="space-y-6 animate-fade-in-up">
          {prd ? (
            <div className="grid gap-6">
              <div className="flex justify-end">
                {onNavigateToTool && (
                  <Button onClick={() => onNavigateToTool('prd-generator')} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Add/Update PRD
                  </Button>
                )}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Product Requirements Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {prd.problemStatement && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Problem Statement</h3>
                      <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{prd.problemStatement}</div>
                    </div>
                  )}
                  {prd.userStories && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">User Stories (High Level)</h3>
                      <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{prd.userStories}</div>
                    </div>
                  )}
                  {prd.functionalRequirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Functional Requirements</h3>
                      <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{prd.functionalRequirements}</div>
                    </div>
                  )}
                  {prd.nonFunctionalRequirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Non-Functional Requirements</h3>
                      <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{prd.nonFunctionalRequirements}</div>
                    </div>
                  )}
                  {prd.fullDocument && !prd.problemStatement && (
                    <div>
                      <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{prd.fullDocument}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold">No PRD Generated Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Generate a comprehensive Product Requirements Document using our AI tool to structure your product vision.
                  </p>
                </div>
                {onNavigateToTool && (
                  <Button onClick={() => onNavigateToTool('prd-generator')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate PRD
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: EPICS & STORIES */}
        <TabsContent value="stories" className="space-y-6 animate-fade-in-up">
          <div className="flex justify-end gap-2 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Jira Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Jira Integration</DialogTitle>
                  <DialogDescription>
                    Connect your project to Jira for seamless workflow management
                  </DialogDescription>
                </DialogHeader>
                <JiraIntegration project={project} />
              </DialogContent>
            </Dialog>
          </div>
          {project.epics.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold">No Epics or Stories</h3>
                  <p className="text-muted-foreground">
                    Start breaking down your product into Epics and User Stories.
                  </p>
                </div>
                {onNavigateToTool && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => onNavigateToTool('manual-flow')}>Add Manually</Button>
                    <Button variant="secondary" onClick={() => onNavigateToTool('ai-flow')}>Generate with AI</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {project.epics.map((epic) => (
                <Card key={epic.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-accent" />
                          {epic.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Epic ID: {epic.id} • {epic.user_stories.length} user stories
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{epic.user_stories.length} stories</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible value={expandedEpic} onValueChange={setExpandedEpic}>
                      {epic.user_stories.map((story, index) => (
                        <AccordionItem key={story.id} value={`${epic.id}-${story.id}`} className="border-border">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {story.id}
                                </Badge>
                                <span className="text-left font-medium">{story.title || story.description.substring(0, 60) + "..."}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {story.status && (
                                  <Badge className={getStatusColor(story.status)}>
                                    {story.status}
                                  </Badge>
                                )}
                                {story.jira_key && (
                                  <Badge variant="outline" className="text-xs">
                                    {story.jira_key}
                                  </Badge>
                                )}
                                {story.optional_fields?.priority && (
                                  <Badge className={getPriorityColor(story.optional_fields.priority)}>
                                    {story.optional_fields.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-6">
                              {/* Description */}
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

                              {/* Optional Fields */}
                              {story.optional_fields && (
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <h4 className="font-semibold text-foreground mb-3">Additional Details</h4>
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    {story.optional_fields.priority && (
                                      <div>
                                        <span className="font-medium">Priority:</span>
                                        <Badge className={`ml-2 ${getPriorityColor(story.optional_fields.priority)}`}>
                                          {story.optional_fields.priority}
                                        </Badge>
                                      </div>
                                    )}
                                    {story.optional_fields.effort_estimate && (
                                      <div>
                                        <span className="font-medium">Effort Estimate:</span>
                                        <span className="ml-2 text-muted-foreground">
                                          {story.optional_fields.effort_estimate}
                                        </span>
                                      </div>
                                    )}
                                    {story.optional_fields.risk_notes && (
                                      <div className="md:col-span-2">
                                        <span className="font-medium">Risk Notes:</span>
                                        <p className="mt-1 text-muted-foreground">{story.optional_fields.risk_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: TECHNICAL BLUEPRINT */}
        <TabsContent value="tech" className="space-y-6 animate-fade-in-up">
          {project.blueprints ? (
            <div className="grid gap-6">
              <div className="flex justify-end">
                {onNavigateToTool && (
                  <Button onClick={() => onNavigateToTool('technical-blueprint')} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Update Blueprint
                  </Button>
                )}
              </div>
              {project.blueprints.architecture && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-accent" />
                      System Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{project.blueprints.architecture}</div>
                  </CardContent>
                </Card>
              )}
              {project.blueprints.database && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-accent" />
                      Database Schema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{project.blueprints.database}</div>
                  </CardContent>
                </Card>
              )}
              {project.blueprints.api && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-accent" />
                      API Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{project.blueprints.api}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Cpu className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold">No Technical Blueprint</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Generate system architecture, database schema, and API specs for this project.
                  </p>
                </div>
                {onNavigateToTool && (
                  <Button onClick={() => onNavigateToTool('technical-blueprint')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Blueprint
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
