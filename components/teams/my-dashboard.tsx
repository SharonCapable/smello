"use client"

import React, { useState, useEffect } from "react"
import { TaskTable, Column, Task, ColumnType } from "./task-table"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
    ChevronRight,
    Sparkles,
    Home
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const BREADCRUMBS = [
    { label: "Wizzle Org", icon: Home },
    { label: "Engineering", icon: List },
    { label: "My Dashboard", active: true }
]

const DEFAULT_COLUMNS: Column[] = [
    { id: "title", label: "Task Name", type: "text", width: 300 },
    { id: "status", label: "Status", type: "status", width: 120 },
    { id: "priority", label: "Priority", type: "priority", width: 100 },
    { id: "date", label: "Due Date", type: "date", width: 150 },
    { id: "tags", label: "Tags", type: "tags", width: 180 },
    { id: "progress", label: "Progress", type: "progress", width: 120 },
    { id: "url", label: "URL", type: "url", width: 200 },
]

const INITIAL_TASKS: Task[] = [
    { id: "1", values: { title: "Draft Smello for Teams PRD", status: "Done", priority: "High", progress: 100, tags: ["Documentation"] } },
    { id: "2", values: { title: "Initialize Firebase Auth Bridge", status: "Done", priority: "High", progress: 100, tags: ["Engineering"] } },
    { id: "3", values: { title: "Build Task Table Engine", status: "In Progress", priority: "High", progress: 60, tags: ["Frontend", "Teams"] } },
    { id: "4", values: { title: "Integrate Google Calendar", status: "Backlog", priority: "Medium", progress: 0, tags: ["Integration"] } },
]

interface MyDashboardProps {
    onPromoteTask?: (task: Task) => void
}

export function MyDashboard({ onPromoteTask }: MyDashboardProps) {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
    const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS)
    const [searchQuery, setSearchQuery] = useState("")
    const [lastSynced, setLastSynced] = useState(new Date())

    const handleUpdateTask = (taskId: string, fieldId: string, value: any) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, values: { ...t.values, [fieldId]: value } } : t
        ))
        setLastSynced(new Date())
    }

    const handleAddTask = () => {
        const newTask: Task = {
            id: Date.now().toString(),
            values: { title: "", status: "To Do", priority: "Medium", progress: 0 }
        }
        setTasks([newTask, ...tasks])
        setLastSynced(new Date())
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        setLastSynced(new Date())
    }

    const handleResizeColumn = (columnId: string, width: number) => {
        setColumns(prev => prev.map(col =>
            col.id === columnId ? { ...col, width } : col
        ))
    }

    const handleAddColumn = (label: string, type: ColumnType) => {
        const newCol: Column = {
            id: label.toLowerCase().replace(/\s+/g, "_"),
            label,
            type,
            width: 150
        }
        setColumns([...columns, newCol])
    }

    const handleInternalPromoteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (task && onPromoteTask) {
            onPromoteTask(task)
            handleDeleteTask(taskId) // Remove from personal dashboard after promoting
        }
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-[-12px]">
                {BREADCRUMBS.map((crumb, i) => (
                    <React.Fragment key={crumb.label}>
                        <div className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer ${crumb.active ? "text-foreground font-medium" : ""}`}>
                            {crumb.icon && <crumb.icon className="w-3 h-3" />}
                            {crumb.label}
                        </div>
                        {i < BREADCRUMBS.length - 1 && <ChevronRight className="w-3 h-3 opacity-30" />}
                    </React.Fragment>
                ))}
            </nav>

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Dashboard</h1>
                        <div className="flex items-center gap-1.5 bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                            </span>
                            <span className="text-[10px] font-bold text-accent">LIVE SYNC</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>Focus on your personal work and upcoming tasks.</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">Synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-accent/20 hover:bg-accent/5 hover:text-accent transition-all text-xs">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI Suggest
                    </Button>
                    <Button size="sm" onClick={handleAddTask} className="h-9 px-4 shadow-lg shadow-accent/20 text-xs">
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tasks Done", value: tasks.filter(t => t.values.status === "Done").length, color: "text-green-500" },
                    { label: "In Progress", value: tasks.filter(t => t.values.status === "In Progress").length, color: "text-blue-500" },
                    { label: "Blocked", value: tasks.filter(t => t.values.status === "Blocked").length, color: "text-red-500" },
                    { label: "Completion", value: `${Math.round(tasks.reduce((acc, t) => acc + (t.values.progress || 0), 0) / (tasks.length || 1))}%`, color: "text-accent" },
                ].map((stat, i) => (
                    <div key={i} className="bg-card/30 backdrop-blur-sm border rounded-xl p-4 transition-all hover:bg-card/50">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2 border-y border-border/40">
                <div className="flex items-center gap-4 flex-grow max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search or filter tasks..."
                            className="pl-9 h-10 bg-muted/20 border-none ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-accent/20 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20 h-10">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs gap-1.5 bg-background shadow-sm rounded-md font-semibold">
                        <List className="w-3.5 h-3.5" />
                        Table
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground font-medium">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Board
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground font-medium">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Calendar
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-muted-foreground hover:text-foreground font-medium">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-grow min-h-[400px]">
                <TaskTable
                    tasks={tasks.filter(t => (t.values.title || "").toLowerCase().includes(searchQuery.toLowerCase()))}
                    columns={columns}
                    onUpdateTask={handleUpdateTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onPromoteTask={handleInternalPromoteTask}
                    onResizeColumn={handleResizeColumn}
                    onAddColumn={handleAddColumn}
                />
            </div>

            {/* Active Sprint Shortcut */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/10 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Active Sprint - Software Team</div>
                            <div className="text-xs text-muted-foreground">Sprint 12 (Ends in 3 days)</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="p-4 rounded-xl border bg-muted/10 flex items-center justify-between group cursor-pointer hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Today's Schedule</div>
                            <div className="text-xs text-muted-foreground">3 meetings, 2 deadlines</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    )
}
