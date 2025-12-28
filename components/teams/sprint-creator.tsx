"use client"

import React, { useState } from "react"
import { Calendar as CalendarIcon, Plus, Target, Rocket } from "lucide-react"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SprintCreatorProps {
    onSprintCreate: (sprint: {
        name: string;
        goal: string;
        startDate: Date;
        endDate: Date;
    }) => void;
    trigger?: React.ReactNode;
}

export function SprintCreator({ onSprintCreate, trigger }: SprintCreatorProps) {
    const [name, setName] = useState("")
    const [goal, setGoal] = useState("")
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [open, setOpen] = useState(false)

    const handleCreate = () => {
        if (!name || !startDate || !endDate) return

        onSprintCreate({
            name,
            goal,
            startDate,
            endDate
        })
        setOpen(false)
        // Reset form
        setName("")
        setGoal("")
        setStartDate(undefined)
        setEndDate(undefined)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold text-xs uppercase tracking-wider gap-2">
                        <Plus className="w-4 h-4" /> Start New Sprint
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Create New Sprint</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Define your next sprint objectives and timeframe to keep the team aligned.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sprint Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Sprint 13 - Core Engine"
                            className="bg-muted/30 border-none h-12 text-base focus-visible:ring-blue-500/30"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "h-12 justify-start text-left font-normal bg-muted/30 border-none hover:bg-muted/50",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "h-12 justify-start text-left font-normal bg-muted/30 border-none hover:bg-muted/50",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Target className="w-3 h-3" /> Sprint Goal
                        </Label>
                        <Textarea
                            id="goal"
                            placeholder="What do we want to achieve in this sprint?"
                            className="bg-muted/30 border-none min-h-[100px] text-sm focus-visible:ring-blue-500/30"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold text-sm uppercase tracking-widest"
                        onClick={handleCreate}
                        disabled={!name || !startDate || !endDate}
                    >
                        Initialize Sprint
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
