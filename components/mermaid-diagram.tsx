"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
    chart: string
    className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: "default",
            securityLevel: "loose",
        })
    }, [])

    useEffect(() => {
        if (ref.current) {
            try {
                mermaid.contentLoaded()
            } catch (error) {
                console.error("Mermaid rendering error:", error)
            }
        }
    }, [chart])

    return (
        <div className={`mermaid ${className}`} ref={ref}>
            {chart}
        </div>
    )
}
