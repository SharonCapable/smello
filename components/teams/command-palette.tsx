"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    Folder,
    Workflow,
    MessageSquare,
    Calendar,
    Users,
    Settings,
    Zap,
    FileText,
    BarChart3,
    ChevronRight,
    Command
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
    id: string
    title: string
    description?: string
    icon: React.ElementType
    category: 'create' | 'navigate' | 'search' | 'settings'
    keywords: string[]
    action: () => void
    shortcut?: string
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onNavigate?: (path: string) => void
    onCreateProject?: () => void
    onCreateTask?: () => void
}

export function CommandPalette({
    isOpen,
    onClose,
    onNavigate,
    onCreateProject,
    onCreateTask
}: CommandPaletteProps) {
    const [search, setSearch] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)

    const actions: QuickAction[] = [
        // Create Actions
        {
            id: 'create-project',
            title: 'Create New Project',
            description: 'Start a new team project with workflow',
            icon: Plus,
            category: 'create',
            keywords: ['new', 'project', 'create', 'start'],
            action: () => {
                onCreateProject?.()
                onClose()
            },
            shortcut: 'Cmd+N'
        },
        {
            id: 'create-task',
            title: 'Create New Task',
            description: 'Add a task to your dashboard',
            icon: Plus,
            category: 'create',
            keywords: ['new', 'task', 'create', 'todo'],
            action: () => {
                onCreateTask?.()
                onClose()
            },
            shortcut: 'Cmd+T'
        },

        // Navigate Actions
        {
            id: 'nav-projects',
            title: 'Go to Projects',
            description: 'View all team projects',
            icon: Folder,
            category: 'navigate',
            keywords: ['projects', 'go', 'navigate', 'view'],
            action: () => {
                onNavigate?.('projects')
                onClose()
            },
            shortcut: 'G then P'
        },
        {
            id: 'nav-collaboration',
            title: 'Go to Collaboration Hub',
            description: 'View shared team tasks',
            icon: MessageSquare,
            category: 'navigate',
            keywords: ['collaboration', 'hub', 'team', 'tasks'],
            action: () => {
                onNavigate?.('collaboration')
                onClose()
            },
            shortcut: 'G then C'
        },
        {
            id: 'nav-sprints',
            title: 'Go to Sprint Board',
            description: 'Manage current sprint',
            icon: Zap,
            category: 'navigate',
            keywords: ['sprint', 'board', 'kanban'],
            action: () => {
                onNavigate?.('sprints')
                onClose()
            },
            shortcut: 'G then S'
        },
        {
            id: 'nav-analytics',
            title: 'Go to Analytics',
            description: 'View team performance metrics',
            icon: BarChart3,
            category: 'navigate',
            keywords: ['analytics', 'metrics', 'stats', 'reports'],
            action: () => {
                onNavigate?.('analytics')
                onClose()
            },
            shortcut: 'G then A'
        },
        {
            id: 'nav-calendar',
            title: 'Go to Calendar',
            description: 'View your schedule',
            icon: Calendar,
            category: 'navigate',
            keywords: ['calendar', 'schedule', 'events'],
            action: () => {
                onNavigate?.('calendar')
                onClose()
            },
        },
        {
            id: 'nav-dashboard',
            title: 'Go to My Dashboard',
            description: 'View personal tasks',
            icon: Users,
            category: 'navigate',
            keywords: ['dashboard', 'personal', 'my'],
            action: () => {
                onNavigate?.('personal-dashboard')
                onClose()
            },
            shortcut: 'G then D'
        },

        // Settings
        {
            id: 'settings',
            title: 'Open Settings',
            description: 'Manage your preferences',
            icon: Settings,
            category: 'settings',
            keywords: ['settings', 'preferences', 'config'],
            action: () => {
                onNavigate?.('settings')
                onClose()
            },
            shortcut: 'Cmd+,'
        },
    ]

    const filteredActions = search
        ? actions.filter(action =>
            action.title.toLowerCase().includes(search.toLowerCase()) ||
            action.description?.toLowerCase().includes(search.toLowerCase()) ||
            action.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
        )
        : actions

    const groupedActions = filteredActions.reduce((acc, action) => {
        if (!acc[action.category]) {
            acc[action.category] = []
        }
        acc[action.category].push(action)
        return acc
    }, {} as Record<string, QuickAction[]>)

    const categoryLabels = {
        create: 'Create',
        navigate: 'Navigate',
        search: 'Search',
        settings: 'Settings'
    }

    const categoryIcons = {
        create: Plus,
        navigate: ChevronRight,
        search: Search,
        settings: Settings
    }

    useEffect(() => {
        setSelectedIndex(0)
    }, [search])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, 0))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                filteredActions[selectedIndex]?.action()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, selectedIndex, filteredActions])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 gap-0">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                    <Input
                        placeholder="Type a command or search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0 text-base h-auto p-0"
                        autoFocus
                    />
                    <Badge variant="outline" className="text-xs shrink-0">
                        <Command className="w-3 h-3 mr-1" />K
                    </Badge>
                </div>

                {/* Actions List */}
                <ScrollArea className="max-h-[400px]">
                    <div className="p-2">
                        {Object.entries(groupedActions).map(([category, categoryActions]) => {
                            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]

                            return (
                                <div key={category} className="mb-4 last:mb-0">
                                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <CategoryIcon className="w-3 h-3" />
                                        {categoryLabels[category as keyof typeof categoryLabels]}
                                    </div>
                                    <div className="space-y-1">
                                        {categoryActions.map((action, index) => {
                                            const globalIndex = filteredActions.indexOf(action)
                                            const isSelected = globalIndex === selectedIndex
                                            const Icon = action.icon

                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={action.action}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                                                        isSelected
                                                            ? "bg-accent/10 text-accent"
                                                            : "hover:bg-muted/50"
                                                    )}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                                                        isSelected ? "bg-accent/20" : "bg-muted/50"
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm">{action.title}</div>
                                                        {action.description && (
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {action.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {action.shortcut && (
                                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                                            {action.shortcut}
                                                        </Badge>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}

                        {filteredActions.length === 0 && (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No results found for "{search}"</p>
                                <p className="text-xs mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-background rounded border">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-background rounded border">↓</kbd>
                            <span className="ml-1">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
                            <span className="ml-1">Select</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-background rounded border">Esc</kbd>
                            <span className="ml-1">Close</span>
                        </div>
                    </div>
                    <div className="text-[10px]">
                        Tip: Use shortcuts to navigate faster
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Hook to use command palette globally
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev)
    }
}
