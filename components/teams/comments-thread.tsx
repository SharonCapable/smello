"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, AtSign, Smile, MoreVertical, Heart, Reply } from "lucide-react"
import { cn } from "@/lib/utils"
import { Timestamp, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Comment {
    id: string
    projectId: string
    stageId?: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    mentions: string[]
    reactions: { emoji: string; userId: string; userName: string }[]
    replyTo?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

interface CommentsThreadProps {
    projectId: string
    stageId?: string
    userId: string
    userName: string
    onMention?: (userId: string) => void
}

export function CommentsThread({
    projectId,
    stageId,
    userId,
    userName,
    onMention
}: CommentsThreadProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [showMentions, setShowMentions] = useState(false)
    const [mentionSearch, setMentionSearch] = useState("")

    // Real-time comments listener
    useEffect(() => {
        if (!db || !projectId) return

        const commentsRef = collection(db, 'comments')
        let q = query(
            commentsRef,
            where('projectId', '==', projectId),
            orderBy('createdAt', 'asc')
        )

        if (stageId) {
            q = query(
                commentsRef,
                where('projectId', '==', projectId),
                where('stageId', '==', stageId),
                orderBy('createdAt', 'asc')
            )
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comment[]
            setComments(commentsData)
        })

        return () => unsubscribe()
    }, [projectId, stageId])

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !db) return

        try {
            // Extract mentions from comment
            const mentionRegex = /@(\w+)/g
            const mentions = [...newComment.matchAll(mentionRegex)].map(match => match[1])

            const commentData = {
                projectId,
                stageId: stageId || null,
                userId,
                userName,
                content: newComment,
                mentions,
                reactions: [],
                replyTo: replyingTo,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            await addDoc(collection(db, 'comments'), commentData)

            // Notify mentioned users
            mentions.forEach(mention => {
                if (onMention) onMention(mention)
            })

            setNewComment("")
            setReplyingTo(null)
        } catch (error) {
            console.error('Error adding comment:', error)
        }
    }

    const handleAddReaction = async (commentId: string, emoji: string) => {
        // Implementation for adding reactions
        // Would update the comment document in Firestore
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmitComment()
        }

        // Show mentions dropdown on @
        if (e.key === '@') {
            setShowMentions(true)
        }
    }

    const getTimeAgo = (timestamp: Timestamp) => {
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

    const renderComment = (comment: Comment, isReply: boolean = false) => {
        const replies = comments.filter(c => c.replyTo === comment.id)

        return (
            <div key={comment.id} className={cn("space-y-3", isReply && "ml-12")}>
                <div className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-xs bg-accent/10 text-accent">
                            {comment.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(comment.createdAt)}
                                </span>
                                {comment.mentions.length > 0 && (
                                    <Badge variant="outline" className="text-[10px]">
                                        <AtSign className="w-2 h-2 mr-1" />
                                        {comment.mentions.length}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>

                        {/* Reactions and Actions */}
                        <div className="flex items-center gap-3 text-xs">
                            {comment.reactions.length > 0 && (
                                <div className="flex items-center gap-1">
                                    {comment.reactions.slice(0, 3).map((reaction, idx) => (
                                        <span key={idx} className="text-sm">{reaction.emoji}</span>
                                    ))}
                                    {comment.reactions.length > 3 && (
                                        <span className="text-muted-foreground">+{comment.reactions.length - 3}</span>
                                    )}
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleAddReaction(comment.id, '👍')}
                            >
                                <Heart className="w-3 h-3 mr-1" />
                                React
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Render replies */}
                {replies.map(reply => renderComment(reply, true))}
            </div>
        )
    }

    const topLevelComments = comments.filter(c => !c.replyTo)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Comments</h3>
                <Badge variant="outline" className="text-xs">
                    {comments.length}
                </Badge>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                    {topLevelComments.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No comments yet. Start the conversation!
                        </div>
                    ) : (
                        topLevelComments.map(comment => renderComment(comment))
                    )}
                </div>
            </ScrollArea>

            {/* New Comment Input */}
            <div className="space-y-2">
                {replyingTo && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Reply className="w-3 h-3" />
                        <span>Replying to {comments.find(c => c.id === replyingTo)?.userName}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2"
                            onClick={() => setReplyingTo(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                    <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-xs bg-accent/10 text-accent">
                            {userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative">
                        <Textarea
                            placeholder="Add a comment... (use @ to mention, Cmd+Enter to send)"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[80px] pr-24"
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setShowMentions(true)}
                            >
                                <AtSign className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Smile className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 px-3"
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim()}
                            >
                                <Send className="w-3 h-3 mr-1" />
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Tip: Use <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">@username</kbd> to mention team members
                </p>
            </div>
        </div>
    )
}
