"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Key, Eye, EyeOff, CheckCircle, XCircle, Settings, Trash2, RefreshCw, Download } from "lucide-react"
import { clearSmelloCache, clearOnboardingData, clearProjectData, fullReset, downloadDataBackup, getCacheStatus } from "@/lib/cache-utils"

interface ApiKeyConfig {
  provider: string
  key: string
  isValid: boolean
  lastValidated?: string
}

const API_PROVIDERS = [
  {
    id: 'google',
    name: 'Google AI',
    description: 'For Gemini models',
    keyPrefix: '',
    validationEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'For Claude models',
    keyPrefix: 'sk-ant-',
    validationEndpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
  }
]

export function EnhancedApiKeySettings() {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([])
  const [activeTab, setActiveTab] = useState('google')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [validating, setValidating] = useState<string | null>(null)

  useEffect(() => {
    // Load saved API keys
    const savedKeys = localStorage.getItem('smello-api-keys')
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys))
      } catch (e) {
        console.error('Failed to load API keys:', e)
      }
    }
  }, [])

  const saveApiKeys = (keys: ApiKeyConfig[]) => {
    localStorage.setItem('smello-api-keys', JSON.stringify(keys))
    setApiKeys(keys)
  }

  const validateApiKey = async (provider: string, apiKey: string) => {
    const providerConfig = API_PROVIDERS.find(p => p.id === provider)
    if (!providerConfig) return false

    setValidating(provider)

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, apiKey })
      })

      const data = await response.json()
      return data.valid
    } catch (error) {
      console.error('API key validation failed:', error)
      return false
    } finally {
      setValidating(null)
    }
  }

  const handleApiKeyChange = (provider: string, newKey: string) => {
    const existingKey = apiKeys.find(k => k.provider === provider)

    if (existingKey) {
      const updatedKeys = apiKeys.map(k =>
        k.provider === provider
          ? { ...k, key: newKey, isValid: false }
          : k
      )
      saveApiKeys(updatedKeys)
    } else {
      const newKeyConfig: ApiKeyConfig = {
        provider,
        key: newKey,
        isValid: false
      }
      saveApiKeys([...apiKeys, newKeyConfig])
    }
  }

  const handleValidateKey = async (provider: string) => {
    const keyConfig = apiKeys.find(k => k.provider === provider)
    if (!keyConfig || !keyConfig.key.trim()) return

    const isValid = await validateApiKey(provider, keyConfig.key)

    const updatedKeys = apiKeys.map(k =>
      k.provider === provider
        ? {
          ...k,
          isValid,
          lastValidated: new Date().toISOString()
        }
        : k
    )
    saveApiKeys(updatedKeys)

    // If valid, save to Firestore for server-side generation
    if (isValid) {
      try {
        const keyPayload: Record<string, string> = {}
        // Map provider id to Firestore key names
        if (provider === 'google') {
          keyPayload.geminiKey = keyConfig.key
        } else if (provider === 'anthropic') {
          keyPayload.claudeKey = keyConfig.key
        }

        const response = await fetch('/api/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(keyPayload)
        })

        if (response.ok) {
          console.log('API key saved to server successfully')
        } else {
          console.error('Failed to save API key to server')
        }
      } catch (error) {
        console.error('Error saving API key to server:', error)
      }
    }
  }

  const handleRemoveKey = (provider: string) => {
    const updatedKeys = apiKeys.filter(k => k.provider !== provider)
    saveApiKeys(updatedKeys)
  }

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Key Configuration
          </CardTitle>
          <CardDescription>
            Configure API keys for different AI providers. Only one provider needs to be configured at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              {API_PROVIDERS.map(provider => (
                <TabsTrigger key={provider.id} value={provider.id}>
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {API_PROVIDERS.map(provider => {
              const keyConfig = apiKeys.find(k => k.provider === provider.id)
              const isKeyVisible = showKeys[provider.id]
              const isValidatingKey = validating === provider.id

              return (
                <TabsContent key={provider.id} value={provider.id} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{provider.name} API Key</Label>
                      {keyConfig && (
                        <Badge variant={keyConfig.isValid ? "default" : "secondary"}>
                          {keyConfig.isValid ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Valid</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Not Validated</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={isKeyVisible ? "text" : "password"}
                        placeholder={`Enter ${provider.name} API key${provider.keyPrefix ? ` (starts with ${provider.keyPrefix})` : ''}`}
                        value={keyConfig?.key || ''}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => toggleKeyVisibility(provider.id)}
                      >
                        {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleValidateKey(provider.id)}
                      disabled={!keyConfig?.key.trim() || isValidatingKey}
                      variant="outline"
                      className="flex-1"
                    >
                      {isValidatingKey ? (
                        <>Validating...</>
                      ) : (
                        <>Validate Key</>
                      )}
                    </Button>

                    {keyConfig && (
                      <Button
                        onClick={() => handleRemoveKey(provider.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {provider.models.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Supported Models</Label>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map(model => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {keyConfig?.lastValidated && (
                    <p className="text-xs text-muted-foreground">
                      Last validated: {new Date(keyConfig.lastValidated).toLocaleString()}
                    </p>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {API_PROVIDERS.map(provider => {
              const keyConfig = apiKeys.find(k => k.provider === provider.id)
              return (
                <div key={provider.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {keyConfig ? (
                      <>
                        <Badge variant={keyConfig.isValid ? "default" : "secondary"}>
                          {keyConfig.isValid ? "Configured" : "Needs Validation"}
                        </Badge>
                        {keyConfig.key && (
                          <span className="text-xs text-muted-foreground">
                            {keyConfig.key.substring(0, 8)}...
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">Not Configured</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {apiKeys.some(k => k.isValid) && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ At least one API key is properly configured and validated
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Troubleshooting
          </CardTitle>
          <CardDescription>
            Clear cache and reset data if you're experiencing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Clear Cache</p>
                <p className="text-xs text-muted-foreground">Clear all cached data (keeps auth)</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all Smello cache? This will not sign you out.')) {
                    clearSmelloCache()
                    alert('✅ Cache cleared! Reload the page to see changes.')
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Reset Onboarding</p>
                <p className="text-xs text-muted-foreground">Clear onboarding data to start fresh</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Reset onboarding? You\'ll need to complete setup again.')) {
                    clearOnboardingData()
                    alert('✅ Onboarding reset! Reload to start fresh.')
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Clear Projects</p>
                <p className="text-xs text-muted-foreground">Remove all local project data</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('⚠️ Delete all local projects? This cannot be undone!')) {
                    clearProjectData()
                    alert('✅ Projects cleared!')
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Download Backup</p>
                <p className="text-xs text-muted-foreground">Export all data as JSON</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDataBackup}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div>
                <p className="font-medium text-sm text-blue-700 dark:text-blue-300">Migrate Legacy Data</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Recover projects from previous system</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-blue-200 dark:bg-blue-900 hover:bg-blue-300 dark:hover:bg-blue-800 text-blue-900 dark:text-blue-100"
                onClick={async () => {
                  if (confirm('This will attempt to find contracts/projects linked to your email from the old system. Continue?')) {
                    try {
                      const response = await fetch('/api/migrate-legacy');
                      const result = await response.json();
                      if (result.success) {
                        alert(`✅ Migration Complete! ${result.count} projects recovered.`)
                        window.location.reload()
                      } else {
                        alert('Migration completed but no new data found or partial success. Check console for details.')
                      }
                    } catch (e) {
                      alert('Migration failed. Please try again later.')
                      console.error(e)
                    }
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Migrate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <div>
                <p className="font-medium text-sm text-red-700 dark:text-red-300">Full Reset</p>
                <p className="text-xs text-red-600 dark:text-red-400">Clear everything and reload</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={fullReset}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> If you're experiencing routing issues or stuck screens, try "Clear Cache" first.
              This fixes most navigation problems without losing your data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
