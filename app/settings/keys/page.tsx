"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiKeyManager } from '@/lib/api-key-manager'
import { ApiKeySetup } from '@/components/api-key-setup'
import { AITierStatus } from '@/components/ai-tier-status'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { Key, Trash2, RefreshCw, Settings, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

function maskKey(k?: string) {
  if (!k) return 'Not set'
  if (k.length <= 8) return k.replace(/./g, '*')
  return `${k.slice(0, 4)}...${k.slice(-4)}`
}

export default function KeysSettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const [keys, setKeys] = useState<{ geminiKey?: string; claudeKey?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [initialKey, setInitialKey] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  async function load() {
    if (!isLoaded) return
    setLoading(true)
    try {
      // try server-side keys first
      const res = await fetch('/api/keys')
      if (res.ok) {
        const data: { geminiKey?: string; claudeKey?: string } = await res.json()
        setKeys(data)
        // merge to local storage as well
        try { await ApiKeyManager.loadServerKeys() } catch { }
        setLoading(false)
        return
      }
    } catch (e) {
      // ignore
    }

    // fallback to local - map the ApiKeys format to our state format
    const localKeys = ApiKeyManager.getApiKeys()
    setKeys({
      geminiKey: localKeys.gemini,
      claudeKey: localKeys.anthropic
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [isLoaded, isSignedIn])

  const handleRemove = async () => {
    if (!confirm('Remove stored API keys from your account?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/keys', { method: 'DELETE' })
      if (res.ok) {
        // clear local copies too
        ApiKeyManager.removeApiKey('gemini')
        ApiKeyManager.removeApiKey('anthropic')
        setKeys(null)
        toast({ title: 'Removed', description: 'Stored API keys removed from your account' })
      } else {
        toast({ title: 'Remove failed', description: 'Failed to remove keys', variant: 'destructive' })
      }
    } catch (e) {
      alert('Failed to remove keys')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    setInitialKey(keys?.geminiKey)
    setShowSetup(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API Key Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your AI access and API keys
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* AI Tier Status - Visual Overview */}
        <AITierStatus />

        {/* API Keys Management */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Saved API Keys
            </CardTitle>
            <CardDescription>
              Your stored API keys for AI generation. Keys are encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Keys Display */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${keys?.geminiKey
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-muted/20 border-border'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Gemini API Key</span>
                  {keys?.geminiKey && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="font-mono text-sm text-muted-foreground">
                  {maskKey(keys?.geminiKey)}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${keys?.claudeKey
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-muted/20 border-border'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Claude API Key</span>
                  {keys?.claudeKey && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="font-mono text-sm text-muted-foreground">
                  {maskKey(keys?.claudeKey)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={load}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                Add / Update Keys
              </Button>

              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={loading || !isSignedIn || (!keys?.geminiKey && !keys?.claudeKey)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Keys
              </Button>
            </div>

            {/* Info */}
            <div className="p-4 bg-muted/20 rounded-xl text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Getting API Keys:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <strong>Gemini:</strong>{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Google AI Studio → Create API Key
                  </a>
                </li>
                <li>
                  <strong>Claude:</strong>{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Anthropic Console → API Keys
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <ApiKeySetup
        isOpen={showSetup}
        onApiKeySet={() => { setShowSetup(false); load() }}
        onClose={() => setShowSetup(false)}
        initialKey={initialKey}
      />
    </div>
  )
}
