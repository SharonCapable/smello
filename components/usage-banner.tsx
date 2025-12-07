"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiKeyManager } from "@/lib/api-key-manager"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { AlertCircle, Zap, Crown, Key } from "lucide-react"

interface UsageBannerProps {
  onUpgradeClick?: () => void
}

export function UsageBanner({ onUpgradeClick }: UsageBannerProps) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [isUsingDefaultKey, setIsUsingDefaultKey] = useState(false)

  useEffect(() => {
    const updateUsage = () => {
      setRemaining(GlobalUsageCounter.getRemainingOperations())
      // We check if using default key for ANY provider, or just assume if no custom keys set
      setIsUsingDefaultKey(ApiKeyManager.isUsingDefaultKey('gemini') && ApiKeyManager.isUsingDefaultKey('anthropic'))
    }

    updateUsage()
    // Update every second to reflect real-time usage
    const interval = setInterval(updateUsage, 1000)
    return () => clearInterval(interval)
  }, [])

  if (remaining === null) return null

  // Don't show banner if user has their own API key
  if (!isUsingDefaultKey) return null

  const isLimitReached = remaining === 0
  const used = 6 - remaining

  return (
    <Card className={`${isLimitReached ? 'bg-destructive/10 border-destructive/20' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'} mb-6`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${isLimitReached ? 'text-destructive' : 'text-blue-600 dark:text-blue-400'}`}>
            {isLimitReached ? <AlertCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold ${isLimitReached ? 'text-destructive' : 'text-blue-900 dark:text-blue-100'}`}>
                {isLimitReached ? 'Free Limit Reached' : 'Free Trial Mode'}
              </h3>
              <Badge variant={isLimitReached ? 'destructive' : 'secondary'} className="text-xs">
                {used}/6 Operations Used
              </Badge>
            </div>

            <div className="text-sm space-y-1 mb-3">
              <p className={isLimitReached ? 'text-destructive/80' : 'text-blue-800 dark:text-blue-200'}>
                {isLimitReached
                  ? "You've reached your free limit of 6 AI operations."
                  : `You have ${remaining} free AI operations remaining in this session.`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Add your own API key or sign in with Google for unlimited generation.
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${isLimitReached ? 'bg-destructive' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(100, (used / 6) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onUpgradeClick}
                className="flex items-center gap-2"
              >
                <Key className="h-3 w-3" />
                Add API Key
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
