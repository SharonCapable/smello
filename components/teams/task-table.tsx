"use client"

import React, { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    ChevronDown,
    ChevronUp,
    Plus,
    MoreHorizontal,
    Calendar as CalendarIcon,
    Tag,
    User as UserIcon,
    GripVertical,
    Trash2,
    Share2,
    ExternalLink,
    Link as LinkIcon,
    CheckSquare,
    Square,
    ListTodo
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isValid } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"

export type ColumnType =
    | "text"
    | "status"
    | "progress"
    | "priority"
    | "date"
    | "url"
    | "tags"
    | "assignee"
    | "number"

export interface Column {
    id: string
    label: string
    type: ColumnType
    width?: number
}

export interface Subtask {
    id: string
    title: string
    completed: boolean
}

export interface Task {
    id: string
    values: Record<string, any>
    subtasks?: Subtask[]
}

interface TaskTableProps {
    tasks: Task[]
    columns: Column[]
    onUpdateTask: (taskId: string, fieldId: string, value: any) => void
    onAddTask: () => void
    onDeleteTask?: (taskId: string) => void
    onPromoteTask?: (taskId: string) => void
    onAddColumn?: (label: string, type: ColumnType) => void
    onResizeColumn?: (columnId: string, width: number) => void
    onUpdateSubtasks?: (taskId: string, subtasks: Subtask[]) => void
}

const STATUS_OPTIONS = ["Backlog", "To Do", "In Progress", "Review", "Blocked", "Done"]
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"]

type SortConfig = {
    column: string | null
    direction: 'asc' | 'desc'
}

