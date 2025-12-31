"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, Key, CreditCard, LayoutDashboard, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-muted/10 hidden md:flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Link href="/" className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to App</span>
                        </Link>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Find..." className="pl-8 h-9 bg-background/50" />
                        <div className="absolute right-2 top-2.5 flex items-center gap-1">
                            <span className="text-xs text-muted-foreground border rounded px-1">Ctrl</span>
                            <span className="text-xs text-muted-foreground border rounded px-1">K</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {/* Configure Group */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Configure
                        </h3>
                        <div className="space-y-1">
                            <Link href="/settings/profile">
                                <Button
                                    variant={isActive("/settings/profile") ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2 h-9"
                                >
                                    <User className="w-4 h-4" />
                                    User & Profile
                                </Button>
                            </Link>
                            <Link href="/settings/keys">
                                <Button
                                    variant={isActive("/settings/keys") ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2 h-9"
                                >
                                    <Key className="w-4 h-4" />
                                    API Keys
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Application Group */}
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Application
                        </h3>
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start gap-2 h-9 cursor-not-allowed opacity-50">
                                <CreditCard className="w-4 h-4" />
                                Plan & Billing
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2 h-9 cursor-not-allowed opacity-50">
                                <LayoutDashboard className="w-4 h-4" />
                                Customization
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User Info Footer (Internal sidebar) */}
                <div className="p-4 border-t border-border bg-background/50">
                    <div className="text-xs text-muted-foreground">SMELLO v1.0 Beta</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-background">
                <main className="h-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
