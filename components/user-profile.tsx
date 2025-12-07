"use client"

import { useSession, signIn, signOut } from "next-auth/react"
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
import { LogIn, LogOut, User, Settings, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function UserProfile() {
    const { data: session, status } = useSession()

    if (status === "loading") {
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

    if (!session) {
        return (
            <div className="p-4 border-t border-border/50">
                <Button
                    onClick={() => signIn("google")}
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

    const userInitials = session.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

    return (
        <div className="p-4 border-t border-border/50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="font-medium text-sm truncate">{session.user?.name}</p>
                            <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Pro
                                </Badge>
                            </div>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{session.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {session.user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
