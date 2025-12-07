"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Code, Target, Map, Search, ArrowLeft, Sparkles } from "lucide-react"
import type { StoredProject } from "@/lib/storage"

interface ProjectPathSelectorProps {
    project: StoredProject
    onSelectPath: (path: string) => void
    onBack: () => void
}

const PROJECT_PATHS = [
    {
        id: "prd-generator",
        title: "Product Requirements Document",
        description: "Define detailed requirements, user personas, and success metrics",
        icon: FileText,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "technical-blueprint",
        title: "Technical Architecture",
        description: "Design system architecture, database schema, and API specifications",
        icon: Code,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        id: "ai-flow",
        title: "Epics & User Stories",
        description: "Break down into agile epics and user stories for development",
        icon: Target,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        id: "user-journey-map",
        title: "User Journey Mapping",
        description: "Map out user flows, touchpoints, and experience design",
        icon: Map,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        id: "research-agent",
        title: "Market Research",
        description: "Analyze market opportunities, competitors, and trends",
        icon: Search,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
]

export function ProjectPathSelector({ project, onSelectPath, onBack }: ProjectPathSelectorProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-accent" />
                        Choose Your Next Step
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        What would you like to create for <span className="font-semibold text-foreground">{project.name}</span>?
                    </p>
                </div>
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg">Product Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{project.product.description}</p>
                    {project.product.key_features && project.product.key_features.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Key Features:</p>
                            <div className="flex flex-wrap gap-2">
                                {project.product.key_features.map((feature, idx) => (
                                    <span key={idx} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROJECT_PATHS.map((path) => {
                    const Icon = path.icon
                    return (
                        <Card
                            key={path.id}
                            className="cursor-pointer hover:border-accent transition-all hover:shadow-lg group"
                            onClick={() => onSelectPath(path.id)}
                        >
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${path.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${path.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg group-hover:text-accent transition-colors">
                                            {path.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2">{path.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>

            <Card className="border-accent/50 bg-accent/5">
                <CardContent className="pt-6">
                    <p className="text-sm text-center text-muted-foreground">
                        💡 <span className="font-medium">Tip:</span> You can generate any of these at any time. Start with what's most important for your project right now.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
