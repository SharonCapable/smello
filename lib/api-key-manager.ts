// API Key management for local development with default API key support
export interface UsageStats {
  epicsGenerated: number
  userStoriesGenerated: number
  lastReset: string
}

export interface ApiKeys {
  gemini?: string
  anthropic?: string
}

interface EnhancedApiKeyConfig {
  provider: string
  key: string
  isValid: boolean
  lastValidated?: string
}

export class ApiKeyManager {
  private static readonly STORAGE_KEY = "user-story-generator-api-keys"
  private static readonly ENHANCED_STORAGE_KEY = "smello-api-keys"
  private static readonly USAGE_KEY = "smello-usage-stats"
  private static readonly DEFAULT_GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  private static readonly DEFAULT_CLAUDE_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || ""
  private static readonly MAX_FREE_EPICS = 3
  private static readonly MAX_FREE_STORIES = 3

  static getApiKeys(): ApiKeys {
    if (typeof window === "undefined") return {}

    // Try to get from enhanced settings first
    const enhancedStored = localStorage.getItem(this.ENHANCED_STORAGE_KEY)
    if (enhancedStored) {
      try {
        const configs = JSON.parse(enhancedStored) as EnhancedApiKeyConfig[]
        const keys: ApiKeys = {}
        configs.forEach(c => {
          if (c.provider === 'google') keys.gemini = c.key // Enhanced settings uses 'google' for Gemini
          if (c.provider === 'anthropic') keys.anthropic = c.key
        })
        return keys
      } catch (e) {
        console.error("Error parsing enhanced API keys", e)
      }
    }

    // Fallback to old storage
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return {}

    try {
      return JSON.parse(stored) as ApiKeys
    } catch {
      return {}
    }
  }

  static getApiKey(provider: 'gemini' | 'anthropic'): string | null {
    // Check if user has set their own API key first
    const userKeys = this.getApiKeys()
    if (userKeys[provider]) return userKeys[provider]

    // Fall back to default API key
    if (provider === 'gemini') return this.DEFAULT_GEMINI_KEY
    if (provider === 'anthropic') return this.DEFAULT_CLAUDE_KEY

    return null
  }

  static hasApiKey(provider?: 'gemini' | 'anthropic'): boolean {
    // To avoid blocking client flows when no client-side key is configured,
    // we return permissive true so the client will call the server `/api/generate`
    // which will select the appropriate key (env / oauth / stored) and enforce
    // per-user quotas. This prevents many early-returns in the UI while keeping
    // server-side policy enforcement intact.
    return true
  }

  // ... keep usage stats methods as is ...
  static getUsageStats(): UsageStats {
    if (typeof window === "undefined") {
      return { epicsGenerated: 0, userStoriesGenerated: 0, lastReset: new Date().toISOString() }
    }

    const stored = localStorage.getItem(this.USAGE_KEY)
    if (!stored) {
      return { epicsGenerated: 0, userStoriesGenerated: 0, lastReset: new Date().toISOString() }
    }

    try {
      return JSON.parse(stored) as UsageStats
    } catch {
      return { epicsGenerated: 0, userStoriesGenerated: 0, lastReset: new Date().toISOString() }
    }
  }

  static updateUsageStats(epicsCount: number, storiesCount: number): void {
    if (typeof window === "undefined") return

    const current = this.getUsageStats()
    const updated: UsageStats = {
      epicsGenerated: current.epicsGenerated + epicsCount,
      userStoriesGenerated: current.userStoriesGenerated + storiesCount,
      lastReset: current.lastReset
    }

    localStorage.setItem(this.USAGE_KEY, JSON.stringify(updated))
  }

  static isWithinFreeLimits(): boolean {
    const stats = this.getUsageStats()
    return stats.epicsGenerated < this.MAX_FREE_EPICS && stats.userStoriesGenerated < this.MAX_FREE_STORIES
  }

