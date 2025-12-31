"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Clock,
    Video,
    MoreHorizontal,
    Plus,
    Globe,
    Mail,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Users,
    Trash2,
    X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, addDays } from "date-fns"

interface CalendarEvent {
    id: number
    title: string
    time: string
    type: string
    platform: string
    color: string
    attendees?: string[]
    description?: string
}

const INITIAL_EVENTS: CalendarEvent[] = [
    { id: 1, title: "Product Sync: Q1 Roadmap", time: "10:00 AM - 11:00 AM", type: "Internal", platform: "Google Meet", color: "bg-blue-500", attendees: ["Sharon", "Alex", "Jordan"] },
    { id: 2, title: "Client Discovery: Acme Corp", time: "1:30 PM - 2:30 PM", type: "External", platform: "Microsoft Teams", color: "bg-purple-500", attendees: ["Sharon", "Taylor"] },
    { id: 3, title: "Design Feedback Session", time: "4:00 PM - 5:00 PM", type: "Review", platform: "Zoom", color: "bg-amber-500", attendees: ["Sharon"] },
]

const TEAM_MEMBERS = ["Sharon", "Alex", "Jordan", "Taylor", "Riley", "Morgan", "Casey", "Drew"]

export function CalendarView() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
    const [isNewEventOpen, setIsNewEventOpen] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        type: "Internal",
        platform: "Google Meet",
        description: "",
        attendees: [] as string[]
    })
    const { toast } = useToast()

    const handleCreateEvent = () => {
        if (!newEvent.title.trim()) {
            toast({
                title: "Error",
                description: "Please enter an event title",
                variant: "destructive"
            })
            return
        }

        const event: CalendarEvent = {
            id: Date.now(),
            title: newEvent.title,
            time: `${newEvent.startTime} - ${newEvent.endTime}`,
            type: newEvent.type,
            platform: newEvent.platform,
            color: newEvent.type === "Internal" ? "bg-blue-500" : newEvent.type === "External" ? "bg-purple-500" : "bg-amber-500",
            attendees: newEvent.attendees,
            description: newEvent.description
        }

        setEvents([...events, event])
        setNewEvent({
            title: "",
            startTime: "09:00",
            endTime: "10:00",
            type: "Internal",
            platform: "Google Meet",
            description: "",
            attendees: []
        })
        setIsNewEventOpen(false)
        toast({
            title: "Event Created",
            description: `"${event.title}" has been added to your calendar`,
        })
    }

    const handleAddAttendee = (attendee: string) => {
        if (!newEvent.attendees.includes(attendee)) {
            setNewEvent(prev => ({
                ...prev,
                attendees: [...prev.attendees, attendee]
            }))
        }
    }

    const handleRemoveAttendee = (attendee: string) => {
        setNewEvent(prev => ({
            ...prev,
            attendees: prev.attendees.filter(a => a !== attendee)
        }))
    }

    const handleSyncGoogle = () => {
        toast({
            title: "Syncing with Google Calendar",
            description: "Connecting to your Google account...",
        })
        // In real implementation, this would trigger OAuth flow
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        if (date) {
            setDate(addDays(date, direction === 'next' ? 1 : -1))
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
                    <p className="text-muted-foreground mt-1">
                        Unified view of your personal and team events.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncGoogle}
                        className="gap-2 border-accent/20 hover:bg-accent/5 text-xs font-bold uppercase tracking-wider"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Sync Google
                    </Button>
                    <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 shadow-lg shadow-accent/20 text-xs font-bold uppercase tracking-wider">
                                <Plus className="w-3.5 h-3.5" />
                                New Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>
                                    Add a new event to your calendar. You can invite team members.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter event title..."
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-time">Start Time</Label>
                                        <Input
                                            id="start-time"
                                            type="time"
                                            value={newEvent.startTime}
                                            onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-time">End Time</Label>
                                        <Input
                                            id="end-time"
                                            type="time"
                                            value={newEvent.endTime}
                                            onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Event Type</Label>
                                        <Select
                                            value={newEvent.type}
                                            onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Internal">Internal</SelectItem>
                                                <SelectItem value="External">External</SelectItem>
                                                <SelectItem value="Review">Review</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <Select
                                            value={newEvent.platform}
                                            onValueChange={(value) => setNewEvent(prev => ({ ...prev, platform: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Google Meet">Google Meet</SelectItem>
                                                <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                                                <SelectItem value="Zoom">Zoom</SelectItem>
                                                <SelectItem value="In Person">In Person</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Invite Attendees</Label>
                                    <Select onValueChange={handleAddAttendee}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Add team members..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TEAM_MEMBERS.filter(m => !newEvent.attendees.includes(m)).map(member => (
                                                <SelectItem key={member} value={member}>{member}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {newEvent.attendees.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {newEvent.attendees.map(attendee => (
                                                <Badge key={attendee} variant="secondary" className="gap-1">
                                                    {attendee}
                                                    <button onClick={() => handleRemoveAttendee(attendee)}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Add event details..."
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsNewEventOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateEvent}>Create Event</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Calendar Widget - Made Bigger */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="bg-card/20 backdrop-blur-md border-border/40 overflow-hidden">
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border-none p-6 w-full"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "text-lg font-bold",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full",
                                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem]",
                                    row: "flex w-full mt-2",
                                    cell: "h-12 w-full text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/20 rounded-lg mx-auto flex items-center justify-center",
                                    day_range_end: "day-range-end",
                                    day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    day_today: "bg-accent/20 text-accent-foreground font-bold",
                                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/20 backdrop-blur-md border-border/40">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Integrations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <IntegrationButton
                                icon={<div className="w-2 h-2 rounded-full bg-blue-500" />}
                                label="Google Calendar"
                                status="Connected"
                            />
                            <IntegrationButton
                                icon={<div className="w-2 h-2 rounded-full bg-purple-500" />}
                                label="Microsoft Teams"
                                status="Pending"
                            />
                            <IntegrationButton
                                icon={<div className="w-2 h-2 rounded-full bg-green-500" />}
                                label="Zoom"
                                status="Disconnected"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Agenda */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="font-bold text-lg flex items-center gap-2">
                            {date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            {date && format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                                <Badge variant="secondary" className="bg-accent/10 text-accent border-none text-[10px] font-bold">Today</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate('prev')}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate('next')}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {events.map((event) => (
                            <Card key={event.id} className="bg-card/30 backdrop-blur-sm border-border/40 group hover:border-accent/30 hover:bg-card/50 transition-all cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-6">
                                    <div className="flex flex-col items-center justify-center min-w-[80px] py-1 border-r border-border/40">
                                        <div className="text-xl font-bold">{event.time.split(':')[0]}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                            {event.time.split(' ')[1]}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${event.color}`} />
                                            <h3 className="font-bold text-sm tracking-tight">{event.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5 leading-none">
                                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                                {event.time}
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <div className="flex items-center gap-1.5 leading-none">
                                                <Video className="w-3.5 h-3.5 opacity-60" />
                                                {event.platform}
                                            </div>
                                        </div>
                                        {event.attendees && event.attendees.length > 0 && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                <div className="flex -space-x-1.5">
                                                    {event.attendees.slice(0, 3).map((attendee, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-6 h-6 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center text-[8px] font-bold text-blue-500"
                                                            title={attendee}
                                                        >
                                                            {attendee[0]}
                                                        </div>
                                                    ))}
                                                    {event.attendees.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                                            +{event.attendees.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-500 text-white border-none hover:bg-blue-600 font-bold uppercase tracking-wider">
                                            Join Now
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all group"
                            onClick={() => setIsNewEventOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" />
                            Add Schedule Block
                        </Button>
                    </div>

                    {/* Empty State for Evening */}
                    {events.length === 0 && (
                        <div className="pt-8 text-center space-y-3 opacity-40">
                            <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-medium italic">No events scheduled for this day</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function IntegrationButton({ icon, label, status }: { icon: React.ReactNode, label: string, status: string }) {
    return (
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-xs font-semibold">{label}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${status === "Connected" ? "text-green-500" :
                status === "Pending" ? "text-amber-500" : "text-muted-foreground"
                }`}>
                {status}
            </span>
        </button>
    )
}
