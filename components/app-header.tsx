"use client"

import { useSession, signIn, signOut } from "next-auth/react"
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
import { GlobalUsageCounter } from "@/lib/global-usage-counter"
import { getUserProfile } from "@/lib/firestore-service"
import { setUserId } from "@/lib/storage-hybrid"
import { UsageCounterBadge } from "@/components/usage-counter-badge"

export function AppHeader() {
    const { data: session, status } = useSession()
    const [mounted, setMounted] = useState(false)
    const [remainingOperations, setRemainingOperations] = useState(0)
    const [activeProvider, setActiveProvider] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string>("")
    const [userName, setUserName] = useState<string>("")

    useEffect(() => {
        setMounted(true)
        updateStatus()

        // Load user profile from Firestore
        const loadUserProfile = async () => {
            if (session?.user) {
                try {
                    const uid = (session.user as any).uid || session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')
                    if (uid) {
                        // Set user ID for hybrid storage
                        setUserId(uid)

                        // Load profile from Firestore
                        const profile = await getUserProfile(uid)
                        if (profile) {
                            if (profile.role) setUserRole(profile.role)
                            if (profile.name) setUserName(profile.name)
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
    }, [session])

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
    const displayUserName = userName || session?.user?.name || "Guest"
    const displayUserEmail = session?.user?.email || ""

    if (status === "loading") {
        return (
            <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container flex h-16 items-center justify-between px-4">
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

    if (!session) {
        return (
            <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <UsageCounterBadge />
                    </div>
                    <Button
                        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
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
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left side - Usage Counter */}
                <div className="flex items-center gap-4">
                    <UsageCounterBadge />
                </div>

                {/* Right side - User Profile */}
                <div className="flex items-center gap-3">
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
                                    <AvatarImage src={session.user?.image || ""} alt={displayUserName} />
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
                                    <span className="font-medium truncate max-w-[120px]">
                                        {activeProvider || "System Default"}
                                    </span>
                                </div>
                            </div>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" />
                                Profile Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings & API Keys
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: '/' })}
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