  static getRemainingLimits(): { epics: number; stories: number } {
    const stats = this.getUsageStats()
    return {
      epics: Math.max(0, this.MAX_FREE_EPICS - stats.epicsGenerated),
      stories: Math.max(0, this.MAX_FREE_STORIES - stats.userStoriesGenerated)
    }
  }

  static isUsingDefaultKey(provider: 'gemini' | 'anthropic'): boolean {
    const userKeys = this.getApiKeys()
    return !userKeys[provider]
  }

  static resetUsage(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.USAGE_KEY)
  }
  static setApiKey(key: string, provider: 'gemini' | 'anthropic' = 'gemini'): void {
    if (typeof window === "undefined") return

    // Update enhanced storage
    const enhancedStored = localStorage.getItem(this.ENHANCED_STORAGE_KEY)
    let configs: EnhancedApiKeyConfig[] = []
    if (enhancedStored) {
      try {
        configs = JSON.parse(enhancedStored)
      } catch { }
    }

    const providerId = provider === 'gemini' ? 'google' : 'anthropic'
    const existingIndex = configs.findIndex(c => c.provider === providerId)

    if (existingIndex >= 0) {
      configs[existingIndex] = { ...configs[existingIndex], key, isValid: true, lastValidated: new Date().toISOString() }
    } else {
      configs.push({ provider: providerId, key, isValid: true, lastValidated: new Date().toISOString() })
    }

    localStorage.setItem(this.ENHANCED_STORAGE_KEY, JSON.stringify(configs))
  }

  static removeApiKey(provider: 'gemini' | 'anthropic' = 'gemini'): void {
    if (typeof window === "undefined") return

    const enhancedStored = localStorage.getItem(this.ENHANCED_STORAGE_KEY)
    if (!enhancedStored) return

    let configs: EnhancedApiKeyConfig[] = []
    try {
      configs = JSON.parse(enhancedStored)
    } catch { }

    const providerId = provider === 'gemini' ? 'google' : 'anthropic'
    configs = configs.filter(c => c.provider !== providerId)

    localStorage.setItem(this.ENHANCED_STORAGE_KEY, JSON.stringify(configs))
  }

  // Fetch stored keys from server (if signed in) and merge into local enhanced storage
  static async loadServerKeys(token?: string): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/keys', { headers })
      if (!res.ok) return
      const data = await res.json()
      const enhancedStored = localStorage.getItem(this.ENHANCED_STORAGE_KEY)
      let configs: EnhancedApiKeyConfig[] = []
      if (enhancedStored) {
        try { configs = JSON.parse(enhancedStored) } catch { configs = [] }
      }

      if (data.geminiKey) {
        const idx = configs.findIndex(c => c.provider === 'google')
        if (idx >= 0) configs[idx] = { ...configs[idx], key: data.geminiKey, isValid: true }
        else configs.push({ provider: 'google', key: data.geminiKey, isValid: true, lastValidated: new Date().toISOString() })
      }
      if (data.claudeKey) {
        const idx = configs.findIndex(c => c.provider === 'anthropic')
        if (idx >= 0) configs[idx] = { ...configs[idx], key: data.claudeKey, isValid: true }
        else configs.push({ provider: 'anthropic', key: data.claudeKey, isValid: true, lastValidated: new Date().toISOString() })
      }

      if (configs.length > 0) localStorage.setItem(this.ENHANCED_STORAGE_KEY, JSON.stringify(configs))
    } catch (e) {
      // ignore
    }
  }

  // Save keys to server (authenticated). Returns true on success.
  static async saveServerKeys(keys: { geminiKey?: string; claudeKey?: string }, token?: string): Promise<boolean> {
    if (typeof window === 'undefined') return false
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/keys', { method: 'POST', headers, body: JSON.stringify(keys) })
      if (!res.ok) return false
      // Merge into local storage as well
      if (keys.geminiKey) this.setApiKey(keys.geminiKey, 'gemini')
      if (keys.claudeKey) this.setApiKey(keys.claudeKey, 'anthropic')
      return true
    } catch (e) {
      return false
    }
  }
}
