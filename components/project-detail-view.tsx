"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, FileText, FolderOpen, Download, Edit3, Target, AlertTriangle, CheckCircle, ExternalLink, Eye } from "lucide-react"
import { EnhancedExportDialog } from "@/components/enhanced-export-dialog"
import { JiraIntegration } from "@/components/jira-integration"
import { DocumentViewer } from "@/components/document-viewer"
import type { StoredProject } from "@/lib/storage"

interface ProjectDetailViewProps {
  project: StoredProject
  onBack: () => void
  onEdit?: () => void
}

export function ProjectDetailView({ project, onBack, onEdit }: ProjectDetailViewProps) {
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="mb-8">
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
                Manage Project
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent">
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Document View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Document & Generated Content View</DialogTitle>
                  <DialogDescription>
                    View your document alongside generated epics and user stories for comprehensive analysis
                  </DialogDescription>
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

        {/* Product Details */}
        {project.product.sector && (
          <div className="mb-6">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {project.product.sector}
            </Badge>
          </div>
        )}
      </div>

      {/* Epics and User Stories */}
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
                          <span className="text-left font-medium">{story.title || story.description}</span>
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
    </div>
  )
}
