"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Sparkles, Clock, AlertTriangle } from "lucide-react"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { useRouter } from "next/navigation"

export function UsageCounterBadge() {
    const [remaining, setRemaining] = useState(6)
    const [timeUntilReset, setTimeUntilReset] = useState("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        updateStats()

        // Update every minute
        const interval = setInterval(updateStats, 60000)
        return () => clearInterval(interval)
    }, [])

    const updateStats = () => {
        setRemaining(GlobalUsageCounter.getRemainingOperations())
        setTimeUntilReset(GlobalUsageCounter.getFormattedTimeUntilReset())
    }

    if (!mounted) return null

    const isLow = remaining <= 2
    const isOut = remaining === 0

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${isOut ? "text-destructive" : isLow ? "text-orange-500" : ""}`}
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{remaining}/6</span>
                    {isOut && <AlertTriangle className="w-4 h-4" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Free AI Operations</h4>
                        <p className="text-xs text-muted-foreground">
                            You have <span className="font-bold text-foreground">{remaining}</span> free AI operations remaining in this session.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Resets in {timeUntilReset}</span>
                    </div>

                    {isOut && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm font-medium text-destructive mb-2">
                                Free operations exhausted
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Add your own API key to continue using AI features.
                            </p>
                            <Button size="sm" className="w-full" asChild>
                                <a href="/settings/keys">Add API Key</a>
                            </Button>
                        </div>
                    )}

                    {isLow && !isOut && (
                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                                💡 <span className="font-medium">Tip:</span> Add your own API key in Settings for unlimited usage.
                            </p>
                        </div>
                    )}

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            Each AI operation (idea generation, epic creation, PRD section, etc.) counts as one operation.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
