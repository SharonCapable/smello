"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, FileText, Upload, ArrowRight, Sparkles, Loader2, CheckCircle2, Server } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { JiraImport } from "@/components/jira-import"

type ProjectCreationMode = "idea" | "describe" | "upload" | "jira" | null

interface NewProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreateFromIdea: () => void
    onCreateFromDescription: (data: { name: string; description: string; sector: string; targetAudience: string }) => void
    onCreateFromDocument: (file: File) => void
    onCreateFromJira: (data: { name: string; description: string; sector: string; targetAudience: string; keyFeatures: string[] }) => void
}

export function NewProjectModal({
    open,
    onOpenChange,
    onCreateFromIdea,
    onCreateFromDescription,
    onCreateFromDocument,
    onCreateFromJira
}: NewProjectModalProps) {
    const [mode, setMode] = useState<ProjectCreationMode>(null)
    const [projectName, setProjectName] = useState("")
    const [description, setDescription] = useState("")
    const [sector, setSector] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const { toast } = useToast()

    const handleReset = () => {
        setMode(null)
        setProjectName("")
        setDescription("")
        setSector("")
        setTargetAudience("")
        setSelectedFile(null)
        setIsProcessing(false)
    }

    const handleClose = () => {
        handleReset()
        onOpenChange(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
            if (!validTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a PDF or DOCX file.",
                    variant: "destructive"
                })
                return
            }
            setSelectedFile(file)
        }
    }

    const handleCreateFromDescription = () => {
        if (!projectName.trim() || !description.trim()) {
            toast({
                title: "Missing Information",
                description: "Please provide at least a project name and description.",
                variant: "destructive"
            })
            return
        }

        onCreateFromDescription({
            name: projectName,
            description,
            sector: sector || "Not specified",
            targetAudience: targetAudience || "Not specified"
        })
        handleClose()
    }

    const handleCreateFromDocument = () => {
        if (!selectedFile) {
            toast({
                title: "No File Selected",
                description: "Please select a PDF or DOCX file to upload.",
                variant: "destructive"
            })
            return
        }

        setIsProcessing(true)
        onCreateFromDocument(selectedFile)
        // Don't close immediately - let parent handle after processing
    }

    if (!mode) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Create New Project</DialogTitle>
                        <DialogDescription>
                            Choose how you'd like to create your project
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {/* From Idea Generator */}
                        <Card
                            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all group"
                            onClick={() => {
                                handleClose()
                                onCreateFromIdea()
                            }}
                        >
                            <CardHeader>
                                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-6 h-6 text-accent" />
                                </div>
                                <CardTitle className="text-lg">From Idea Generator</CardTitle>
                                <CardDescription className="text-sm">
                                    Use AI to generate a complete product idea
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>AI-powered ideation</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>Complete product details</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span>Ready to use immediately</span>
                                </div>
                                <Badge variant="default" className="mt-2">Recommended</Badge>
                            </CardContent>
                        </Card>

                        {/* Describe Product */}
                        <Card
                            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all group"
                            onClick={() => setMode("describe")}
                        >
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">Describe Product</CardTitle>
                                <CardDescription className="text-sm">
                                    Manually describe your product details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    <span>Full control over details</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    <span>Quick and simple</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    <span>No AI required</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Document */}
                        <Card
                            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all group"
                            onClick={() => setMode("upload")}
                        >
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-lg">Upload Document</CardTitle>
                                <CardDescription className="text-sm">
                                    Extract details from PDF or DOCX
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-purple-500" />
                                    <span>PDF & DOCX support</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-purple-500" />
                                    <span>AI extracts key info</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-purple-500" />
                                    <span>Reuse existing docs</span>
                                </div>
                                <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                            </CardContent>
                        </Card>

                        {/* Import from JIRA */}
                        <Card
                            className="cursor-pointer hover:border-accent hover:shadow-lg transition-all group"
                            onClick={() => setMode("jira")}
                        >
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Server className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">Import from JIRA</CardTitle>
                                <CardDescription className="text-sm">
                                    Analyze existing backlog from JIRA
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                    <span>Connect your JIRA</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                    <span>AI infers product strategy</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                    <span>Migrate in minutes</span>
                                </div>
                                <Badge variant="outline" className="mt-2 border-blue-600 text-blue-600">New</Badge>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (mode === "describe") {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Describe Your Product</DialogTitle>
                        <DialogDescription>
                            Provide details about your product to create a project
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name *</Label>
                            <Input
                                id="project-name"
                                placeholder="e.g., Mobile Banking App"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Product Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what your product does, the problem it solves, and key features..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sector">Industry/Sector</Label>
                                <Input
                                    id="sector"
                                    placeholder="e.g., Fintech, Healthcare, E-commerce"
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target-audience">Target Audience</Label>
                                <Input
                                    id="target-audience"
                                    placeholder="e.g., Small business owners, Students"
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setMode(null)}>
                                Back
                            </Button>
                            <Button onClick={handleCreateFromDescription} className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Create Project
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (mode === "upload") {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload a PDF or DOCX file to extract product information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Drag and drop your file here, or click to browse
                            </p>
                            <Input
                                type="file"
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileSelect}
                                className="max-w-xs mx-auto"
                            />
                            {selectedFile && (
                                <div className="mt-4 p-3 bg-accent/10 rounded-md inline-flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                🚀 Coming Soon
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                                Document upload and AI extraction is currently under development.
                                This feature will allow you to upload existing PRDs, specifications,
                                or product documents and automatically extract key information to create a project.
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setMode(null)}>
                                Back
                            </Button>
                            <Button onClick={handleCreateFromDocument} disabled className="gap-2">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload & Create (Coming Soon)
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (mode === "jira") {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Import from JIRA</DialogTitle>
                        <DialogDescription>
                            Connect your JIRA project and let AI analyze your backlog to create a product strategy
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <JiraImport onImport={(idea) => {
                            onCreateFromJira({
                                name: idea.title,
                                description: idea.description,
                                sector: idea.sector,
                                targetAudience: idea.targetAudience,
                                keyFeatures: idea.keyFeatures
                            })
                            handleClose()
                        }} />
                        <div className="flex justify-start mt-4">
                            <Button variant="outline" onClick={() => setMode(null)}>
                                Back
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return null
}
