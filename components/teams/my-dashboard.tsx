"use client"

import React, { useState, useEffect } from "react"
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
    Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"

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

export function MyDashboard() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
    const [searchQuery, setSearchQuery] = useState("")

    const handleUpdateTask = (taskId: string, fieldId: string, value: any) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, values: { ...t.values, [fieldId]: value } } : t
        ))
    }

    const handleAddTask = () => {
        const newTask: Task = {
            id: Date.now().toString(),
            values: { title: "", status: "To Do", priority: "Medium", progress: 0 }
        }
        setTasks([...tasks, newTask])
    }

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Focus on your personal work and upcoming tasks.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI Suggest
                    </Button>
                    <Button size="sm" onClick={handleAddTask}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-grow max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 bg-background shadow-sm">
                        <List className="w-3.5 h-3.5" />
                        Table
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 text-muted-foreground">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Board
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 text-muted-foreground">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Calendar
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-grow">
                <TaskTable
                    tasks={tasks.filter(t => t.values.title?.toLowerCase().includes(searchQuery.toLowerCase()))}
                    columns={DEFAULT_COLUMNS}
                    onUpdateTask={handleUpdateTask}
                    onAddTask={handleAddTask}
                />
            </div>

            {/* Active Sprint Shortcut (Optional) */}
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
