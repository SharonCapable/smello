"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Target,
  Menu,
  X,
  Monitor,
  FileText,
  Server,
  Presentation,
  Map,
  Swords,
  Milestone,
  AlertTriangle
} from "lucide-react"
import { useTheme } from "next-themes"
import { UsageCounterBadge } from "@/components/usage-counter-badge"
import { UserProfile } from "@/components/user-profile"

type AppState =
  | "workflow-home"
  | "guided-journey"
  | "home"
  | "mode-selection"
  | "manual-flow"
  | "ai-flow"
  | "project-manager"
  | "project-view"
  | "project-edit"
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

export function SidebarNavigation({
  appState,
  onNavigate,
  onBack,
  showBackButton = false
}: SidebarNavigationProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useState(() => {
    setMounted(true)
  })

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

  const handleDesktopVersion = () => {
    window.open('/desktop', '_blank')
  }

  const handleNavigation = (state: AppState) => {
    onNavigate(state)
  }

  return (
    <div className={`relative ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-card border-r border-border/50`}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-background border border-border shadow-md p-0"
      >
        {isCollapsed ? <Menu className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </Button>

      {/* Logo Section */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-accent-foreground" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-foreground">SMELLO</h1>
          )}
        </div>
        {!isCollapsed && (
          <Badge variant="secondary" className="text-xs mt-2">
            v1.0
          </Badge>
        )}
      </div>

      {/* Usage Counter */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-border/50">
          <UsageCounterBadge />
        </div>
      )}

      {/* Back Button (when not on home) */}
      {showBackButton && !isCollapsed && (
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
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-6 px-2">
          {navigationItems.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.group}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = appState === item.id

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isActive ? 'bg-accent text-accent-foreground' : ''} ${isCollapsed ? 'px-2' : 'px-4'}`}
                    onClick={() => handleNavigation(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                )
              })}
            </div>
          ))}
        </nav>
      </div>
      {/* Desktop Version - Separator */}
      {!isCollapsed && <div className="border-t border-border/50 my-2" />}

      {/* Desktop Version Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDesktopVersion}
        className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
        title={isCollapsed ? "Desktop Version" : undefined}
      >
        <Monitor className="w-4 h-4 flex-shrink-0" />
        {!isCollapsed && <span className="ml-2">Desktop</span>}
      </Button>


      {/* Theme Toggle */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full ${isCollapsed ? 'px-2' : ''}`}
          title={isCollapsed ? "Toggle theme" : undefined}
        >
          {mounted ? (
            theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          {!isCollapsed && <span className="ml-2">Theme</span>}
        </Button>
      </div>

      {/* User Profile */}
      {!isCollapsed && <UserProfile />}
    </div >
  )
}
