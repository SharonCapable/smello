"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Home,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Search,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Monitor,
  FileText,
  Server,
  Presentation,
  Map,
  Swords,
  Milestone,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Users
} from "lucide-react"
import { useTheme } from "next-themes"

type AppState =
  | "landing"
  | "onboarding"
  | "team-dashboard"
  | "workflow-home"
  | "guided-journey"
  | "home"
  | "mode-selection"
  | "manual-flow"
  | "ai-flow"
  | "project-manager"
  | "project-view"
  | "project-edit"
  | "project-path-selector"
  | "idea-generator"
  | "feature-prioritization"
  | "research-agent"
  | "settings"
  | "standalone-ai"
  | "prd-generator"
  | "technical-blueprint"
  | "pitch-deck-generator"
  | "user-journey-map"
  | "competitive-intelligence"
  | "roadmap-builder"
  | "risk-analysis"

interface SidebarNavigationProps {
  appState: AppState
  onNavigate: (state: AppState) => void
  onBack: () => void
  showBackButton?: boolean
}

interface SidebarContentProps extends SidebarNavigationProps {
  isCollapsed: boolean
  toggleCollapse?: () => void
  isMobile?: boolean
  closeMobileSheet?: () => void
}

function SidebarContent({
  appState,
  onNavigate,
  onBack,
  showBackButton,
  isCollapsed,
  toggleCollapse,
  isMobile = false,
  closeMobileSheet
}: SidebarContentProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // State for collapsible groups - default open for better discovery
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "General": true,
    "Ideation": true,
    "Strategy": true,
    "Build & Launch": true,
    "System": true
  })

  useState(() => {
    setMounted(true)
  })

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  const handleNavigation = (state: AppState) => {
    onNavigate(state)
    if (isMobile && closeMobileSheet) {
      closeMobileSheet()
    }
  }

  const handleDesktopVersion = () => {
    window.open('/desktop', '_blank')
  }

  const navigationItems = [
    {
      group: "General", items: [
        { id: "workflow-home" as const, label: "Home", icon: Home },
        { id: "project-manager" as const, label: "Projects", icon: FolderOpen },
      ]
    },
    {
      group: "Ideation", items: [
        { id: "idea-generator" as const, label: "Idea to Product", icon: Sparkles },
        { id: "research-agent" as const, label: "Product Research", icon: Search },
        { id: "competitive-intelligence" as const, label: "Competitor Analysis", icon: Swords },
      ]
    },
    {
      group: "Strategy", items: [
        { id: "prd-generator" as const, label: "PRD", icon: FileText },
        { id: "user-journey-map" as const, label: "Journey Map", icon: Map },
        { id: "feature-prioritization" as const, label: "Prioritize", icon: BarChart3 },
        { id: "roadmap-builder" as const, label: "Roadmap", icon: Milestone },
        { id: "risk-analysis" as const, label: "Risks", icon: AlertTriangle },
      ]
    },
    {
      group: "Build & Launch", items: [
        { id: "technical-blueprint" as const, label: "Blueprint", icon: Server },
        { id: "pitch-deck-generator" as const, label: "Pitch Deck", icon: Presentation },
      ]
    },
    {
      group: "System", items: [
        { id: "settings" as const, label: "Settings", icon: Settings },
      ]
    }
  ]

  return (
    <div className={`flex flex-col h-full bg-card ${!isMobile ? 'border-r border-border/50' : ''}`}>
      {/* Toggle Button (Desktop Only) */}
      {!isMobile && toggleCollapse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-background border border-border shadow-md p-0"
        >
          {isCollapsed ? <Menu className="w-3 h-3" /> : <X className="w-3 h-3" />}
        </Button>
      )}

      {/* Logo Section */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0">
            {/* Using the copied logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SMELLO Logo"
              className="w-full h-full object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-accent');
              }}
            />
          </div>
          {(!isCollapsed || isMobile) && (
            <h1 className="text-xl font-bold text-foreground tracking-tight">SMELLO</h1>
          )}
        </div>
        {(!isCollapsed || isMobile) && (
          <Badge variant="secondary" className="text-xs mt-2">
            v1.0 Beta
          </Badge>
        )}
      </div>

      {/* Back Button (when not on home) */}
      {showBackButton && (!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <nav className="space-y-4 px-2">
          {navigationItems.map((group, groupIndex) => {
            if (isCollapsed && !isMobile) {
              // Collapsed View: Just icons
              return (
                <div key={groupIndex} className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = appState === item.id
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-center px-2 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                        onClick={() => handleNavigation(item.id)}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5" />
                      </Button>
                    )
                  })}
                </div>
              )
            }

            // Expanded / Mobile View: Collapsible Groups
            return (
              <Collapsible
                key={groupIndex}
                open={openGroups[group.group]}
                onOpenChange={() => toggleGroup(group.group)}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-4 h-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50">
                    {group.group}
                    {openGroups[group.group] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = appState === item.id

                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start pl-6 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                        onClick={() => handleNavigation(item.id)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span>{item.label}</span>
                      </Button>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-border/50 p-2 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDesktopVersion}
          className={`w-full justify-start ${isCollapsed && !isMobile ? 'px-2 justify-center' : 'px-4'}`}
          title={isCollapsed ? "Desktop Version" : undefined}
        >
          <Monitor className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="ml-2">Desktop</span>}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full justify-start ${isCollapsed && !isMobile ? 'px-2 justify-center' : 'px-4'}`}
          title={isCollapsed ? "Toggle theme" : undefined}
        >
          {/* Theme Icon Logic */}
          {mounted ? (
            theme === "dark" ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Sun className="w-4 h-4 flex-shrink-0" />
          )}
          {(!isCollapsed || isMobile) && <span className="ml-2">Theme</span>}
        </Button>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigation("team-dashboard")}
            className={`w-full justify-start bg-blue-600/5 text-blue-500 hover:bg-blue-600/10 border-blue-500/20 ${isCollapsed && !isMobile ? 'px-2 justify-center' : 'px-4'}`}
            title={isCollapsed ? "Switch to Team Dashboard" : undefined}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span className="ml-2 font-bold uppercase tracking-widest text-[10px]">Team Dashboard</span>}
          </Button>
        </div>
      </div>

    </div>
  )
}

export function SidebarNavigation(props: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background shadow-md">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarContent
              {...props}
              isCollapsed={false}
              isMobile={true}
              closeMobileSheet={() => setIsMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:block relative ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 h-screen sticky top-0`}>
        <SidebarContent
          {...props}
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
    </>
  )
}
