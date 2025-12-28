"use client"

import React, { useState } from "react"
import { Task } from "./task-table"
import { Button } from "@/components/ui/button"
import {
    Plus,
    MoreHorizontal,
    Clock,
    Calendar as CalendarIcon,
    Flame,
    CheckCircle2,
    TrendingUp,
    Filter,
    Search,
    ChevronDown,
    ChevronRight,
    User as UserIcon,
    Zap,
    GripVertical
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { SprintCreator } from "./sprint-creator"
import { Sprint, createSprint, getActiveSprint, updateSprint } from "@/lib/firestore-service"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { differenceInDays, format } from "date-fns"

interface SprintBoardProps {
    tasks: Task[]
    onUpdateTask: (taskId: string, fieldId: string, value: any) => void
    orgId?: string
    teamId?: string
}

const COLUMNS = [
    { id: "Backlog", label: "Sprint Backlog", icon: Clock },
    { id: "In Progress", label: "In Progress", icon: Flame },
    { id: "Review", label: "Review", icon: TrendingUp },
    { id: "Done", label: "Completed", icon: CheckCircle2 },
]

export function SprintBoard({ tasks, onUpdateTask, orgId, teamId }: SprintBoardProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    // Use props with fallbacks to avoid breaking if missing
    const ORG_ID = orgId || "org_demo"
    const TEAM_ID = teamId || "team_demo"

    React.useEffect(() => {
        const fetchSprint = async () => {
            if (!ORG_ID || !TEAM_ID) return
            try {
                const sprint = await getActiveSprint(ORG_ID, TEAM_ID)
                setActiveSprint(sprint)
            } catch (error) {
                console.error("Error fetching sprint:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSprint()
    }, [ORG_ID, TEAM_ID])

    const handleCreateSprint = async (data: any) => {
        try {
            const sprintId = await createSprint({
                ...data,
                orgId: ORG_ID,
                teamId: TEAM_ID,
                startDate: Timestamp.fromDate(data.startDate),
                endDate: Timestamp.fromDate(data.endDate),
                taskIds: [], // Start with empty, user can add tasks
            })

            // Refetch or optimistic update
            const newSprint: Sprint = {
                id: sprintId,
                ...data,
                orgId: ORG_ID,
                teamId: TEAM_ID,
                status: 'active',
                startDate: Timestamp.fromDate(data.startDate),
                endDate: Timestamp.fromDate(data.endDate),
                taskIds: [],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }
            setActiveSprint(newSprint)
            toast({
                title: "Sprint Started",
                description: `${data.name} is now active.`
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create sprint.",
                variant: "destructive"
            })
        }
    }

    const handleCompleteSprint = async () => {
        if (!activeSprint) return
        try {
            await updateSprint(ORG_ID, TEAM_ID, activeSprint.id, {
                status: 'completed',
                updatedAt: Timestamp.now()
            })
            setActiveSprint(null)
            toast({
                title: "Sprint Completed",
                description: "All tasks have been moved to the backlog or kept in their current state."
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to complete sprint.",
                variant: "destructive"
            })
        }
    }

    const handleStatusMove = (taskId: string, newStatus: string) => {
        onUpdateTask(taskId, "status", newStatus)
    }

    const getTasksByStatus = (status: string) => {
        return tasks.filter(t => (t.values.status || "To Do") === status || (status === "Backlog" && t.values.status === "To Do"))
    }

    const filteredTasks = tasks.filter(t =>
        (t.values.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const calculateProgress = () => {
        const done = tasks.filter(t => t.values.status === "Done").length
        return Math.round((done / (tasks.length || 1)) * 100)
    }

    const daysRemaining = activeSprint
        ? differenceInDays(activeSprint.endDate.toDate(), new Date())
        : 0

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {activeSprint ? activeSprint.name : "No Active Sprint"}
                        </h1>
                        {activeSprint && (
                            <Badge variant="outline" className="text-[10px] h-5 border-blue-500/20 text-blue-500 font-bold bg-blue-500/5 uppercase">
                                {activeSprint.status}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {activeSprint
                            ? `${format(activeSprint.startDate.toDate(), "MMM d")} - ${format(activeSprint.endDate.toDate(), "MMM d")} (${daysRemaining} days remaining)`
                            : "Start a sprint to begin tracking progress."
                        }
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {activeSprint ? (
                        <>
                            <div className="text-right space-y-1 mr-4">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Overall Progress</div>
                                <div className="flex items-center gap-3">
                                    <Progress value={calculateProgress()} className="w-24 h-2" />
                                    <span className="text-sm font-bold">{calculateProgress()}%</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleCompleteSprint}
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold text-xs uppercase tracking-wider"
                            >
                                Complete Sprint
                            </Button>
                        </>
                    ) : (
                        <SprintCreator onSprintCreate={handleCreateSprint} />
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2 border-y border-border/40">
                <div className="flex items-center gap-4 flex-grow max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search sprint tasks..."
                            className="pl-9 h-10 bg-muted/20 border-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 text-muted-foreground font-medium hover:text-foreground">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <div className="w-px h-6 bg-border/40 mx-2" />
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-grow overflow-x-auto pb-8">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="flex flex-col space-y-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${col.id === "Done" ? "bg-green-500/10 text-green-500" :
                                    col.id === "In Progress" ? "bg-orange-500/10 text-orange-500" :
                                        col.id === "Review" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                                    }`}>
                                    <col.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold tracking-tight">{col.label}</span>
                                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground/60 bg-muted/30 h-5 px-1.5">
                                    {filteredTasks.filter(t => (t.values.status === col.id) || (col.id === "Backlog" && t.values.status === "To Do")).length}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-grow space-y-3 p-2 rounded-2xl bg-muted/5 min-h-[500px]">
                            {filteredTasks.filter(t => (t.values.status === col.id) || (col.id === "Backlog" && t.values.status === "To Do")).map((task) => (
                                <Card key={task.id} className="p-4 border shadow-sm hover:shadow-md hover:border-accent/40 transition-all cursor-grab active:cursor-grabbing group">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-sm font-semibold leading-tight group-hover:text-accent transition-colors">
                                                {task.values.title || "Untitled Task"}
                                            </h4>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <MoreHorizontal className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {task.values.priority && (
                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 uppercase font-bold tracking-wider ${task.values.priority === "Critical" ? "border-red-500/50 text-red-500 bg-red-500/5" :
                                                    task.values.priority === "High" ? "border-orange-500/50 text-orange-500" : "text-muted-foreground/60"
                                                    }`}>
                                                    {task.values.priority}
                                                </Badge>
                                            )}
                                            <div className="flex gap-1">
                                                {(task.values.tags || []).slice(0, 1).map((tag: string) => (
                                                    <span key={tag} className="text-[10px] text-muted-foreground/60">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {task.values.progress > 0 && task.values.status !== "Done" && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                    <span>Progress</span>
                                                    <span>{task.values.progress}%</span>
                                                </div>
                                                <Progress value={task.values.progress} className="h-1" />
                                            </div>
                                        )}

                                        <div className="pt-2 flex items-center justify-between border-t border-border/50">
                                            <div className="flex items-center -space-x-1.5 overflow-hidden">
                                                {Array.isArray(task.values.assignee) && task.values.assignee.length > 0 ? (
                                                    task.values.assignee.map((name: string, i: number) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center text-[8px] font-extrabold text-blue-500 hover:z-10 transition-all">
                                                            {name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                                        </div>
                                                    ))
                                                ) : typeof task.values.assignee === "string" ? (
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center text-[8px] font-extrabold text-blue-500">
                                                        {task.values.assignee[0].toUpperCase()}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 opacity-40">
                                                        <UserIcon className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unassigned</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                {/* Simple status move buttons for now */}
                                                {col.id !== "Done" && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-6 w-6 rounded-md hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20"
                                                        onClick={() => {
                                                            const nextStatus = col.id === "Backlog" ? "In Progress" :
                                                                col.id === "In Progress" ? "Review" : "Done"
                                                            handleStatusMove(task.id, nextStatus)
                                                        }}
                                                    >
                                                        <ChevronRight className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {filteredTasks.filter(t => (t.values.status === col.id) || (col.id === "Backlog" && t.values.status === "To Do")).length === 0 && (
                                <div className="h-24 border-2 border-dashed rounded-2xl flex items-center justify-center text-xs text-muted-foreground/40 font-medium">
                                    Empty column
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
