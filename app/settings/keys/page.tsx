"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ApiKeyManager } from '@/lib/api-key-manager'
import { ApiKeySetup } from '@/components/api-key-setup'
import { AITierStatus } from '@/components/ai-tier-status'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from "@/hooks/use-auth"
import { Key, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'

function maskKey(k?: string) {
  if (!k) return 'Not set'
  if (k.length <= 8) return k.replace(/./g, '*')
  return `${k.slice(0, 4)}...${k.slice(-4)}`
}

export default function KeysSettingsPage() {
  const { user, isLoaded, isSignedIn } = useAuth()
  const [keys, setKeys] = useState<{ geminiKey?: string; claudeKey?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [initialKey, setInitialKey] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  async function load() {
    if (!isLoaded) return
    setLoading(true)

    // Try server-side keys if signed in
    if (user) {
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/keys', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data: { geminiKey?: string; claudeKey?: string } = await res.json()
          setKeys(data)
          // merge to local storage as well
          try { await ApiKeyManager.loadServerKeys(token) } catch { }
          setLoading(false)
          return
        }
      } catch (e) {
        // ignore
      }
    }

    // fallback to local - map the ApiKeys format to our state format
    const localKeys = ApiKeyManager.getApiKeys()
    setKeys({
      geminiKey: localKeys.gemini,
      claudeKey: localKeys.anthropic
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [isLoaded, isSignedIn, user])

  const handleRemove = async () => {
    if (!confirm('Remove stored API keys from your account?')) return
    setLoading(true)
    try {
      if (user) {
        const token = await user.getIdToken()
        const res = await fetch('/api/keys', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          // clear local copies too
          ApiKeyManager.removeApiKey('gemini')
          ApiKeyManager.removeApiKey('anthropic')
          setKeys(null)
          toast({ title: 'Removed', description: 'Stored API keys removed from your account' })
        } else {
          toast({ title: 'Remove failed', description: 'Failed to remove keys', variant: 'destructive' })
        }
      } else {
        toast({ title: 'Error', description: 'You must be signed in to remove server keys', variant: 'destructive' })
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
    <div className="w-full h-full p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-1">Manage external AI provider credentials.</p>
      </div>

      <div className="grid gap-8">
        {/* Visual Overview */}
        <AITierStatus />

        {/* Keys List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Saved Credentials
            </CardTitle>
            <CardDescription>
              Your API keys are encrypted and stored securely if you choose to sync them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border transition-colors ${keys?.geminiKey
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-muted/20 border-border hover:border-border/80'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Gemini</span>
                  {keys?.geminiKey && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                  {maskKey(keys?.geminiKey)}
                </div>
              </div>

              <div className={`p-4 rounded-xl border transition-colors ${keys?.claudeKey
                ? 'bg-green-500/5 border-green-500/30'
                : 'bg-muted/20 border-border hover:border-border/80'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Claude</span>
                  {keys?.claudeKey && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                  {maskKey(keys?.claudeKey)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleUpdate}
                disabled={loading}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                Configure Keys
              </Button>

              <Button
                variant="outline"
                onClick={load}
                disabled={loading}
                className="gap-2 ml-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="ghost"
                onClick={handleRemove}
                disabled={loading || !isSignedIn || (!keys?.geminiKey && !keys?.claudeKey)}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Blurb */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-muted-foreground">
          <div className="font-semibold text-foreground mb-1">Why enable custom keys?</div>
          <p>Adding your own keys bypasses shared usage limits and enables faster generation for power users.</p>
        </div>
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
