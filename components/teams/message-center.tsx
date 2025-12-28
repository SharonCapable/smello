"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Mail,
    MessageSquare,
    Search,
    Filter,
    Star,
    Trash2,
    Archive,
    Menu,
    ChevronRight,
    Circle,
    UserCircle,
    Send
} from "lucide-react"

const INBOX_DATA = [
    { id: 1, sender: "Alex Rivera", subject: "Review: Q4 Strategy Doc", snippet: "Hey, I've updated the roadmap for next year. Can you take a look?", time: "2m ago", unread: true, tags: ["Engineering"] },
    { id: 2, sender: "Jordan Smith", subject: "New Feature Feedback", snippet: "The new dashboard looks great! Just a few thoughts on the sizing...", time: "1h ago", unread: true, tags: ["Design"] },
    { id: 3, sender: "GitHub", subject: "Merged: feat/auth-bridge", snippet: "PR #242 has been successfully merged into main.", time: "4h ago", unread: false, tags: ["System"] },
    { id: 4, sender: "Slack Notifications", subject: "New mention in #smello-dev", snippet: "Taylor tagged you: @sharon can you check this?", time: "Yesterday", unread: false, tags: ["Internal"] },
]

export function MessageCenter() {
    const [activeTab, setActiveTab] = useState("inbox")
    const [selectedEmail, setSelectedEmail] = useState(INBOX_DATA[0])

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-fade-in max-w-7xl mx-auto overflow-hidden">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
                    <p className="text-muted-foreground mt-1">
                        Unified inbox for emails, mentions, and system alerts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-accent/20 hover:bg-accent/5 text-xs font-bold uppercase tracking-wider">
                        <Mail className="w-4 h-4" />
                        Sync All Providers
                    </Button>
                    <Button size="sm" className="h-9 px-4 shadow-lg shadow-accent/20 text-xs font-bold uppercase tracking-wider">
                        <Send className="w-4 h-4 mr-2" />
                        Compose
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden border border-border/40 rounded-2xl bg-card/20 backdrop-blur-md flex shadow-2xl">
                {/* Sidebar */}
                <aside className="w-[80px] lg:w-[240px] border-r border-border/40 bg-muted/10 p-4 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <SidebarItem icon={Mail} label="Inbox" active={activeTab === "inbox"} badge="2" onClick={() => setActiveTab("inbox")} />
                        <SidebarItem icon={MessageSquare} label="Mentions" active={activeTab === "mentions"} onClick={() => setActiveTab("mentions")} />
                        <SidebarItem icon={Star} label="Starred" active={activeTab === "starred"} onClick={() => setActiveTab("starred")} />
                        <SidebarItem icon={Archive} label="Archive" active={activeTab === "archive"} onClick={() => setActiveTab("archive")} />
                        <SidebarItem icon={Trash2} label="Trash" active={activeTab === "trash"} onClick={() => setActiveTab("trash")} />
                    </div>

                    <div className="mt-auto p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2 hidden lg:block">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Storage</div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-[45%] bg-accent rounded-full" />
                        </div>
                        <div className="text-[10px] text-muted-foreground">4.5 GB / 10 GB (45%)</div>
                    </div>
                </aside>

                {/* Email List */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-4 border-b border-border/40 flex items-center gap-4 bg-muted/5">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <Input placeholder="Search messages..." className="pl-10 h-10 border-none bg-muted/20 ring-offset-background text-sm" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Filter className="w-4 h-4" /></Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {INBOX_DATA.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
                                className={`p-4 border-b border-border/30 cursor-pointer transition-all flex gap-4 ${selectedEmail?.id === email.id ? "bg-accent/[0.08] relative" : "hover:bg-muted/30"
                                    }`}
                            >
                                {selectedEmail?.id === email.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                                )}
                                <div className="flex-grow min-w-0 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {email.unread && (
                                                <Circle className="w-2 h-2 fill-accent text-accent" />
                                            )}
                                            <span className={`text-sm tracking-tight truncate ${email.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                                                {email.sender}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{email.time}</span>
                                    </div>
                                    <h4 className={`text-xs truncate ${email.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                                        {email.subject}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate opacity-60">
                                        {email.snippet}
                                    </p>
                                    <div className="flex gap-1 pt-1">
                                        {email.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-[8px] h-4 border-muted/50 font-bold uppercase tracking-tighter opacity-70">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content View */}
                <div className="hidden xl:flex flex-[2] flex-col border-l border-border/40 bg-background/30">
                    {selectedEmail ? (
                        <>
                            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-muted/5">
                                <div className="flex items-center gap-4">
                                    <UserCircle className="w-10 h-10 text-muted-foreground/40" />
                                    <div>
                                        <div className="font-bold text-foreground tracking-tight">{selectedEmail.sender}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{selectedEmail.tags[0]} Provider</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 border border-border/30"><Star className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 border border-border/30"><Archive className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9 border border-border/30"><Trash2 className="w-4 h-4" /></Button>
                                    <Button size="sm" className="h-9 px-4 font-bold text-[10px] uppercase tracking-wider ml-2">Reply</Button>
                                </div>
                            </div>
                            <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold tracking-tight leading-snug">
                                        {selectedEmail.subject}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 w-fit px-3 py-1.5 rounded-lg border border-border/40">
                                        <span className="font-bold">To:</span> sharon@wizzle.com
                                        <span className="opacity-20 mx-1">|</span>
                                        <span className="font-bold">Date:</span> Today, 10:45 AM
                                    </div>
                                </div>
                                <div className="text-sm leading-relaxed text-foreground/80 space-y-4 prose prose-invert max-w-none">
                                    <p>Hi Sharon,</p>
                                    <p>
                                        I've just uploaded the latest version of our Q1 strategy document to the shared drive.
                                        You can find the updated sections on <strong>Competitive Intelligence</strong> and
                                        the new <strong>Market Expansion Roadmap</strong>.
                                    </p>
                                    <p>
                                        The team is excited about the Smello for Teams launch, but we need to ensure the
                                        Firebase integration is rock solid before the beta release.
                                    </p>
                                    <p>Let me know if you have any feedback or if anything needs further clarification.</p>
                                    <p>Cheers,<br />Alex</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-40">
                            <Mail className="w-16 h-16" />
                            <p className="font-medium italic text-sm">Select a message to view content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SidebarItem({ icon: Icon, label, active, badge, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${active ? "bg-accent/10 text-accent font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:translate-x-1"
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-accent" : "group-hover:text-foreground"}`} />
                <span className="text-xs lg:block hidden tracking-tight">{label}</span>
            </div>
            {badge && (
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold lg:block hidden">
                    {badge}
                </span>
            )}
        </button>
    )
}
