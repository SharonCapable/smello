"use client"

import React, { useState } from "react"
import { TaskTable, Column, Task } from "./task-table"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
    ChevronRight,
    MessageSquare,
    Users,
    Share2,
    Lock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const COLLAB_COLUMNS: Column[] = [
    { id: "title", label: "Task Name", type: "text", width: 300 },
    { id: "status", label: "Status", type: "status", width: 120 },
    { id: "priority", label: "Priority", type: "priority", width: 100 },
    { id: "assignee", label: "Contributors", type: "assignee", width: 150 },
    { id: "tags", label: "Focus Area", type: "tags", width: 180 },
    { id: "progress", label: "Health", type: "progress", width: 120 },
]

interface CollaborationHubProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function CollaborationHub({ tasks, setTasks }: CollaborationHubProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

    const handleUpdateTask = (taskId: string, fieldId: string, value: any) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, values: { ...t.values, [fieldId]: value } } : t
        ))
    }

    const handleAddTask = () => {
        const newTask: Task = {
            id: `team_${Date.now()}`,
            values: { title: "", status: "To Do", priority: "Medium", progress: 0 }
        }
        setTasks([newTask, ...tasks])
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Collaboration Hub</h1>
                        <Badge variant="outline" className="text-[10px] h-5 border-accent/20 text-accent font-bold">SHARED</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Active workspace for the <b>Wizzle Engineering</b> team.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-accent/20">
                        <Share2 className="w-4 h-4" />
                        Share View
                    </Button>
                    <Button size="sm" onClick={handleAddTask} className="h-9 px-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team Task
                    </Button>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Team Velocity</div>
                        <div className="text-2xl font-bold">42 pts</div>
                    </div>
                    <Users className="w-8 h-8 text-accent/20" />
                </div>
                <div className="bg-muted/20 border rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Members</div>
                        <div className="text-2xl font-bold">8</div>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-background" />
                        ))}
                    </div>
                </div>
                <div className="bg-muted/20 border rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Open Discussions</div>
                        <div className="text-2xl font-bold">12</div>
                    </div>
                    <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2 border-y border-border/40">
                <div className="flex items-center gap-4 flex-grow max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search current sprint or backlog..."
                            className="pl-9 h-10 bg-muted/20 border-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20 h-10">
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs bg-background shadow-sm rounded-md font-semibold">
                            <List className="w-3.5 h-3.5 mr-1.5" /> List
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground font-medium">
                            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Board
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-muted-foreground font-medium">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            <div className="flex-grow">
                <TaskTable
                    tasks={tasks.filter(t => (t.values.title || "").toLowerCase().includes(searchQuery.toLowerCase()))}
                    columns={COLLAB_COLUMNS}
                    onUpdateTask={handleUpdateTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                />
            </div>

            {/* Discussion Preview / Activity Log Placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card/30 border rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-accent" />
                        Recent Discussions
                    </h3>
                    <div className="space-y-4">
                        {[
                            { user: "Sharon", text: "I've updated the auth flow diagrams.", time: "2h ago" },
                            { user: "Alex", text: "Quick check: are we blocking the release for this audit?", time: "4h ago" }
                        ].map((msg, i) => (
                            <div key={i} className="flex gap-3 text-xs">
                                <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-bold">{msg.user}</span>
                                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                    </div>
                                    <p className="text-muted-foreground">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-card/30 border rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        Activity Log
                    </h3>
                    <div className="space-y-3">
                        {[
                            { action: "moved", task: "Security Audit", detail: "to Done", time: "1h ago" },
                            { action: "created", task: "Q1 Strategy", detail: "in Backlog", time: "Yesterday" }
                        ].map((act, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">You {act.action}</span>
                                    <span className="font-semibold">{act.task}</span>
                                    <span className="text-muted-foreground text-[10px]">{act.detail}</span>
                                </div>
                                <span className="text-muted-foreground">{act.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
