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
import { LogIn, LogOut, User, Settings, Sparkles, Zap, Brain, Briefcase, Sun, Moon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useClerk } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { setUserId } from "@/lib/storage-hybrid"
import { UsageCounterBadge } from "@/components/usage-counter-badge"
import { ModeSwitcher } from "@/components/mode-switcher"

export function AppHeader() {
    const { user, isLoaded, isSignedIn } = useUser()
    const { signOut, openSignIn } = useClerk()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [remainingOperations, setRemainingOperations] = useState(0)
    const [activeProvider, setActiveProvider] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [currentMode, setCurrentMode] = useState<'pm' | 'teams'>('pm')

    useEffect(() => {
        setMounted(true)
        updateStatus()

        // Load current mode from localStorage
        const onboardingData = localStorage.getItem("smello-user-onboarding")
        if (onboardingData) {
            try {
                const data = JSON.parse(onboardingData)
                setCurrentMode(data.usageType === "team" ? "teams" : "pm")
            } catch (e) {
                console.error("Failed to parse onboarding data", e)
            }
        }

        // Load user profile from Firestore
        // Load user profile from Firestore via Server API
        const loadUserProfile = async () => {
            if (isLoaded && isSignedIn && user) {
                try {
                    const uid = user.id
                    if (uid) {
                        // Set user ID for hybrid storage
                        setUserId(uid)

                        // Load profile from Firestore via API to avoid permission issues
                        const res = await fetch(`/api/profile/${uid}`)
                        if (res.ok) {
                            const profile = await res.json()
                            if (profile) {
                                if (profile.role) setUserRole(profile.role)
                                if (profile.name) setUserName(profile.name)

                                // Sync Usage Stats from Server if available
                                if (typeof profile.usageCount === 'number') {
                                    // We need to update GlobalUsageCounter to reflect truth
                                    // This is a bit hacky since GlobalUsageCounter is local-only logic usually.
                                    // But we can force it or just use state for display.
                                    // Ideally, GlobalUsageCounter should be refactored to support server sync.
                                    // For now, let's update the UI state directly here or via a dedicated sync method if existed.
                                    // Since we can't easily inject into the singleton logic without modifying it, 
                                    // let's assume GlobalUsageCounter catches up or we rely on this state 
                                    // for the badge? No, badge uses the singleton.
                                    // Let's at least update remaining operations state in this component to be accurate
                                    // even if the sidebar/others might be slightly off until they refresh.

                                    const limit = profile.usageLimit || 6
                                    const remaining = Math.max(0, limit - profile.usageCount)
                                    setRemainingOperations(remaining)

                                    // Be explicit: Update the singleton if possible or just rely on this component's state
                                    // The 'updateStatus' interval overrides this every 5s from GlobalUsageCounter.
                                    // So we MUST update GlobalUsageCounter's internal state or it will overwrite us.
                                    GlobalUsageCounter.syncFromServer(profile.usageCount, limit)
                                }
                            }
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

    const handleModeChange = (mode: 'pm' | 'teams') => {
        setCurrentMode(mode)

        // Update localStorage
        const onboardingData = localStorage.getItem("smello-user-onboarding")
        if (onboardingData) {
            try {
                const data = JSON.parse(onboardingData)
                data.usageType = mode === 'teams' ? 'team' : 'personal'
                localStorage.setItem("smello-user-onboarding", JSON.stringify(data))
            } catch (e) {
                console.error("Failed to update mode", e)
            }
        }

        // Redirect to appropriate dashboard
        if (mode === 'teams') {
            window.location.href = '/teams'
        } else {
            window.location.href = '/'
        }
    }

    // Display session user name by default, but override with onboarding name if available
    const displayUserName = userName || user?.fullName || "Guest"
    const displayUserEmail = user?.primaryEmailAddress?.emailAddress || ""

    if (!isLoaded) {
        return (
            <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="w-full flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <UsageCounterBadge />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    </div>
                </div>
            </header>
        )
    }

    if (!isSignedIn) {
        return (
            <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="w-full flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <UsageCounterBadge />
                    </div>
                    <Button
                        onClick={() => openSignIn()}
                        variant="outline"
                        className="gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign In
                    </Button>
                </div>
            </header>
        )
    }

    const userInitials = displayUserName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

    const isPro = !!activeProvider

    return (
        <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="w-full flex h-16 items-center justify-between px-6">
                {/* Left side - Usage Counter */}
                <div className="flex items-center gap-4">
                    <UsageCounterBadge />
                </div>

                {/* Center - Mode Switcher */}
                <div className="flex items-center">
                    <ModeSwitcher
                        currentMode={currentMode}
                        onModeChange={handleModeChange}
                    />
                </div>

                {/* Right side - User Profile */}
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("brown")}>
                                <Briefcase className="mr-2 h-4 w-4" />
                                Earth
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("cool")}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Midnight
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-3 h-auto py-2 px-3 hover:bg-muted/50">
                                <div className="flex flex-col items-end mr-2 hidden sm:flex">
                                    <p className="text-sm font-medium leading-none">{displayUserName}</p>
                                    <p className="text-xs text-muted-foreground leading-none mt-1">
                                        {userRole || "User"}
                                    </p>
                                </div>
                                <Avatar className="w-10 h-10 border-2 border-border">
                                    <AvatarImage src={user?.imageUrl || ""} alt={displayUserName} />
                                    <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge variant={isPro ? "default" : "secondary"} className="text-[10px] px-2 py-0 h-5">
                                    {isPro ? (
                                        <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Pro
                                        </>
                                    ) : (
                                        "Free"
                                    )}
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end" className="w-72" sideOffset={8}>
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{displayUserName}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {displayUserEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* User Role & Professional Info */}
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
                                    <span className={activeProvider ? "text-green-500 font-medium" : remainingOperations > 0 ? "text-orange-500 font-medium" : "text-red-500 font-medium"}>
                                        {activeProvider ? "Unlimited" : `${remainingOperations}/6 Remaining`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-muted-foreground">
                                        <Brain className="w-3 h-3 mr-2" />
                                        AI Provider
                                    </div>
                                    <span className="font-medium truncate max-w-[120px]" title={activeProvider ? `Using your ${activeProvider} API key` : "Using server-side Gemini API"}>
                                        {activeProvider || "Built-in API"}
                                    </span>
                                </div>
                            </div>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => (window.location.href = '/onboarding?mode=edit')}>
                                <User className="w-4 h-4 mr-2" />
                                Profile Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => (window.location.href = '/settings/keys')}>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings & API Keys
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ redirectUrl: '/' })}
                                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
