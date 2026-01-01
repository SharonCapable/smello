"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchJiraProjectData, JiraIssue } from "@/app/actions/jira"
import { Loader2, Server, ArrowRight, CheckCircle2 } from "lucide-react"

// Define interface compatible with IdeaGenerator
interface GeneratedIdea {
    title: string
    description: string
    sector: string
    keywords: string[]
    targetAudience: string
    keyFeatures: string[]
}

interface JiraImportProps {
    onImport: (idea: GeneratedIdea) => void
}

export function JiraImport({ onImport }: JiraImportProps) {
    const [step, setStep] = useState<"credentials" | "fetching" | "inferring">("credentials")
    const [domain, setDomain] = useState("")
    const [email, setEmail] = useState("")
    const [token, setToken] = useState("")
    const [projectKey, setProjectKey] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const handleConnect = async () => {
        if (!domain || !email || !token || !projectKey) {
            setError("All fields are required")
            return
        }

        setError(null)
        setStep("fetching")

        try {
            const issues = await fetchJiraProjectData(domain, email, token, projectKey)

            if (issues.length === 0) {
                throw new Error("No issues found in this project.")
            }

            setStep("inferring")
            await inferProductStrategy(issues)

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Failed to connect to JIRA")
            setStep("credentials")
        }
    }

    const inferProductStrategy = async (issues: JiraIssue[]) => {
        try {
            // Prepare prompt for AI
            const issuesText = issues.map(i => `[${i.type}] ${i.summary}: ${i.description.substring(0, 200)}`).join("\n")

            const prompt = `Act as a Senior Product Manager. I have imported the following backlog from JIRA. 
            Reverse-engineer the Product Strategy from these stories.
            
            Stories:
            ${issuesText}

            Infer the following:
            - Product Title (Creative name based on features)
            - Description (2-3 sentences summarising the value prop)
            - Sector (Best guess)
            - Target Audience
            - Key Features (Summarized from stories)
            - Keywords

             Return ONLY a JSON object with this exact structure:
            {
                "title": "Product Title",
                "description": "Description...",
                "sector": "Technology",
                "keywords": ["tag1", "tag2"],
                "targetAudience": "Audience...",
                "keyFeatures": ["feature1", "feature2"]
            }`

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'gemini', // Default to Gemini for analysis (or Claude if available)
                    prompt,
                    model: 'gemini-2.0-flash-exp'
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "AI Analysis Failed")
            }

            const content = data.candidates?.[0]?.content?.parts?.[0]?.text
                || data.content?.[0]?.text
                || data.text

            if (!content) throw new Error("No analysis received")

            const cleanedText = content.replace(/```json\n?|\n?```/g, "").trim()
            const idea = JSON.parse(cleanedText) as GeneratedIdea

            toast({
                title: "Analysis Complete",
                description: `Successfully reverse-engineered strategy for ${idea.title}`,
            })

            onImport(idea)

        } catch (err) {
            console.error("Inference Error", err)
            setError("Failed to analyze JIRA data. Please try again.")
            setStep("credentials")
        }
    }

    if (step === "fetching" || step === "inferring") {
        return (
            <Card className="border-dashed">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">
                            {step === "fetching" ? "Connecting to JIRA..." : "Analyzing Backlog..."}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                            {step === "fetching"
                                ? "Fetching stories and epics from your project."
                                : "Our AI is reading your stories to reverse-engineer the product strategy."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    Import from JIRA
                </CardTitle>
                <CardDescription>
                    Connect your JIRA project to auto-generate a product strategy based on your existing backlog.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>JIRA Domain</Label>
                        <Input
                            placeholder="your-company.atlassian.net (or 'demo')"
                            value={domain}
                            onChange={e => setDomain(e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                placeholder="email@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>API Token</Label>
                            <Input
                                type="password"
                                placeholder="JIRA API Token (or 'demo')"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                                    Get a token here
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Project Key</Label>
                        <Input
                            placeholder="e.g. PROJ"
                            value={projectKey}
                            onChange={e => setProjectKey(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button onClick={handleConnect} className="w-full gap-2">
                        Analyze Project <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        We only read issue summaries/descriptions to infer context. Data is not stored permanently.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
