"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Monitor, 
  Cpu, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  ArrowRight,
  Github,
  ExternalLink
} from "lucide-react"

export default function DesktopPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Check if Ollama is available
    const checkOllama = async () => {
      // Only probe local Ollama when running in a local/dev environment
      if (typeof window === 'undefined') return
      const host = window.location.hostname
      if (host !== 'localhost' && host !== '127.0.0.1') {
        setOllamaStatus('unavailable')
        return
      }

      try {
        const response = await fetch('http://localhost:11434/api/tags', {
          signal: AbortSignal.timeout(3000)
        })
        if (response.ok) {
          setOllamaStatus('available')
        } else {
          setOllamaStatus('unavailable')
        }
      } catch (error) {
        setOllamaStatus('unavailable')
      }
    }
    
    checkOllama()
  }, [])

  const downloadDesktopVersion = () => {
    // In a real implementation, this would link to actual downloads
    window.open('https://github.com/smello/desktop/releases', '_blank')
  }

  const getDownloadButton = () => {
    if (!isOnline) {
      return (
        <Button disabled className="w-full">
          <WifiOff className="w-4 h-4 mr-2" />
          Offline - Download Unavailable
        </Button>
      )
    }

    if (ollamaStatus === 'checking') {
      return (
        <Button disabled className="w-full">
          <Cpu className="w-4 h-4 mr-2 animate-pulse" />
          Checking Ollama...
        </Button>
      )
    }

    if (ollamaStatus === 'available') {
      return (
        <Button onClick={downloadDesktopVersion} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download Desktop Version (Ollama Ready)
          <CheckCircle className="w-4 h-4 ml-2" />
        </Button>
      )
    }

    return (
      <Button onClick={downloadDesktopVersion} className="w-full" variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Download Desktop Version
        <AlertCircle className="w-4 h-4 ml-2" />
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Monitor className="w-12 h-12 text-accent mr-3" />
              <h1 className="text-4xl font-bold">SMELLO Desktop</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-4">
              Use SMELLO offline with local AI models via Ollama
            </p>
            <Badge variant="secondary" className="mb-6">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Desktop Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Privacy & Offline Features
                </CardTitle>
                <CardDescription>
                  Complete privacy with local AI processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">100% Offline Operation</h4>
                      <p className="text-sm text-muted-foreground">Works without internet connection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Local AI Processing</h4>
                      <p className="text-sm text-muted-foreground">Your data never leaves your device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">No API Keys Needed</h4>
                      <p className="text-sm text-muted-foreground">Use free open-source models</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Unlimited Generations</h4>
                      <p className="text-sm text-muted-foreground">No usage limits or subscriptions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ollama Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-accent" />
                  Ollama Integration
                </CardTitle>
                <CardDescription>
                  Local AI model support for offline generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ollama Status:</span>
                    <Badge variant={ollamaStatus === 'available' ? 'default' : ollamaStatus === 'checking' ? 'secondary' : 'destructive'}>
                      {ollamaStatus === 'available' && 'Available'}
                      {ollamaStatus === 'checking' && 'Checking...'}
                      {ollamaStatus === 'unavailable' && 'Not Installed'}
                    </Badge>
                  </div>
                  
                  {ollamaStatus === 'unavailable' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">Ollama not detected</p>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">
                            Install Ollama first to use local AI models:
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => window.open('https://ollama.ai/download', '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Download Ollama
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {ollamaStatus === 'available' && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-900 dark:text-green-100">Ollama ready!</p>
                          <p className="text-green-700 dark:text-green-300 mt-1">
                            You can use local models like Llama3, Mistral, and more.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Supported Models:</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">Llama 3</Badge>
                      <Badge variant="outline">Mistral</Badge>
                      <Badge variant="outline">Code Llama</Badge>
                      <Badge variant="outline">Phi-3</Badge>
                      <Badge variant="outline">Gemma</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                Get SMELLO Desktop
              </CardTitle>
              <CardDescription>
                Download the desktop application for offline use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h4 className="font-medium">Windows</h4>
                  <p className="text-sm text-muted-foreground">Windows 10/11</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h4 className="font-medium">macOS</h4>
                  <p className="text-sm text-muted-foreground">macOS 11+</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h4 className="font-medium">Linux</h4>
                  <p className="text-sm text-muted-foreground">Ubuntu 20.04+</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {getDownloadButton()}
                
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={() => window.open('https://github.com/smello/desktop', '_blank')}>
                    <Github className="w-4 h-4 mr-1" />
                    View Source
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open('https://docs.smello.ai/desktop', '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Why Choose Desktop Version?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">For Privacy-Conscious Teams</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep your product requirements and intellectual property completely private with local processing.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">For Remote Teams</h4>
                  <p className="text-sm text-muted-foreground">
                    Work reliably without internet dependency, perfect for field work or secure environments.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">For Cost-Conscious Users</h4>
                  <p className="text-sm text-muted-foreground">
                    No API costs or subscription fees - use your own hardware for unlimited AI generation.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">For Open Source Enthusiasts</h4>
                  <p className="text-sm text-muted-foreground">
                    Support and contribute to open-source AI models while maintaining full control.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
