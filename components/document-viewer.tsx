"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2
} from "lucide-react"
import type { ProjectData } from "@/types/user-story"

interface DocumentViewerProps {
  projectData: ProjectData
  documentContent?: string
  documentFileName?: string
  className?: string
}

export function DocumentViewer({ 
  projectData, 
  documentContent, 
  documentFileName = "Document",
  className = ""
}: DocumentViewerProps) {
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const selectedEpicData = projectData.epics.find(epic => epic.id === selectedEpic)

  // Pagination for document content
  const itemsPerPage = 500
  const totalPages = Math.ceil((documentContent?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentContent = documentContent?.slice(startIndex, endIndex) || ""

  // Filter epics based on search
  const filteredEpics = projectData.epics.filter(epic =>
    epic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epic.user_stories.some(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, zoomLevel + delta))
    setZoomLevel(newZoom)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`grid ${isDocumentVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6 ${className}`}>
      {/* Document Panel */}
      {isDocumentVisible && (
        <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                {documentFileName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(-10)}
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoom(10)}
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDocumentVisible(false)}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className={`h-[600px] ${isFullscreen ? 'h-[calc(100vh-120px)]' : ''}`}>
              <div 
                className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-4 rounded"
                style={{ fontSize: `${zoomLevel}%` }}
              >
                {currentContent || "No document content available"}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Epics and User Stories Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5" />
              Generated Content
            </CardTitle>
            {!isDocumentVisible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDocumentVisible(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Document
              </Button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search epics and user stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredEpics.map((epic) => (
                <Card key={epic.id} className="border-l-4 border-l-accent">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="text-base cursor-pointer hover:text-accent transition-colors"
                        onClick={() => setSelectedEpic(selectedEpic === epic.id ? null : epic.id)}
                      >
                        {epic.title}
                      </CardTitle>
                      <Badge variant="secondary">
                        {epic.user_stories.length} stories
                      </Badge>
                    </div>
                  </CardHeader>
                  {selectedEpic === epic.id && (
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="space-y-3">
                        {epic.user_stories.map((story) => (
                          <div key={story.id} className="border rounded-lg p-3 bg-muted/30">
                            <h4 className="font-medium text-sm mb-2">{story.title}</h4>
                            <p className="text-xs text-muted-foreground mb-3">{story.description}</p>
                            
                            {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                              <div className="mb-2">
                                <h5 className="text-xs font-semibold mb-1 text-accent">Acceptance Criteria:</h5>
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                                  {story.acceptance_criteria.map((criteria, idx) => (
                                    <li key={idx}>{criteria}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {(story.edge_cases?.length > 0 || story.validations?.length > 0) && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {story.edge_cases && story.edge_cases.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold mb-1 text-orange-600">Edge Cases:</h5>
                                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                                      {story.edge_cases.map((edgeCase, idx) => (
                                        <li key={idx}>{edgeCase}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {story.validations && story.validations.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold mb-1 text-blue-600">Validations:</h5>
                                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                                      {story.validations.map((validation, idx) => (
                                        <li key={idx}>{validation}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
