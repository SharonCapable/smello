"use client"

import React, { useState } from "react"
import {
    Users,
    LayoutDashboard,
    MessageSquare,
    Zap,
    BarChart3,
    Calendar,
    Settings,
    Search,
    ChevronLeft,
    ChevronRight,
    Plus,
    Command,
    HelpCircle,
    Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface NavItemProps {
    icon: React.ElementType
    label: string
    active?: boolean
    onClick: () => void
    collapsed?: boolean
    badge?: string
}

function NavItem({ icon: Icon, label, active, onClick, collapsed, badge }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium group
        ${active
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${active ? "text-accent" : "group-hover:text-foreground"}`} />
            {!collapsed && (
                <span className="flex-1 text-left truncate">{label}</span>
            )}
            {!collapsed && badge && (
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent font-bold">
                    {badge}
                </span>
            )}
        </button>
    )
}

interface TeamsLayoutProps {
    children: React.ReactNode
    activeTab: string
    onTabChange: (tab: string) => void
    organizationName?: string
}

export function TeamsLayout({ children, activeTab, onTabChange, organizationName = "Default Org" }: TeamsLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`bg-muted/10 border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[260px]"}`}
            >
                {/* Org Selector */}
                <div className="p-4 flex items-center gap-3 border-b border-border/40">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold shrink-0">
                        {organizationName[0]}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate">{organizationName}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pro Plan</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {/* Individual Section */}
                    <div className="space-y-1">
                        {!collapsed && <div className="px-3 pb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Personal</div>}
                        <NavItem
                            icon={LayoutDashboard}
                            label="My Dashboard"
                            active={activeTab === "personal-dashboard"}
                            onClick={() => onTabChange("personal-dashboard")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            icon={Calendar}
                            label="My Schedule"
                            active={activeTab === "calendar"}
                            onClick={() => onTabChange("calendar")}
                            collapsed={collapsed}
                            badge="3"
                        />
                    </div>

                    {/* Team Section */}
                    <div className="space-y-1">
                        {!collapsed && (
                            <div className="px-3 pb-2 flex items-center justify-between">
                                <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Team (Active)</div>
                                <button className="hover:text-accent transition-colors"><Plus className="w-3 h-3" /></button>
                            </div>
                        )}
                        <NavItem
                            icon={MessageSquare}
                            label="Collaboration Hub"
                            active={activeTab === "collaboration"}
                            onClick={() => onTabChange("collaboration")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            icon={Zap}
                            label="Sprint Board"
                            active={activeTab === "sprints"}
                            onClick={() => onTabChange("sprints")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            icon={BarChart3}
                            label="Analytics"
                            active={activeTab === "analytics"}
                            onClick={() => onTabChange("analytics")}
                            collapsed={collapsed}
                        />
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-border/40 space-y-1">
                    <NavItem
                        icon={Settings}
                        label="Settings"
                        active={activeTab === "settings"}
                        onClick={() => onTabChange("settings")}
                        collapsed={collapsed}
                    />
                    <NavItem
                        icon={HelpCircle}
                        label="Support"
                        active={activeTab === "support"}
                        onClick={() => onTabChange("support")}
                        collapsed={collapsed}
                    />
                    <div className="pt-2 flex items-center justify-center">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-3xl overflow-hidden">
                {/* Content Header (Quiet) */}
                <header className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/30 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-sm hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search organization..."
                                className="pl-9 h-8 bg-muted/30 border-none text-xs w-full focus-visible:ring-1 focus-visible:ring-accent/30"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">⌘ K</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                        <Bell className="w-4 h-4" />
                                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full border border-background"></span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="h-6 w-[1px] bg-border/50 mx-1"></div>

                        <button className="flex items-center gap-2 pl-2 hover:bg-muted/50 p-1 rounded-full transition-colors">
                            <Avatar className="w-7 h-7 border border-accent/20">
                                <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">SM</AvatarFallback>
                            </Avatar>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="p-8 pb-16 max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