export function TaskTable({ tasks, columns, onUpdateTask, onAddTask, onDeleteTask, onPromoteTask, onAddColumn, onResizeColumn, onUpdateSubtasks }: TaskTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)
    const [resizing, setResizing] = useState<string | null>(null)
    const [newColumnLabel, setNewColumnLabel] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' })
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set())
    const [newSubtaskText, setNewSubtaskText] = useState<Record<string, string>>({})

    // Sorting logic
    const sortedTasks = useMemo(() => {
        if (!sortConfig.column) return tasks

        return [...tasks].sort((a, b) => {
            const aVal = a.values[sortConfig.column!]
            const bVal = b.values[sortConfig.column!]

            // Handle undefined/null values
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1
            if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1

            // Handle different types
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const result = aVal.localeCompare(bVal)
                return sortConfig.direction === 'asc' ? result : -result
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
            }

            // Priority sorting
            if (sortConfig.column === 'priority') {
                const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
                const aOrder = priorityOrder[aVal as keyof typeof priorityOrder] || 0
                const bOrder = priorityOrder[bVal as keyof typeof priorityOrder] || 0
                return sortConfig.direction === 'asc' ? aOrder - bOrder : bOrder - aOrder
            }

            // Status sorting
            if (sortConfig.column === 'status') {
                const statusOrder = { 'Done': 6, 'Review': 5, 'In Progress': 4, 'To Do': 3, 'Backlog': 2, 'Blocked': 1 }
                const aOrder = statusOrder[aVal as keyof typeof statusOrder] || 0
                const bOrder = statusOrder[bVal as keyof typeof statusOrder] || 0
                return sortConfig.direction === 'asc' ? aOrder - bOrder : bOrder - aOrder
            }

            return 0
        })
    }, [tasks, sortConfig])

    const handleSort = (columnId: string) => {
        setSortConfig(prev => ({
            column: columnId,
            direction: prev.column === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
        setResizing(columnId)
        e.preventDefault()
    }

    const toggleSubtasks = (taskId: string) => {
        setExpandedSubtasks(prev => {
            const newSet = new Set(prev)
            if (newSet.has(taskId)) {
                newSet.delete(taskId)
            } else {
                newSet.add(taskId)
            }
            return newSet
        })
    }

    const handleAddSubtask = (taskId: string) => {
        const text = newSubtaskText[taskId]?.trim()
        if (!text) return

        const task = tasks.find(t => t.id === taskId)
        const newSubtask: Subtask = {
            id: `subtask_${Date.now()}`,
            title: text,
            completed: false
        }
        const updatedSubtasks = [...(task?.subtasks || []), newSubtask]

        if (onUpdateSubtasks) {
            onUpdateSubtasks(taskId, updatedSubtasks)
        }

        // Calculate new progress based on subtasks
        const completedCount = updatedSubtasks.filter(s => s.completed).length
        const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
        onUpdateTask(taskId, 'progress', newProgress)

        setNewSubtaskText(prev => ({ ...prev, [taskId]: '' }))
    }

    const handleToggleSubtask = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task?.subtasks) return

        const updatedSubtasks = task.subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        )

        if (onUpdateSubtasks) {
            onUpdateSubtasks(taskId, updatedSubtasks)
        }

        // Calculate new progress based on subtasks
        const completedCount = updatedSubtasks.filter(s => s.completed).length
        const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
        onUpdateTask(taskId, 'progress', newProgress)
    }

    const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task?.subtasks) return

        const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId)

        if (onUpdateSubtasks) {
            onUpdateSubtasks(taskId, updatedSubtasks)
        }

        // Recalculate progress
        if (updatedSubtasks.length > 0) {
            const completedCount = updatedSubtasks.filter(s => s.completed).length
            const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
            onUpdateTask(taskId, 'progress', newProgress)
        }
    }

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return
            const col = columns.find(c => c.id === resizing)
            if (col && onResizeColumn) {
                const header = document.getElementById(`header-${resizing}`)
                if (header) {
                    const rect = header.getBoundingClientRect()
                    const newWidth = Math.max(100, e.clientX - rect.left)
                    onResizeColumn(resizing, newWidth)
                }
            }
        }

        const handleMouseUp = () => {
            setResizing(null)
        }

        if (resizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [resizing, columns, onResizeColumn])

    const renderCell = (task: Task, column: Column) => {
        const value = task.values[column.id]

        switch (column.type) {
            case "status":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 justify-start font-normal hover:bg-muted/50 w-full px-2">
                                <Badge variant="outline" className={`
                   ${value === "Done" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        value === "In Progress" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            value === "Blocked" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                "bg-accent/10 border-accent/20 text-accent"}
                `}>
                                    {value || "To Do"}
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-1" align="start">
                            {STATUS_OPTIONS.map(opt => (
                                <Button
                                    key={opt}
                                    variant="ghost"
                                    className="w-full justify-start text-xs h-8"
                                    onClick={() => onUpdateTask(task.id, column.id, opt)}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </PopoverContent>
                    </Popover>
                )
            case "priority":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 justify-start font-normal hover:bg-muted/50 w-full px-2">
                                <span className={`text-xs font-medium ${value === "Critical" ? "text-red-600" :
                                    value === "High" ? "text-red-500" :
                                        value === "Medium" ? "text-yellow-600" : "text-muted-foreground"
                                    }`}>
                                    {value || "Medium"}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-1" align="start">
                            {PRIORITY_OPTIONS.map(opt => (
                                <Button
                                    key={opt}
                                    variant="ghost"
                                    className="w-full justify-start text-xs h-8"
                                    onClick={() => onUpdateTask(task.id, column.id, opt)}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </PopoverContent>
                    </Popover>
                )
            case "date":
                const dateValue = value ? (typeof value === 'string' ? parseISO(value) : value) : undefined
                const isValidDate = dateValue && isValid(dateValue)
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 justify-start font-normal hover:bg-muted/50 w-full px-2 gap-2">
                                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className={`text-xs ${isValidDate ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {isValidDate ? format(dateValue, 'MMM d, yyyy') : 'Set date'}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={isValidDate ? dateValue : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        onUpdateTask(task.id, column.id, format(date, 'yyyy-MM-dd'))
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )
            case "url":
                const urlValue = value || ''
                const isValidUrl = urlValue && (urlValue.startsWith('http://') || urlValue.startsWith('https://'))
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 justify-start font-normal hover:bg-muted/50 w-full px-2 gap-2">
                                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                {isValidUrl ? (
                                    <a
                                        href={urlValue}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-500 hover:text-blue-600 hover:underline truncate flex items-center gap-1"
                                    >
                                        {urlValue.replace(/^https?:\/\//, '').slice(0, 25)}...
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Add link</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3" align="start">
                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">URL</div>
                                <Input
                                    placeholder="https://example.com"
                                    value={urlValue}
                                    onChange={(e) => onUpdateTask(task.id, column.id, e.target.value)}
                                    className="h-9 text-xs"
                                />
                                {isValidUrl && (
                                    <a
                                        href={urlValue}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open link
                                    </a>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )
            case "progress":
                const subtasks = task.subtasks || []
                const completedSubtasks = subtasks.filter(s => s.completed).length
                const progressValue = subtasks.length > 0
                    ? Math.round((completedSubtasks / subtasks.length) * 100)
                    : (value || 0)
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 w-full px-2 hover:bg-muted/50 justify-start">
                                <div className="flex items-center gap-2 w-full">
                                    <Progress value={progressValue} className="h-1.5 flex-1" />
                                    <span className="text-[10px] text-muted-foreground w-10 text-right">
                                        {subtasks.length > 0 ? `${completedSubtasks}/${subtasks.length}` : `${progressValue}%`}
                                    </span>
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4" align="start">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium flex items-center gap-2">
                                        <ListTodo className="w-4 h-4" />
                                        Subtasks
                                    </span>
                                    <span className="text-xs text-muted-foreground">{progressValue}%</span>
                                </div>

                                {subtasks.length > 0 && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {subtasks.map(subtask => (
                                            <div key={subtask.id} className="flex items-center gap-2 group">
                                                <Checkbox
                                                    checked={subtask.completed}
                                                    onCheckedChange={() => handleToggleSubtask(task.id, subtask.id)}
                                                />
                                                <span className={`text-xs flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                    {subtask.title}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add subtask..."
                                        value={newSubtaskText[task.id] || ''}
                                        onChange={(e) => setNewSubtaskText(prev => ({ ...prev, [task.id]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddSubtask(task.id)
                                            }
                                        }}
                                        className="h-8 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        className="h-8"
                                        onClick={() => handleAddSubtask(task.id)}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>

                                {subtasks.length === 0 && (
                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">Manual Progress</span>
                                            <span className="text-xs text-muted-foreground">{value || 0}%</span>
                                        </div>
                                        <Slider
                                            max={100}
                                            step={5}
                                            value={[value || 0]}
                                            onValueChange={(val) => onUpdateTask(task.id, column.id, val[0])}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                )
            case "tags":
                return (
                    <div className="flex gap-1 flex-wrap px-2">
                        {(value || []).length > 0 ? (value || []).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {tag}
                            </Badge>
                        )) : (
                            <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                <Plus className="w-3 h-3 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                )
            case "assignee":
                const assignees = Array.isArray(value) ? value : (value ? [value] : []);
                return (
                    <div className="flex items-center -space-x-2 px-3 overflow-hidden group/assignee">
                        {assignees.length > 0 ? assignees.map((name: string, i: number) => (
                            <TooltipProvider key={i}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center text-[8px] font-extrabold text-blue-500 cursor-pointer hover:z-10 transition-all">
                                            {name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-[10px] font-bold uppercase tracking-wider">{name}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )) : (
                            <div className="flex items-center gap-1.5 opacity-40">
                                <UserIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pt-0.5">Unassigned</span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-6 h-6 p-0 rounded-full opacity-0 group-hover/assignee:opacity-100 hover:bg-muted ml-2 transition-all"
                        >
                            <Plus className="w-3 h-3 text-muted-foreground" />
                        </Button>
                    </div>
                )
            default:
                return (
                    <Input
                        value={value || ""}
                        onChange={(e) => onUpdateTask(task.id, column.id, e.target.value)}
                        className="border-none bg-transparent shadow-none h-8 px-2 focus-visible:ring-1 focus-visible:ring-accent/50 text-sm w-full truncate"
                        placeholder="..."
                    />
                )
        }
    }

    return (
        <div className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <Table className="table-fixed">
                <TableHeader className="bg-muted/30 border-b border-border/40">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-10 px-0"></TableHead>
                        {columns.map((col) => (
                            <TableHead
                                key={col.id}
                                id={`header-${col.id}`}
                                style={{ width: col.width || 200 }}
                                className="text-[10px] font-bold py-3 uppercase tracking-[0.15em] text-muted-foreground/60 relative group px-4"
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => handleSort(col.id)}
                                        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors overflow-hidden"
                                    >
                                        <span className="truncate">{col.label}</span>
                                        {sortConfig.column === col.id ? (
                                            sortConfig.direction === 'asc' ? (
                                                <ChevronUp className="w-3 h-3 text-accent" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3 text-accent" />
                                            )
                                        ) : (
                                            <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                        )}
                                    </button>

                                    {/* Resizer */}
                                    <div
                                        onMouseDown={(e) => handleMouseDown(e, col.id)}
                                        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/50 transition-colors ${resizing === col.id ? "bg-accent" : ""}`}
                                    />
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="w-12 px-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/20 text-muted-foreground">
                                        <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3 shadow-xl border-accent/10" align="end">
                                    <div className="space-y-3">
                                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Add Column</div>
                                        <Input
                                            placeholder="Column Name"
                                            className="h-8 text-xs bg-muted/30 border-none"
                                            value={newColumnLabel}
                                            onChange={(e) => setNewColumnLabel(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {(["text", "status", "priority", "tags", "date"] as ColumnType[]).map(type => (
                                                <Button
                                                    key={type}
                                                    variant="secondary"
                                                    className="text-[10px] h-7 justify-start px-2 bg-muted/40 hover:bg-muted font-bold uppercase tracking-wider"
                                                    onClick={() => {
                                                        if (newColumnLabel && onAddColumn) {
                                                            onAddColumn(newColumnLabel, type)
                                                            setNewColumnLabel("")
                                                        }
                                                    }}
                                                >
                                                    {type}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTasks.map((task) => (
                        <TableRow
                            key={task.id}
                            onMouseEnter={() => setHoveredRow(task.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="group border-b border-border/50 hover:bg-muted/20 transition-all duration-200"
                        >
                            <TableCell className="px-2 w-8">
                                <GripVertical className={`w-3 h-3 text-muted-foreground/30 ${hoveredRow === task.id ? "opacity-100" : "opacity-0"} transition-opacity cursor-grab active:cursor-grabbing`} />
                            </TableCell>
                            {columns.map((col) => (
                                <TableCell key={col.id} className="py-0.5 px-0 align-middle">
                                    {renderCell(task, col)}
                                </TableCell>
                            ))}
                            <TableCell className="w-10 px-2 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className={`h-6 w-6 ${hoveredRow === task.id ? "opacity-100" : "opacity-0"} transition-opacity`}>
                                            <MoreHorizontal className="w-3 h-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => onPromoteTask?.(task.id)}
                                        >
                                            <Share2 className="w-4 h-4" /> Move to Collaboration
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2">
                                            <Plus className="w-4 h-4" /> Add subtask
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2">
                                            <MoreHorizontal className="w-4 h-4" /> Change status
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2">
                                            <CalendarIcon className="w-4 h-4" /> Set reminder
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive gap-2"
                                            onClick={() => onDeleteTask?.(task.id)}
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete task
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow
                        className="cursor-pointer hover:bg-muted/10 group/add"
                        onClick={onAddTask}
                    >
                        <TableCell colSpan={columns.length + 2} className="py-4 px-10 text-sm text-muted-foreground group-hover/add:text-foreground transition-colors">
                            <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-muted-foreground/50 group-hover/add:text-accent transition-colors" />
                                Add a task...
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
