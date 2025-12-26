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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    ChevronDown,
    Plus,
    MoreHorizontal,
    Calendar,
    Tag,
    User as UserIcon,
    GripVertical
} from "lucide-react"

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
}

export function TaskTable({ tasks, columns, onUpdateTask, onAddTask }: TaskTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)

    const renderCell = (task: Task, column: Column) => {
        const value = task.values[column.id]

        switch (column.type) {
            case "status":
                return (
                    <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent">
                        {value || "To Do"}
                    </Badge>
                )
            case "priority":
                return (
                    <span className={`text-xs font-medium ${value === "High" ? "text-red-500" :
                            value === "Medium" ? "text-yellow-500" : "text-muted-foreground"
                        }`}>
                        {value || "Medium"}
                    </span>
                )
            case "progress":
                return (
                    <div className="flex items-center gap-2 w-full max-w-[100px]">
                        <Progress value={value || 0} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground">{value || 0}%</span>
                    </div>
                )
            case "tags":
                return (
                    <div className="flex gap-1 flex-wrap">
                        {(value || []).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )
            case "assignee":
                return (
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs">{value || "Unassigned"}</span>
                    </div>
                )
            default:
                return (
                    <Input
                        value={value || ""}
                        onChange={(e) => onUpdateTask(task.id, column.id, e.target.value)}
                        className="border-none bg-transparent shadow-none h-8 px-1 focus-visible:ring-1 focus-visible:ring-accent/50 text-sm"
                        placeholder="..."
                    />
                )
        }
    }

    return (
        <div className="rounded-md border bg-card/30 backdrop-blur-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-8 px-2"></TableHead>
                        {columns.map((col) => (
                            <TableHead key={col.id} style={{ width: col.width }} className="text-xs font-semibold py-2">
                                <div className="flex items-center gap-2 group">
                                    {col.label}
                                    <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="w-10">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Plus className="w-3 h-3" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            onMouseEnter={() => setHoveredRow(task.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                            <TableCell className="px-2 w-8">
                                <GripVertical className={`w-3 h-3 text-muted-foreground/30 ${hoveredRow === task.id ? "opacity-100" : "opacity-0"} transition-opacity cursor-grab`} />
                            </TableCell>
                            {columns.map((col) => (
                                <TableCell key={col.id} className="py-1 px-3">
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
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Move to Collaboration</DropdownMenuItem>
                                        <DropdownMenuItem>Add to Sprint</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow
                        className="cursor-pointer hover:bg-muted/20"
                        onClick={onAddTask}
                    >
                        <TableCell colSpan={columns.length + 2} className="py-3 px-10 text-sm text-muted-foreground flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add a task...
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
