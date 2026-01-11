"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogIn, LogOut, User, Settings, Sparkles, Zap, Brain, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { useRouter } from 'next/navigation'
import { setUserId } from "@/lib/storage-hybrid"

export function UserProfile() {
    const { user, isLoaded, isSignedIn, signOut, signInWithGoogle } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [remainingOperations, setRemainingOperations] = useState(0)
    const [activeProvider, setActiveProvider] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        updateStatus()

        // Load user profile from Firestore
        const loadUserProfile = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    const uid = user.uid
                    if (uid) {
                        // Set user ID for hybrid storage
                        setUserId(uid)

                        try {
                            const token = await user.getIdToken()
                            const res = await fetch(`/api/profile/${uid}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                            if (res.ok) {
                                const profile = await res.json()
                                if (profile) {
                                    if (profile.role) setUserRole(profile.role)
                                    if (profile.name) setUserName(profile.name)

                                    // Sync usage from server
                                    if (profile.usageCount !== undefined) {
                                        GlobalUsageCounter.syncFromServer(profile.usageCount, profile.usageLimit || 6)
                                        updateStatus()
                                    }
                                }
                            } else {
                                console.warn('Profile API responded with', res.status)
                            }
                        } catch (e) {
                            console.error('Failed to fetch profile from server API', e)
                        }
                    }
                } catch (error) {
                    console.error("Error loading user profile:", error)
                }
            }
        }

        loadUserProfile()

        const interval = setInterval(updateStatus, 5000) // Update every 5s
        return () => clearInterval(interval)
    }, [user, isLoaded, isSignedIn])

    const updateStatus = () => {
        // Usage
        setRemainingOperations(GlobalUsageCounter.getRemainingOperations())

        // API Keys
        if (typeof window !== 'undefined') {
            const savedKeys = localStorage.getItem('smello-api-keys')
            if (savedKeys) {
                try {
                    const keys = JSON.parse(savedKeys)
                    // Find first valid key
                    const validKey = keys.find((k: any) => k.isValid)
                    if (validKey) {
                        const providerName = validKey.provider === 'google' ? 'Google AI' :
                            validKey.provider === 'anthropic' ? 'Anthropic' :
                                validKey.provider
                        setActiveProvider(providerName)
                    } else {
                        setActiveProvider(null)
                    }
                } catch (e) {
                    console.error("Failed to parse API keys", e)
                }
            }
        }
    }

    // Display session user name by default, but override with onboarding name if available
    const displayUserName = userName || user?.displayName || "Guest"
    const displayUserEmail = user?.email || ""

    if (!isLoaded) {
        return (
            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="p-4 border-t border-border/50">
                <Button
                    onClick={() => signInWithGoogle()}
                    className="w-full justify-start gap-2"
                    variant="outline"
                >
                    <LogIn className="w-4 h-4" />
                    Sign In
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Sign in for unlimited AI access
                </p>
            </div>
        )
    }

    const userInitials = displayUserName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

    const isPro = !!activeProvider

    return (
        <div className="p-4 border-t border-border/50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2 hover:bg-muted/50">
                        <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage src={user?.photoURL || ""} alt={displayUserName} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="font-medium text-sm truncate">{displayUserName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Badge variant={isPro ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4 min-w-14 justify-center">
                                    {isPro ? (
                                        <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Pro
                                        </>
                                    ) : (
                                        <>Free Tier</>
                                    )}
                                </Badge>
                                {remainingOperations === 0 && !isPro && (
                                    <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                                        Trial Ended
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-64" sideOffset={10}>
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{displayUserName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {displayUserEmail}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* User Role & Professional Info (New) */}
                    {userRole && (
                        <>
                            <div className="px-2 py-2 text-xs space-y-2 bg-muted/30">
                                <div className="flex items-center text-muted-foreground">
                                    <Briefcase className="w-3 h-3 mr-2" />
                                    <span className="font-medium text-foreground">{userRole}</span>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* Status Section */}
                    <div className="px-2 py-2 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-muted-foreground">
                                <Zap className="w-3 h-3 mr-2" />
                                Usage
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={activeProvider ? "text-green-500 font-medium" : remainingOperations > 0 ? "text-orange-500 font-medium" : "text-red-500 font-medium"}>
                                    {activeProvider ? "Unlimited" : `${remainingOperations}/6 Remaining`}
                                </span>
                                {remainingOperations === 0 && !activeProvider && (
                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                        Falling back to Google Auth
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-muted-foreground">
                                <Brain className="w-3 h-3 mr-2" />
                                AI Provider
                            </div>
                            <span className="font-medium truncate max-w-[120px]">
                                {activeProvider || "System Default"}
                            </span>
                        </div>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/onboarding?mode=edit')}>
                        <User className="w-4 h-4 mr-2" />
                        Profile Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings/keys')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings & API Keys
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={async () => { await signOut() }}
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
