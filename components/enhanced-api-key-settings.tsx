"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Key, Eye, EyeOff, CheckCircle, XCircle, Settings } from "lucide-react"

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
    </div>
  )
}
