"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ExternalLink, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  Key
} from "lucide-react"
import type { StoredProject } from "@/lib/storage"

interface JiraConfig {
  domain: string
  username: string
  apiToken: string
  projectKey: string
}

interface JiraStory {
  id: string
  key: string
  summary: string
  description: string
  status: string
  storyPoints?: number
  assignee?: string
  epicKey?: string
  url: string
}

interface JiraIntegrationProps {
  project: StoredProject
  onProjectUpdate?: (project: StoredProject) => void
}

export function JiraIntegration({ project, onProjectUpdate }: JiraIntegrationProps) {
  const [config, setConfig] = useState<JiraConfig>({
    domain: '',
    username: '',
    apiToken: '',
    projectKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [jiraStories, setJiraStories] = useState<JiraStory[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('export')

  const loadConfig = () => {
    const saved = localStorage.getItem('smello-jira-config')
    if (saved) {
      setConfig(JSON.parse(saved))
    }
  }

  const saveConfig = (newConfig: JiraConfig) => {
    localStorage.setItem('smello-jira-config', JSON.stringify(newConfig))
    setConfig(newConfig)
  }

  const testConnection = async () => {
    if (!config.domain || !config.username || !config.apiToken) {
      alert('Please fill in all connection details')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`https://${config.domain}.atlassian.net/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.apiToken}`)}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        setSyncStatus('success')
        alert('Connection successful!')
      } else {
        setSyncStatus('error')
        alert('Connection failed. Please check your credentials.')
      }
    } catch (error) {
      setSyncStatus('error')
      alert('Connection failed. Please check your domain and network.')
    } finally {
      setIsLoading(false)
    }
  }

  const exportToJira = async () => {
    if (!config.domain || !config.username || !config.apiToken || !config.projectKey) {
      alert('Please configure Jira connection and project key')
      return
    }

    setIsLoading(true)
    try {
      for (const epic of project.epics) {
        // Create epic
        const epicData = {
          fields: {
            project: { key: config.projectKey },
            summary: epic.title,
            description: epic.user_stories.map(s => `- ${s.title}`).join('\n'),
            issuetype: { name: 'Epic' },
            priority: { name: 'Medium' }
          }
        }

        const epicResponse = await fetch(`https://${config.domain}.atlassian.net/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${config.username}:${config.apiToken}`)}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(epicData)
        })

        if (epicResponse.ok) {
          const epicResult = await epicResponse.json()
          const epicKey = epicResult.key

          // Create user stories
          for (const story of epic.user_stories) {
            const storyData = {
              fields: {
                project: { key: config.projectKey },
                summary: story.title,
                description: `${story.description}\n\n**Acceptance Criteria:**\n${story.acceptance_criteria.map(c => `- ${c}`).join('\n')}\n\n**Edge Cases:**\n${story.edge_cases.map(e => `- ${e}`).join('\n')}`,
                issuetype: { name: 'Story' },
                priority: { name: story.optional_fields?.priority || 'Medium' },
                customfield_10014: epicKey // Epic link field (may vary by Jira instance)
              }
            }

            await fetch(`https://${config.domain}.atlassian.net/rest/api/3/issue`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${config.username}:${config.apiToken}`)}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(storyData)
            })
          }
        }
      }

      setSyncStatus('success')
      alert('Successfully exported to Jira!')
    } catch (error) {
      setSyncStatus('error')
      alert('Export failed. Please check your permissions and configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  const importFromJira = async () => {
    if (!config.domain || !config.username || !config.apiToken || !config.projectKey) {
      alert('Please configure Jira connection and project key')
      return
    }

    setIsLoading(true)
    try {
      // Get all issues from the project
      const response = await fetch(
        `https://${config.domain}.atlassian.net/rest/api/3/search?jql=project=${config.projectKey}&fields=summary,description,status,assignee,customfield_10014,customfield_10002`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${config.username}:${config.apiToken}`)}`,
            'Accept': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const stories: JiraStory[] = data.issues.map((issue: any) => ({
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description || '',
          status: issue.fields.status.name,
          storyPoints: issue.fields.customfield_10002, // Story points field
          assignee: issue.fields.assignee?.displayName,
          epicKey: issue.fields.customfield_10014, // Epic link field
          url: `https://${config.domain}.atlassian.net/browse/${issue.key}`
        }))

        setJiraStories(stories)
        setSyncStatus('success')
      }
    } catch (error) {
      setSyncStatus('error')
      alert('Import failed. Please check your permissions.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'to do':
      case 'backlog':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'to do':
      case 'backlog':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Jira Integration
          </CardTitle>
          <CardDescription>
            Connect to Jira to export stories and sync project status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="export">Export to Jira</TabsTrigger>
              <TabsTrigger value="import">Import from Jira</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain">Jira Domain</Label>
                  <Input
                    id="domain"
                    placeholder="your-company"
                    value={config.domain}
                    onChange={(e) => saveConfig({ ...config, domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The part before .atlassian.net
                  </p>
                </div>
                <div>
                  <Label htmlFor="projectKey">Project Key</Label>
                  <Input
                    id="projectKey"
                    placeholder="PROJ"
                    value={config.projectKey}
                    onChange={(e) => saveConfig({ ...config, projectKey: e.target.value.toUpperCase() })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Jira project key (e.g., PROJ)
                  </p>
                </div>
                <div>
                  <Label htmlFor="username">Username/Email</Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="your.email@company.com"
                    value={config.username}
                    onChange={(e) => saveConfig({ ...config, username: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apiToken">API Token</Label>
                  <Input
                    id="apiToken"
                    type="password"
                    placeholder="Your Jira API token"
                    value={config.apiToken}
                    onChange={(e) => saveConfig({ ...config, apiToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Create at: {config.domain ? `https://${config.domain}.atlassian.net/login` : 'your Jira settings'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testConnection} disabled={isLoading} variant="outline">
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                  Test Connection
                </Button>
                {syncStatus === 'success' && (
                  <Alert className="flex-1">
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>Connection successful!</AlertDescription>
                  </Alert>
                )}
                {syncStatus === 'error' && (
                  <Alert className="flex-1 border-red-200 bg-red-50">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-red-700">Connection failed</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Project to Jira</h3>
                <p className="text-sm text-muted-foreground">
                  Export {project.epics.length} epics and {project.epics.reduce((acc, e) => acc + e.user_stories.length, 0)} stories to Jira
                </p>
              </div>

              <Button 
                onClick={exportToJira} 
                disabled={isLoading || !config.domain || !config.username || !config.apiToken}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export to Jira
              </Button>

              {syncStatus === 'success' && activeTab === 'export' && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>Successfully exported to Jira!</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Import Stories from Jira</h3>
                <p className="text-sm text-muted-foreground">
                  Sync existing stories and their status from Jira
                </p>
              </div>

              <Button 
                onClick={importFromJira} 
                disabled={isLoading || !config.domain || !config.username || !config.apiToken}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Import from Jira
              </Button>

              {jiraStories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Imported Stories ({jiraStories.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jiraStories.map((story) => (
                      <div key={story.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(story.status)}
                          <div>
                            <div className="font-medium text-sm">{story.summary}</div>
                            <div className="text-xs text-muted-foreground">{story.key}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(story.status)}>
                            {story.status}
                          </Badge>
                          {story.storyPoints && (
                            <Badge variant="outline">{story.storyPoints} SP</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
