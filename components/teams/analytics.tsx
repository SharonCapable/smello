"use client"

import React, { useState } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    TrendingDown,
    TrendingUp,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Filter
} from "lucide-react"

const BURNDOWN_DATA = [
    { day: "Day 1", ideal: 40, actual: 40 },
    { day: "Day 2", ideal: 35, actual: 38 },
    { day: "Day 3", ideal: 30, actual: 36 },
    { day: "Day 4", ideal: 25, actual: 30 },
    { day: "Day 5", ideal: 20, actual: 28 },
    { day: "Day 6", ideal: 15, actual: 20 },
    { day: "Day 7", ideal: 10, actual: 12 },
    { day: "Day 8", ideal: 5, actual: 5 },
    { day: "Day 9", ideal: 0, actual: 1 },
]

const VELOCITY_DATA = [
    { name: "Sprint 8", velocity: 32 },
    { name: "Sprint 9", velocity: 35 },
    { name: "Sprint 10", velocity: 28 },
    { name: "Sprint 11", velocity: 40 },
    { name: "Sprint 12", velocity: 38 },
]

const TEAM_CONTRIBUTION_DATA = [
    { name: "Sharon", points: 45, color: "#3b82f6" },
    { name: "Alex", points: 38, color: "#10b981" },
    { name: "Jordan", points: 32, color: "#f59e0b" },
    { name: "Taylor", points: 28, color: "#ef4444" },
    { name: "Riley", points: 22, color: "#8b5cf6" },
]

const WEEKLY_VELOCITY_DATA = [
    { day: "Mon", completed: 8, remaining: 32 },
    { day: "Tue", completed: 14, remaining: 26 },
    { day: "Wed", completed: 22, remaining: 18 },
    { day: "Thu", completed: 28, remaining: 12 },
    { day: "Fri", completed: 38, remaining: 2 },
]

type TimeRange = 'current-sprint' | 'last-sprint' | 'this-month' | 'last-month' | 'this-quarter'
type AnalyticsView = 'sprint' | 'team' | 'weekly'

export function TeamAnalytics() {
    const [timeRange, setTimeRange] = useState<TimeRange>('current-sprint')
    const [view, setView] = useState<AnalyticsView>('sprint')

    const timeRangeLabels: Record<TimeRange, string> = {
        'current-sprint': 'Current Sprint',
        'last-sprint': 'Last Sprint',
        'this-month': 'This Month',
        'last-month': 'Last Month',
        'this-quarter': 'This Quarter'
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Performance metrics and sprint health for Wizzle Engineering.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range Filter */}
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                        <SelectTrigger className="w-[180px] h-9">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current-sprint">Current Sprint</SelectItem>
                            <SelectItem value="last-sprint">Last Sprint</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                            <SelectItem value="this-quarter">This Quarter</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('sprint')}
                            className={`h-7 px-3 text-xs ${view === 'sprint' ? 'bg-background shadow-sm' : ''}`}
                        >
                            Sprint
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('team')}
                            className={`h-7 px-3 text-xs ${view === 'team' ? 'bg-background shadow-sm' : ''}`}
                        >
                            Team
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('weekly')}
                            className={`h-7 px-3 text-xs ${view === 'weekly' ? 'bg-background shadow-sm' : ''}`}
                        >
                            Weekly
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border">
                        <Clock className="w-3.5 h-3.5" />
                        Last Updated: 10 mins ago
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Avg. Velocity", value: "34.6", sub: "+12%", icon: Zap, color: "text-amber-500" },
                    { label: "Sprint Completion", value: "92%", sub: "High Health", icon: CheckCircle2, color: "text-green-500" },
                    { label: "Cycle Time", value: "4.2d", sub: "-0.5d", icon: TrendingDown, color: "text-blue-500" },
                    { label: "Blocked Tasks", value: "3", sub: "Action Required", icon: AlertCircle, color: "text-red-500" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/30 backdrop-blur-sm border-border/40 overflow-hidden group hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg bg-muted/50 group-hover:bg-background transition-colors`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold border-border/40">
                                    {stat.sub}
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                {stat.label}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Burndown Chart */}
                <Card className="bg-card/20 backdrop-blur-md border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-lg font-bold">Sprint Burndown</CardTitle>
                            <p className="text-xs text-muted-foreground">Remaining story points vs. timeline</p>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {timeRangeLabels[timeRange]}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={BURNDOWN_DATA}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="actual"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorActual)"
                                        name="Actual"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ideal"
                                        stroke="#888888"
                                        strokeDasharray="5 5"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Ideal"
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Velocity Chart */}
                <Card className="bg-card/20 backdrop-blur-md border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                        <div>
                            <CardTitle className="text-lg font-bold">Team Velocity</CardTitle>
                            <p className="text-xs text-muted-foreground">Story points completed per sprint</p>
                        </div>
                        <TrendIndicator value="+8.2" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={VELOCITY_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#88888810' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Bar
                                        dataKey="velocity"
                                        fill="#fbbf24"
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                        name="Points Completed"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Contribution Pie Chart - New Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/20 backdrop-blur-md border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Team Contribution</CardTitle>
                            <p className="text-xs text-muted-foreground">Story points by team member ({timeRangeLabels[timeRange]})</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center">
                            <div className="w-1/2">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={TEAM_CONTRIBUTION_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="points"
                                            nameKey="name"
                                        >
                                            {TEAM_CONTRIBUTION_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                            formatter={(value: number, name: string) => [`${value} points`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-3">
                                {TEAM_CONTRIBUTION_DATA.map((member, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: member.color }}
                                            />
                                            <span className="text-sm font-medium">{member.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{member.points}</span>
                                            <span className="text-xs text-muted-foreground">pts</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 mt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold">Total</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-accent">
                                                {TEAM_CONTRIBUTION_DATA.reduce((acc, m) => acc + m.points, 0)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Velocity */}
                <Card className="bg-card/20 backdrop-blur-md border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold">Weekly Velocity</CardTitle>
                            <p className="text-xs text-muted-foreground">Daily progress this week</p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">On Track</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEEKLY_VELOCITY_DATA}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888888' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCompleted)"
                                        name="Completed"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="remaining"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Remaining"
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function TrendIndicator({ value }: { value: string }) {
    const isPositive = value.startsWith("+")
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {value}%
        </div>
    )
}
