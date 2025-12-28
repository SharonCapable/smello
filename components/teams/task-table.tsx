"use client"

import React, { useState } from "react"
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
    Plus,
    MoreHorizontal,
    Calendar,
    Tag,
    User as UserIcon,
    GripVertical,
    Trash2,
    Share2
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

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

export interface Task {
    id: string
    values: Record<string, any>
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
}

const STATUS_OPTIONS = ["Backlog", "To Do", "In Progress", "Review", "Blocked", "Done"]
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"]

export function TaskTable({ tasks, columns, onUpdateTask, onAddTask, onDeleteTask, onPromoteTask, onAddColumn, onResizeColumn }: TaskTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)
    const [resizing, setResizing] = useState<string | null>(null)
    const [newColumnLabel, setNewColumnLabel] = useState("")

    const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
        setResizing(columnId)
        e.preventDefault()
    }

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return
            const col = columns.find(c => c.id === resizing)
            if (col && onResizeColumn) {
                // Simplified resizing logic: find the header element and calculate new width
                // For a production app, we'd use a more robust ref-based approach
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
        // ... (rest of renderCell remains the same)
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
            case "progress":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 w-full px-2 hover:bg-muted/50 justify-start">
                                <div className="flex items-center gap-2 w-full">
                                    <Progress value={value || 0} className="h-1.5 flex-1" />
                                    <span className="text-[10px] text-muted-foreground w-6">{value || 0}%</span>
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-4" align="start">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">Update Progress</span>
                                    <span className="text-xs text-muted-foreground">{value || 0}%</span>
                                </div>
                                <Slider
                                    max={100}
                                    step={5}
                                    value={[value || 0]}
                                    onValueChange={(val) => onUpdateTask(task.id, column.id, val[0])}
                                />
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
                                    <div className="flex items-center gap-2 group cursor-pointer hover:text-foreground transition-colors overflow-hidden">
                                        <span className="truncate">{col.label}</span>
                                        <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </div>

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
                    {tasks.map((task) => (
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
                                            <Calendar className="w-4 h-4" /> Set reminder
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
