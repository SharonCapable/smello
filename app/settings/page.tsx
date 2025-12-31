"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings as SettingsIcon, Key, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    const router = useRouter()

    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-accent" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground">Manage your account and preferences</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
                <Card
                    className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                    onClick={() => router.push('/settings/profile')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-accent/10">
                                <User className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <CardTitle>Profile Details</CardTitle>
                                <CardDescription>View and update your personal information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                    onClick={() => router.push('/settings/keys')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-accent/10">
                                <Key className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>Manage your AI provider API keys for unlimited generation</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
