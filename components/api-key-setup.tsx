"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Key, Eye, EyeOff } from "lucide-react"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
// ...

export function ApiKeySetup({ isOpen, onApiKeySet, onClose, initialKey }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveToAccount, setSaveToAccount] = useState(true)
  const { user, isLoaded, isSignedIn } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    // Default save-to-account only when authenticated
    if (isLoaded) {
      setSaveToAccount(isSignedIn)
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (isOpen && initialKey) setApiKey(initialKey)
  }, [isOpen, initialKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'gemini', apiKey })
      })

      const data = await response.json()

      if (data.valid) {
        ApiKeyManager.setApiKey(apiKey, 'gemini')
        // Save to account only if user selected the option
        if (saveToAccount) {
          try {
            await ApiKeyManager.saveServerKeys({ geminiKey: apiKey })
            toast({ title: 'Saved', description: 'API key saved to your account' })
          } catch (e) {
            toast({ title: 'Saved locally', description: 'Key stored locally; account save failed' })
          }
        }

        onApiKeySet()
        setApiKey("")
      } else {
        toast({ title: 'Invalid key', description: data.error || 'Invalid API key. Please check and try again.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Validation failed', description: 'Failed to validate API key. Check your connection.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key Required
          </DialogTitle>
          <DialogDescription>Enter your Google Gemini API key to enable AI-powered features.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-3">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">How to get your API key:</p>
                <ol className="mt-1 list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Go to{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google AI Studio
                    </a>
                  </li>
                  <li>Create a new API key</li>
                  <li>Copy the key and paste it here</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" checked={saveToAccount} onChange={(e) => setSaveToAccount(e.target.checked)} className="mr-2" />
                <span>Save to account</span>
              </label>
              <Button type="submit" disabled={isLoading || !apiKey.trim()} className="flex-1">
                {isLoading ? "Validating..." : "Save API Key"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ApiKeyStatus() {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useState(() => {
    setHasApiKey(ApiKeyManager.hasApiKey())
  })

  const handleRemoveApiKey = () => {
    if (confirm("Are you sure you want to remove your API key? You will need to re-enter it to use AI features.")) {
      ApiKeyManager.removeApiKey()
      setHasApiKey(false)
    }
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Status
          </CardTitle>
          <CardDescription>Manage your OpenAI API key for AI generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <span className={`text-sm font-medium ${hasApiKey ? "text-green-600" : "text-red-600"}`}>
              {hasApiKey ? "Configured" : "Not Set"}
            </span>
          </div>

          <div className="flex gap-2">
            {hasApiKey ? (
              <>
                <Button variant="outline" onClick={() => setShowSetup(true)} className="flex-1">
                  Update Key
                </Button>
                <Button variant="destructive" onClick={handleRemoveApiKey} className="flex-1">
                  Remove Key
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowSetup(true)} className="w-full">
                Set API Key
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ApiKeySetup
        isOpen={showSetup}
        onApiKeySet={() => {
          setHasApiKey(true)
          setShowSetup(false)
        }}
        onClose={() => setShowSetup(false)}
      />
    </>
  )
}
