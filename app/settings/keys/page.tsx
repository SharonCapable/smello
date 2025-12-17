"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeyManager } from '@/lib/api-key-manager'
import { ApiKeySetup } from '@/components/api-key-setup'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

function maskKey(k?: string) {
  if (!k) return 'Not set'
  if (k.length <= 8) return k.replace(/./g, '*')
  return `${k.slice(0, 4)}...${k.slice(-4)}`
}

export default function KeysSettingsPage() {
  const { data: session, status } = useSession()
  const [keys, setKeys] = useState<{ geminiKey?: string; claudeKey?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [initialKey, setInitialKey] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  async function load() {
    setLoading(true)
    try {
      // try server-side keys first
      const res = await fetch('/api/keys')
      if (res.ok) {
        const data = await res.json()
        setKeys(data)
        // merge to local storage as well
        try { await ApiKeyManager.loadServerKeys() } catch { }
        setLoading(false)
        return
      }
    } catch (e) {
      // ignore
    }

    // fallback to local
    setKeys(ApiKeyManager.getApiKeys())
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

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
    <div className="p-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Saved API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Gemini</div>
            <div className="font-mono">{maskKey(keys?.geminiKey)}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Anthropic</div>
            <div className="font-mono">{maskKey(keys?.claudeKey)}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={load} disabled={loading}>Refresh</Button>
            <Button onClick={handleUpdate} disabled={loading}>Update</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={loading || status !== 'authenticated'}>
              Remove from account
            </Button>
          </div>
        </CardContent>
      </Card>
      <ApiKeySetup isOpen={showSetup} onApiKeySet={() => { setShowSetup(false); load() }} onClose={() => setShowSetup(false)} initialKey={initialKey} />
    </div>
  )
}
