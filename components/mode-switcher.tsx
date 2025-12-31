"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, Users, ChevronDown, Check } from "lucide-react"

interface ModeSwitcherProps {
    currentMode: 'pm' | 'teams'
    onModeChange: (mode: 'pm' | 'teams') => void
    className?: string
}

export function ModeSwitcher({ currentMode, onModeChange, className }: ModeSwitcherProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`gap-2 ${className}`}>
                    {currentMode === 'pm' ? (
                        <>
                            <Briefcase className="w-4 h-4" />
                            <span className="hidden sm:inline">PM Tools</span>
                        </>
                    ) : (
                        <>
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Teams</span>
                        </>
                    )}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => onModeChange('pm')}
                    className="cursor-pointer"
                >
                    <Briefcase className="w-4 h-4 mr-2" />
                    <div className="flex-1">
                        <div className="font-medium">PM Tools</div>
                        <div className="text-xs text-muted-foreground">Product management toolkit</div>
                    </div>
                    {currentMode === 'pm' && <Check className="w-4 h-4 text-accent" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onModeChange('teams')}
                    className="cursor-pointer"
                >
                    <Users className="w-4 h-4 mr-2" />
                    <div className="flex-1">
                        <div className="font-medium">Team Collaboration</div>
                        <div className="text-xs text-muted-foreground">Project management & workflows</div>
                    </div>
                    {currentMode === 'teams' && <Check className="w-4 h-4 text-accent" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Compact version for use in tight spaces
export function ModeSwitcherCompact({ currentMode, onModeChange }: ModeSwitcherProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onModeChange(currentMode === 'pm' ? 'teams' : 'pm')}
            className="gap-2"
        >
            {currentMode === 'pm' ? (
                <>
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Switch to Teams</span>
                </>
            ) : (
                <>
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs">Switch to PM</span>
                </>
            )}
        </Button>
    )
}
