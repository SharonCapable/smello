"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, ExternalLink, Copy, CheckCircle, AlertTriangle, Zap, Github, Trello } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { StoredProject } from "@/lib/storage"
import {
  exportForJira,
  exportForTrello,
  exportForClickUp,
  exportForAzureDevOps,
  exportForGitHub,
} from "@/lib/export-templates"

interface EnhancedExportDialogProps {
  project: StoredProject
}

export function EnhancedExportDialog({ project }: EnhancedExportDialogProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const handleExport = (format: string, content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${filename} has been downloaded successfully.`,
    })
  }

  const handleCopy = async (content: string, format: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(null), 2000)
      toast({
        title: "Copied to Clipboard",
        description: `${format} content has been copied to your clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try downloading instead.",
        variant: "destructive",
      })
    }
  }

  const getProjectFilename = (extension: string) => {
    return `${project.product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${extension}`
  }

  const exportFormats = [
    {
      id: "json",
      name: "JSON",
      description: "Structured data format",
      icon: <FileText className="w-4 h-4" />,
      content: JSON.stringify(project, null, 2),
      filename: getProjectFilename("json"),
      mimeType: "application/json",
      badge: "Universal",
    },
    {
      id: "csv",
      name: "CSV",
      description: "Spreadsheet compatible",
      icon: <FileText className="w-4 h-4" />,
      content: exportProjectAsCSV(project),
      filename: getProjectFilename("csv"),
      mimeType: "text/csv",
      badge: "Excel",
    },
    {
      id: "markdown",
      name: "Markdown",
      description: "Documentation format",
      icon: <FileText className="w-4 h-4" />,
      content: exportProjectAsMarkdown(project),
      filename: getProjectFilename("md"),
      mimeType: "text/markdown",
      badge: "Docs",
    },
  ]

  const integrationFormats = [
    {
      id: "jira",
      name: "Jira",
      description: "CSV import for Jira",
      icon: <Zap className="w-4 h-4" />,
      content: exportForJira(project),
      filename: getProjectFilename("jira.csv"),
      mimeType: "text/csv",
      instructions: "Import via Jira > Issues > Import Issues from CSV",
    },
    {
      id: "trello",
      name: "Trello",
      description: "JSON board template",
      icon: <Trello className="w-4 h-4" />,
      content: exportForTrello(project),
      filename: getProjectFilename("trello.json"),
      mimeType: "application/json",
      instructions: "Import via Trello > Create Board > Import JSON",
    },
    {
      id: "clickup",
      name: "ClickUp",
      description: "CSV task import",
      icon: <FileText className="w-4 h-4" />,
      content: exportForClickUp(project),
      filename: getProjectFilename("clickup.csv"),
      mimeType: "text/csv",
      instructions: "Import via ClickUp > Space Settings > Import > CSV",
    },
    {
      id: "azure",
      name: "Azure DevOps",
      description: "Work items CSV",
      icon: <FileText className="w-4 h-4" />,
      content: exportForAzureDevOps(project),
      filename: getProjectFilename("azure.csv"),
      mimeType: "text/csv",
      instructions: "Import via Azure DevOps > Work Items > Import Work Items",
    },
    {
      id: "github",
      name: "GitHub Issues",
      description: "Issue templates",
      icon: <Github className="w-4 h-4" />,
      content: exportForGitHub(project),
      filename: getProjectFilename("github.md"),
      mimeType: "text/markdown",
      instructions: "Copy sections to create individual GitHub issues",
    },
  ]

  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Formats</TabsTrigger>
          <TabsTrigger value="integrations">PM Tool Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid gap-4">
            {exportFormats.map((format) => (
              <Card key={format.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {format.icon}
                      <div>
                        <CardTitle className="text-base">{format.name}</CardTitle>
                        <CardDescription className="text-sm">{format.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {format.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExport(format.name, format.content, format.filename, format.mimeType)}
                      size="sm"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(format.content, format.name)}
                      size="sm"
                      className="bg-transparent"
                    >
                      {copiedFormat === format.name ? (
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 mr-2" />
                      )}
                      {copiedFormat === format.name ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrationFormats.map((format) => (
              <Card key={format.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {format.icon}
                      <div>
                        <CardTitle className="text-base">{format.name}</CardTitle>
                        <CardDescription className="text-sm">{format.description}</CardDescription>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{format.instructions}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExport(format.name, format.content, format.filename, format.mimeType)}
                      size="sm"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(format.content, format.name)}
                      size="sm"
                      className="bg-transparent"
                    >
                      {copiedFormat === format.name ? (
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 mr-2" />
                      )}
                      {copiedFormat === format.name ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1 mb-2">
            <AlertTriangle className="w-4 h-4" />
            Export includes all {project.epics.length} epics and{" "}
            {project.epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)} user stories
          </div>
          <p>Choose the format that best fits your workflow and project management tools.</p>
        </div>
      </div>
    </div>
  )
}

// Helper functions for standard exports
function exportProjectAsCSV(project: StoredProject): string {
  const headers = [
    "Epic ID",
    "Epic Title",
    "Story ID",
    "Story Description",
    "Acceptance Criteria",
    "Edge Cases",
    "Validations",
    "Priority",
    "Effort Estimate",
    "Risk Notes",
  ]

  const rows = [headers.join(",")]

  project.epics.forEach((epic) => {
    epic.user_stories.forEach((story) => {
      const row = [
        epic.id,
        `"${epic.title}"`,
        story.id,
        `"${story.description}"`,
        `"${story.acceptance_criteria.join("; ")}"`,
        `"${story.edge_cases.join("; ")}"`,
        `"${story.validations.join("; ")}"`,
        story.optional_fields?.priority || "",
        `"${story.optional_fields?.effort_estimate || ""}"`,
        `"${story.optional_fields?.risk_notes || ""}"`,
      ]
      rows.push(row.join(","))
    })
  })

  return rows.join("\n")
}

function exportProjectAsMarkdown(project: StoredProject): string {
  let markdown = `# ${project.product.name}\n\n`
  markdown += `${project.product.description}\n\n`
  markdown += `**Created:** ${new Date(project.created_at).toLocaleDateString()}\n`
  markdown += `**Updated:** ${new Date(project.updated_at).toLocaleDateString()}\n\n`

  project.epics.forEach((epic) => {
    markdown += `## ${epic.title} (${epic.id})\n\n`

    epic.user_stories.forEach((story) => {
      markdown += `### ${story.id}\n\n`
      markdown += `${story.description}\n\n`

      if (story.acceptance_criteria.length > 0) {
        markdown += `**Acceptance Criteria:**\n`
        story.acceptance_criteria.forEach((criteria) => {
          markdown += `- ${criteria}\n`
        })
        markdown += `\n`
      }

      if (story.edge_cases.length > 0) {
        markdown += `**Edge Cases:**\n`
        story.edge_cases.forEach((edge) => {
          markdown += `- ${edge}\n`
        })
        markdown += `\n`
      }

      if (story.validations.length > 0) {
        markdown += `**Validations:**\n`
        story.validations.forEach((validation) => {
          markdown += `- ${validation}\n`
        })
        markdown += `\n`
      }

      if (story.optional_fields) {
        markdown += `**Details:**\n`
        if (story.optional_fields.priority) {
          markdown += `- Priority: ${story.optional_fields.priority}\n`
        }
        if (story.optional_fields.effort_estimate) {
          markdown += `- Effort: ${story.optional_fields.effort_estimate}\n`
        }
        if (story.optional_fields.risk_notes) {
          markdown += `- Risk Notes: ${story.optional_fields.risk_notes}\n`
        }
        markdown += `\n`
      }

      markdown += `---\n\n`
    })
  })

  return markdown
}
