import type { Epic, UserStory, Product } from "@/types/user-story"
import { ApiKeyManager } from "./api-key-manager"
import { GlobalUsageCounter } from "./global-usage-counter"

export interface GenerationOptions {
  includePersonas?: boolean
  includeBusinessValue?: boolean
  includeTestScenarios?: boolean
  includeDependencies?: boolean
  provider?: 'gemini' | 'anthropic'
}

async function generateTextWithGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    throw new Error("No content received from Gemini")
  }

  return content
}

async function generateTextWithClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: "anthropic",
      apiKey,
      prompt,
      model: "claude-3-haiku-20240307"
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Claude API Error: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return data.text
}

async function generateText(prompt: string, provider: 'gemini' | 'anthropic' = 'gemini'): Promise<string> {
  const apiKey = ApiKeyManager.getApiKey(provider)
  if (!apiKey) {
    const providerName = provider === 'gemini' ? 'Gemini' : 'Claude'
    throw new Error(`No ${providerName} API key configured. Please set your ${providerName} API key in settings.`)
  }

  if (provider === 'gemini') {
    return generateTextWithGemini(prompt, apiKey)
  } else {
    return generateTextWithClaude(prompt, apiKey)
  }
}

export async function generateEpicsFromProduct(product: Product, options: GenerationOptions = {}): Promise<Epic[]> {
  const provider = options.provider || 'gemini'
  const isUsingDefaultKey = ApiKeyManager.isUsingDefaultKey(provider)

  // Check global usage counter if using default key
  if (isUsingDefaultKey) {
    if (!GlobalUsageCounter.hasRemainingOperations()) {
      throw new Error("Free tier limit reached! You've used all 6 free AI operations. Please add your own API key in Settings to continue.")
    }
  }



  const prompt = `
You are a product management expert. Generate 3-5 epics for this product:

Product: ${product.name}
Description: ${product.description}
${product.sector ? `Sector: ${product.sector}` : ""}
${product.target_audience ? `Target Audience: ${product.target_audience}` : ""}
${product.key_features ? `Key Features: ${product.key_features.join(", ")}` : ""}
${product.business_goals ? `Business Goals: ${product.business_goals.join(", ")}` : ""}

Generate epics that are:
- High-level features or capabilities
- Focused on user value
- Appropriate for the ${product.sector || "general"} sector

Return ONLY a JSON array of epics with this exact structure:
[
  {
    "id": "epic-1",
    "title": "Epic Title",
    "user_stories": []
  }
]
`

  try {
    const text = await generateText(prompt, provider)

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const epics = JSON.parse(cleanedText) as Epic[]

    const processedEpics = epics.map((epic) => ({
      ...epic,
      id: `epic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_stories: [],
    }))

    // Update usage stats if using default key
    if (isUsingDefaultKey) {
      ApiKeyManager.updateUsageStats(processedEpics.length, 0)
      GlobalUsageCounter.recordOperation('epic-generation', undefined, `Generated ${processedEpics.length} epics`)
    }

    return processedEpics
  } catch (error) {
    console.error("Error generating epics:", error)
    const providerName = provider === 'gemini' ? 'Gemini' : 'Claude'
    throw new Error(`Failed to generate epics with ${providerName}. ${error instanceof Error ? error.message : ''}`)
  }
}

export async function generateUserStoriesForEpic(
  epic: Epic,
  product: Product,
  options: GenerationOptions = {},
): Promise<UserStory[]> {
  const provider = options.provider || 'gemini'
  const isUsingDefaultKey = ApiKeyManager.isUsingDefaultKey(provider)

  // Check limits if using default key
  if (isUsingDefaultKey) {
    const remaining = ApiKeyManager.getRemainingLimits()
    if (remaining.stories <= 0) {
      throw new Error("Free limit reached! You've generated 3 user stories. Please add your own API key to continue generating unlimited epics and user stories.")
    }
  }

  const optionsText = Object.entries(options)
    .filter(([_, value]) => value)
    .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase())
    .join(", ")

  const prompt = `
You are a product management expert. Generate 3-5 user stories for this epic:

Epic: ${epic.title}
Product: ${product.name} (${product.description})
${product.sector ? `Sector: ${product.sector}` : ""}
${optionsText ? `Include: ${optionsText}` : ""}

Generate user stories that are:
- Specific and actionable
- Follow "As a [user], I want [goal] so that [benefit]" format
- Include comprehensive acceptance criteria (3-5 items)
- Include edge cases (2-3 items)
- Include validations (2-3 items)
- Appropriate for the ${product.sector || "general"} sector

IMPORTANT: Each story must have a clear, descriptive title that summarizes the functionality.

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "story-1",
    "title": "Brief Story Title (e.g., 'User Registration', 'Password Reset', 'Profile Update')",
    "description": "As a [user], I want [goal] so that [benefit]",
    "acceptance_criteria": ["criteria 1", "criteria 2", "criteria 3"],
    "edge_cases": ["edge case 1", "edge case 2"],
    "validations": ["validation 1", "validation 2"],
    "optional_fields": {
      "priority": "Medium",
      "effort_estimate": "3 story points"
    }
  }
]
`

  try {
    const text = await generateText(prompt, provider)

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const stories = JSON.parse(cleanedText) as UserStory[]

    const processedStories = stories.map((story) => ({
      ...story,
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_stories: [],
    }))

    // Update usage stats if using default key
    if (isUsingDefaultKey) {
      ApiKeyManager.updateUsageStats(0, processedStories.length)
    }

    return processedStories
  } catch (error) {
    console.error("Error generating user stories:", error)
    const providerName = provider === 'gemini' ? 'Gemini' : 'Claude'
    throw new Error(`Failed to generate user stories with ${providerName}. ${error instanceof Error ? error.message : ''}`)
  }
}

export async function generateAdditionalUserStories(
  epic: Epic,
  product: Product,
  existingStories: UserStory[],
  count = 2,
  options: GenerationOptions = {}
): Promise<UserStory[]> {
  const provider = options.provider || 'gemini'

  const existingDescriptions = existingStories.map((s) => s.description).join("\n- ")

  const prompt = `
Generate ${count} additional user stories for this epic, avoiding duplication:

Epic: ${epic.title}
Product: ${product.name} (${product.description})

Existing stories to avoid duplicating:
- ${existingDescriptions}

Generate NEW user stories that complement the existing ones but don't duplicate functionality.

IMPORTANT: Each story must have a clear, descriptive title that summarizes the functionality.

Return ONLY a JSON array with the same structure as before, including descriptive titles.
`

  try {
    const text = await generateText(prompt, provider)

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
    const stories = JSON.parse(cleanedText) as UserStory[]

    return stories.map((story) => ({
      ...story,
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_stories: [],
    }))
  } catch (error) {
    console.error("Error generating additional user stories:", error)
    throw new Error("Failed to generate additional user stories. Please check your API key and try again.")
  }
}
