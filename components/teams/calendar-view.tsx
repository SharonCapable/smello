"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    Video,
    MoreHorizontal,
    Plus,
    Globe,
    Mail,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon
} from "lucide-react"

const UPCOMING_EVENTS = [
    { id: 1, title: "Product Sync: Q1 Roadmap", time: "10:00 AM - 11:00 AM", type: "Internal", platform: "Google Meet", color: "bg-blue-500" },
    { id: 2, title: "Client Discovery: Acme Corp", time: "1:30 PM - 2:30 PM", type: "External", platform: "Microsoft Teams", color: "bg-purple-500" },
    { id: 3, title: "Design Feedback Session", time: "4:00 PM - 5:00 PM", type: "Review", platform: "Zoom", color: "bg-amber-500" },
]

export function CalendarView() {
    const [date, setDate] = useState<Date | undefined>(new Date())

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
                    <Button variant="outline" size="sm" className="gap-2 border-accent/20 hover:bg-accent/5 text-xs font-bold uppercase tracking-wider">
                        <Globe className="w-3.5 h-3.5" />
                        Sync Google
                    </Button>
                    <Button size="sm" className="gap-2 shadow-lg shadow-accent/20 text-xs font-bold uppercase tracking-wider">
                        <Plus className="w-3.5 h-3.5" />
                        New Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Calendar Widget */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-card/20 backdrop-blur-md border-border/40 overflow-hidden">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-none p-4"
                        />
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
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="font-bold text-lg flex items-center gap-2">
                            {date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-none text-[10px] font-bold">Today</Badge>
                        </div>
                        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {UPCOMING_EVENTS.map((event) => (
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

                        <Button variant="outline" className="w-full h-12 border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all group">
                            <Plus className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" />
                            Add Schedule Block
                        </Button>
                    </div>

                    {/* Empty State for Evening */}
                    <div className="pt-8 text-center space-y-3 opacity-40">
                        <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium italic">No events scheduled for the evening</p>
                    </div>
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
