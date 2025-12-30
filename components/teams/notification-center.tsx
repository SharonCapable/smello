"use client"

import React, { useState, useEffect } from "react"
import { Bell, X, CheckCircle2, AlertCircle, Info, Workflow, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { subscribeToProjectActivities, ActivityLogDoc } from "@/lib/firestore-service"

interface NotificationCenterProps {
    projectIds?: string[]
    userId?: string
}

const NOTIFICATION_ICONS = {
    created: Info,
    updated: Info,
    completed: CheckCircle2,
    commented: Users,
    status_changed: AlertCircle,
    stage_advanced: Workflow,
}

const NOTIFICATION_COLORS = {
    created: 'text-blue-600 bg-blue-500/10',
    updated: 'text-purple-600 bg-purple-500/10',
    completed: 'text-green-600 bg-green-500/10',
    commented: 'text-orange-600 bg-orange-500/10',
    status_changed: 'text-yellow-600 bg-yellow-500/10',
    stage_advanced: 'text-accent bg-accent/10',
}

export function NotificationCenter({ projectIds = [], userId }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<ActivityLogDoc[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
    const [isOpen, setIsOpen] = useState(false)

    // Subscribe to activities for all projects
    useEffect(() => {
        if (projectIds.length === 0) return

        const unsubscribers = projectIds.map(projectId =>
            subscribeToProjectActivities(projectId, (activities) => {
                setNotifications(prev => {
                    // Merge new activities with existing ones, avoiding duplicates
                    const activityMap = new Map(prev.map(a => [a.id, a]))
                    activities.forEach(activity => {
                        activityMap.set(activity.id, activity)
                    })
                    return Array.from(activityMap.values()).sort((a, b) => {
                        const aTime = (a.createdAt as any).toMillis()
                        const bTime = (b.createdAt as any).toMillis()
                        return bTime - aTime
                    })
                })
            })
        )

        return () => {
            unsubscribers.forEach(unsub => unsub())
        }
    }, [projectIds])

    // Calculate unread count
    useEffect(() => {
        const unread = notifications.filter(n => !readNotifications.has(n.id)).length
        setUnreadCount(unread)
    }, [notifications, readNotifications])

    const handleMarkAsRead = (notificationId: string) => {
        setReadNotifications(prev => new Set(prev).add(notificationId))
    }

    const handleMarkAllAsRead = () => {
        setReadNotifications(new Set(notifications.map(n => n.id)))
    }

    const handleClearAll = () => {
        setNotifications([])
        setReadNotifications(new Set())
    }

    const getTimeAgo = (timestamp: any) => {
        const now = Date.now()
        const time = timestamp.toMillis()
        const diff = now - time

        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 p-0"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="h-8 text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                You'll see updates about your projects here
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const isUnread = !readNotifications.has(notification.id)
                                const Icon = NOTIFICATION_ICONS[notification.action] || Info
                                const colorClass = NOTIFICATION_COLORS[notification.action] || 'text-muted-foreground bg-muted'

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                                            isUnread && "bg-accent/5"
                                        )}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium leading-tight">
                                                        {notification.details || notification.action}
                                                    </p>
                                                    {isUnread && (
                                                        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{notification.userName}</span>
                                                    <span>•</span>
                                                    <span>{getTimeAgo(notification.createdAt)}</span>
                                                </div>
                                                {notification.entityType && (
                                                    <Badge variant="outline" className="text-[10px] mt-1">
                                                        {notification.entityType}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
