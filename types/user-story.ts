export interface UserStory {
  id: string
  title: string // Added title field for better organization
  description: string
  acceptance_criteria: string[]
  edge_cases: string[]
  validations: string[]
  status?: "Not Started" | "In Progress" | "In QA" | "Done" | "Blocked"
  jira_key?: string
  story_points?: number
  assignee?: string
  optional_fields?: {
    priority?: "Low" | "Medium" | "High" | "Critical"
    effort_estimate?: string
    dependencies?: string[]
    risk_notes?: string
    custom_fields?: Record<string, string>
  }
}

export interface Epic {
  id: string
  title: string
  user_stories: UserStory[]
}

export interface Product {
  name: string
  description: string
  sector?: string
  target_audience?: string
  key_features?: string[]
  business_goals?: string[]
  vision?: string
}

export interface ProjectData {
  product: Product
  epics: Epic[]
  created_at: string
  updated_at: string
}

export type InputMode = "ai" | "manual"
