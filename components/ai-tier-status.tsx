"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Zap,
    Key,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    RefreshCw,
    Sparkles,
    Shield,
    ExternalLink,
    Gift,
    Crown
} from "lucide-react"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { TierStatus } from "@/app/api/tier-status/route"

interface TierCardProps {
    tier: 'free' | 'personal_key'
    title: string
    description: string
    icon: React.ReactNode
    isActive: boolean
    isAvailable: boolean
    children: React.ReactNode
    priority: number
}

function TierCard({ tier, title, description, icon, isActive, isAvailable, children, priority }: TierCardProps) {
    return (
        <Card className={`relative transition-all duration-300 ${isActive
            ? 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/50 shadow-lg shadow-accent/10'
            : isAvailable
                ? 'bg-card/50 border-border/50 hover:border-border'
                : 'bg-muted/20 border-border/30 opacity-60'
            }`}>
            {isActive && (
                <div className="absolute -top-2 -right-2">
                    <Badge className="bg-accent text-accent-foreground shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isActive
                        ? 'bg-accent text-accent-foreground'
                        : isAvailable
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-muted/50 text-muted-foreground/50'
                        }`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{title}</CardTitle>
                            <Badge variant="outline" className="text-[10px] font-bold">
                                Tier {priority}
                            </Badge>
                        </div>
                        <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {children}
            </CardContent>
        </Card>
    )
}

export function AITierStatus() {
    const [status, setStatus] = useState<TierStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/tier-status')
            if (response.ok) {
                const data = await response.json()
                setStatus(data)
            }
        } catch (error) {
            console.error('Failed to fetch tier status:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchStatus()
    }



    const handleResetUsage = async () => {
        if (!confirm('Reset your free trial usage? This is for testing purposes.')) return
        try {
            const response = await fetch('/api/usage-stats', { method: 'POST' })
            if (response.ok) {
                GlobalUsageCounter.reset()
                fetchStatus()
                // Force a reload to update all components if needed, or just let the interval pick it up
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to reset usage:', error)
        }
    }

    const getTimeUntilReset = () => {
        if (!status?.free.resetsAt) return null

        const resetTime = new Date(status.free.resetsAt)
        const now = new Date()
        const diff = resetTime.getTime() - now.getTime()

        if (diff <= 0) return 'Resetting soon...'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${hours}h ${minutes}m`
    }

    if (loading) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-24 bg-muted rounded" />
                        <div className="h-24 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!status) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Unable to load AI access status. Please try again later.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Simplified tier determination
    const hasPersonalKey = status.personalKey.hasGemini || status.personalKey.hasClaude
    const activeTier = hasPersonalKey ? 'personal_key' : (status.free.available ? 'free' : 'none')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        AI Access Status
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your AI generation access
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Status Banner */}
            {activeTier === 'none' ? (
                <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">
                            Free trial exhausted. Add your own API key for unlimited access.
                        </span>
                    </div>
                </div>
            ) : activeTier === 'personal_key' ? (
                <div className="p-4 rounded-xl border bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400">
                    <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">
                            Unlimited AI access with your personal API key! 🎉
                        </span>
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">
                            Using free trial — {status.free.remaining} of {status.free.limit} generations remaining today
                        </span>
                    </div>
                </div>
            )}

            {/* Tier Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Free Tier */}
                <TierCard
                    tier="free"
                    title="Free Trial"
                    description="Limited daily generations"
                    icon={<Zap className="w-5 h-5" />}
                    isActive={activeTier === 'free'}
                    isAvailable={status.free.limit > 0}
                    priority={1}
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Daily Usage</span>
                                <span className="font-bold">
                                    {status.free.used} / {status.free.limit} uses
                                </span>
                            </div>
                            <Progress
                                value={(status.free.used / status.free.limit) * 100}
                                className={`h-2 ${status.free.remaining === 0
                                    ? '[&>div]:bg-destructive'
                                    : status.free.remaining <= 2
                                        ? '[&>div]:bg-amber-500'
                                        : ''
                                    }`}
                            />
                        </div>

                        {status.free.remaining > 0 ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    Resets in: {getTimeUntilReset() || '24 hours'}
                                </div>
                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                                    {status.free.remaining} remaining
                                </Badge>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Daily limit reached. Resets in {getTimeUntilReset() || '...'}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={handleResetUsage}
                                >
                                    <RefreshCw className="w-3 h-3 mr-2" />
                                    Reset Usage (Testing)
                                </Button>
                            </div>
                        )}
                    </div>
                </TierCard>

                {/* Personal API Key Tier */}
                <TierCard
                    tier="personal_key"
                    title="Your API Keys"
                    description="Unlimited access with your own keys"
                    icon={<Crown className="w-5 h-5" />}
                    isActive={activeTier === 'personal_key'}
                    isAvailable={hasPersonalKey}
                    priority={2}
                >
                    <div className="space-y-3">
                        {/* Provider Status */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className={`p-2.5 rounded-lg border text-center ${status.personalKey.hasGemini
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-muted/30 border-border'
                                }`}>
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    {status.personalKey.hasGemini ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <Key className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-xs font-medium">Gemini</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {status.personalKey.hasGemini ? '✓ Ready' : 'Not set'}
                                </p>
                            </div>

                            <div className={`p-2.5 rounded-lg border text-center ${status.personalKey.hasClaude
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-muted/30 border-border'
                                }`}>
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    {status.personalKey.hasClaude ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                        <Key className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-xs font-medium">Claude</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    {status.personalKey.hasClaude ? '✓ Ready' : 'Not set'}
                                </p>
                            </div>
                        </div>

                        {hasPersonalKey ? (
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                Unlimited AI generations!
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Add at least one API key below for unlimited access
                            </p>
                        )}
                    </div>
                </TierCard>
            </div>

            {/* Get API Keys CTA */}
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-accent/20">
                            <Key className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">Get Free API Keys</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Both Gemini and Claude offer free tiers. Get your keys in under a minute:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-xs"
                                    onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Get Gemini Key (Free)
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-xs"
                                    onClick={() => window.open('https://console.anthropic.com/settings/keys', '_blank')}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Get Claude Key
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
