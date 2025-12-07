"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ArrowLeft, Zap, FileText, Sparkles, FolderOpen, Settings, Sun, Moon, Edit3, BarChart3, Search } from "lucide-react"
import { ModeSelector } from "@/components/mode-selector"
import { AIGenerationFlow } from "@/components/ai-generation-flow"
import { ManualInputFlow } from "@/components/manual-input-flow"
import { ProjectManager } from "@/components/project-manager"
import { ProjectDetailView } from "@/components/project-detail-view"
import { ProjectManagementView } from "@/components/project-management-view"
import { IdeaGenerator } from "@/components/idea-generator"
import { StandaloneAIGeneration } from "@/components/standalone-ai-generation"
import { EnhancedApiKeySettings } from "@/components/enhanced-api-key-settings"
import { PRDGenerator } from "@/components/prd-generator"
import { TechnicalBlueprint } from "@/components/technical-blueprint"
import { PitchDeckGenerator } from "@/components/pitch-deck-generator"
import { UserJourneyMap } from "@/components/user-journey-map"
import { CompetitiveIntelligence } from "@/components/competitive-intelligence"
import { RoadmapBuilder } from "@/components/roadmap-builder"
import { RiskAnalysis } from "@/components/risk-analysis"
import { ProjectPathSelector } from "@/components/project-path-selector"
import { WorkflowHome } from "@/components/workflow-home"
import { WorkflowStepper, type WorkflowPhase, getPhaseTools, getNextPhase } from "@/components/workflow-stepper"
import { ProjectProgressManager } from "@/lib/project-progress"
import { saveProject, type StoredProject } from "@/lib/storage"
import FeaturePrioritization from "@/app/feature-prioritization"
import ResearchAgent from "@/app/research-agent"
import type { InputMode, ProjectData } from "@/types/user-story"
import { useTheme } from "next-themes"
import { SidebarNavigation } from "@/components/sidebar-navigation"
// Import PDF utilities
import { parsePdfDocument, validatePdfFile } from '@/lib/pdf-utils';

type AppState =
  | "workflow-home"
  | "guided-journey"
  | "home"
  | "mode-selection"
  | "ai-flow"
  | "manual-flow"
  | "project-manager"
  | "project-view"
  | "project-edit"
  | "project-path-selector"
  | "idea-generator"
  | "feature-prioritization"
  | "research-agent"
  | "settings"
  | "standalone-ai"
  | "prd-generator"
  | "technical-blueprint"
  | "pitch-deck-generator"
  | "user-journey-map"
  | "competitive-intelligence"
  | "roadmap-builder"
  | "risk-analysis"

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("workflow-home")
  const [selectedMode, setSelectedMode] = useState<InputMode | null>(null)
  const [currentProject, setCurrentProject] = useState<StoredProject | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [entryMode, setEntryMode] = useState<null | 'pdf' | 'manual' | 'ai'>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedPdfText, setParsedPdfText] = useState<string | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [extractedProductName, setExtractedProductName] = useState<string>("");
  const [extractedDescription, setExtractedDescription] = useState<string>("");
  const [showEditableExtract, setShowEditableExtract] = useState(false);

  // Workflow state
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>("ideation")
  const [completedPhases, setCompletedPhases] = useState<WorkflowPhase[]>([])
  const [isGuidedMode, setIsGuidedMode] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (entryMode === 'pdf' && parsedPdfText && !showEditableExtract) {
      // Basic heuristic: product name is the first ALL CAPS line, description is first non-trivial paragraph
      const lines = parsedPdfText.split('\n');
      const titleLine = lines.find(l => l.trim().length > 6 && l === l.toUpperCase());
      setExtractedProductName(titleLine || "");
      // Find the first longish line that isn't the title
      const descLine = lines.find(l => l !== titleLine && l.trim().length > 30);
      setExtractedDescription(descLine || "");
    }
    // eslint-disable-next-line
  }, [parsedPdfText, entryMode, showEditableExtract]);

  const handleGetStarted = () => {
    setAppState("mode-selection")
  }

  const handleModeSelect = (mode: InputMode) => {
    setSelectedMode(mode)
    setAppState(mode === "ai" ? "ai-flow" : "manual-flow")
  }

  const handleProjectsClick = () => {
    setAppState("project-manager")
  }

  const handleNavigation = (state: AppState) => {
    setAppState(state);
    // Reset entry mode when going home
    if (state === 'home') {
      setEntryMode(null);
      setCurrentProject(null);
    }
  };

  const handleBack = () => {
    if (appState === 'project-view') {
      setAppState('project-manager');
      setCurrentProject(null);
    } else if (appState === 'guided-journey') {
      setAppState('workflow-home');
      setIsGuidedMode(false);
    } else if (isGuidedMode) {
      // If in guided mode but using a tool, return to guided journey
      setAppState('guided-journey');
    } else if (appState !== 'workflow-home' && appState !== 'home') {
      // Return to workflow home for all other states
      setAppState('workflow-home');
    } else {
      setAppState('workflow-home');
      setEntryMode(null);
      setCurrentProject(null);
    }
  };

  const handleComplete = (data: ProjectData) => {
    const savedProject = saveProject(
      data,
      parsedPdfText || undefined,
      uploadedFile?.name || undefined
    )
    setCurrentProject(savedProject)
    setAppState("project-manager")
    // Show success message
    setTimeout(() => {
      alert(`Project "${savedProject.name}" has been saved successfully! You can find it in your projects list.`)
    }, 100)
  }

  const handleLoadProject = (project: StoredProject) => {
    setCurrentProject(project)
    setAppState("project-view")
  }

  const handleEditProject = () => {
    setAppState("project-edit")
  }

  const handleProjectUpdate = (updatedProject: StoredProject) => {
    setCurrentProject(updatedProject)
  }

  const handleCreateNew = () => {
    setAppState("mode-selection")
  }

  const handleIdeaGeneratorClick = () => {
    setAppState("idea-generator")
  }

  const handleSettingsClick = () => {
    setAppState("settings")
  }

  const handleFeaturePrioritizationClick = () => {
    setAppState("feature-prioritization")
  }

  const handleResearchAgentClick = () => {
    setCurrentProject(null)
    setAppState("research-agent")
  }

  const handlePRDGeneratorClick = () => {
    setCurrentProject(null)
    setAppState("prd-generator")
  }

  const handleTechnicalBlueprintClick = () => {
    setCurrentProject(null)
    setAppState("technical-blueprint")
  }

  const handlePitchDeckGeneratorClick = () => {
    setAppState("pitch-deck-generator")
  }

  const handleUserJourneyMapClick = () => {
    setCurrentProject(null)
    setAppState("user-journey-map")
  }

  const handleCompetitiveIntelligenceClick = () => {
    setCurrentProject(null)
    setAppState("competitive-intelligence")
  }

  const handleRoadmapBuilderClick = () => {
    setCurrentProject(null)
    setAppState("roadmap-builder")
  }

  const handleRiskAnalysisClick = () => {
    setCurrentProject(null)
    setAppState("risk-analysis")
  }

  const handleIdeaProjectCreate = (idea: any, mode: InputMode) => {
    const productData: ProjectData["product"] = {
      name: idea.title,
      description: idea.description,
      sector: idea.sector,
      target_audience: idea.targetAudience,
      key_features: idea.keyFeatures,
      business_goals: [],
    }

    const newProject: StoredProject = {
      id: crypto.randomUUID(),
      name: idea.title,
      product: productData,
      epics: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    saveProject(newProject)
    setCurrentProject(newProject)

    // If we are in guided mode or just starting a flow, move to the next logical step
    // The next step after Ideation is Foundation
    if (isGuidedMode || appState === 'idea-generator') {
      setWorkflowPhase("foundation")
      setCompletedPhases(prev => [...prev, "ideation"])
    }

    // Navigate to path selector so user can choose what to generate
    setAppState("project-path-selector")
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Validate the PDF file first
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid PDF file');
      return;
    }

    setUploadedFile(file);
    setFileError(null);
    setEntryMode('pdf');
    setPdfParsing(true);

    try {
      console.log('Starting PDF parsing for:', file.name);
      const textContent = await parsePdfDocument(file);
      console.log('PDF parsing successful, text length:', textContent.length);
      setParsedPdfText(textContent);
    } catch (e) {
      console.error('PDF parsing error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Could not parse PDF. Try a different file.';
      setFileError(errorMessage);
      setParsedPdfText(null);
    } finally {
      setPdfParsing(false);
    }
  };

  // Workflow handlers
  const handleStartJourney = () => {
    setIsGuidedMode(true)
    setWorkflowPhase("ideation")
    setCompletedPhases([])
    setAppState("guided-journey")
  }

  const handleQuickAccess = (toolId: string) => {
    setIsGuidedMode(false)
    setAppState(toolId as AppState)
  }

  const handlePhaseClick = (phase: WorkflowPhase) => {
    setWorkflowPhase(phase)
  }

  const handleToolComplete = (toolId: string) => {
    // Mark tool as complete and potentially advance phase
    const phaseTools = getPhaseTools(workflowPhase)

    // If all tools in current phase are done, mark phase complete
    // For now, we'll just allow manual phase progression
  }

  const handleAdvancePhase = () => {
    const nextPhase = getNextPhase(workflowPhase)
    if (nextPhase) {
      setCompletedPhases([...completedPhases, workflowPhase])
      setWorkflowPhase(nextPhase)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      <SidebarNavigation
        appState={appState}
        onNavigate={handleNavigation}
        onBack={handleBack}
        showBackButton={appState !== "workflow-home" && appState !== "home"}
      />

      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Workflow Home - New Landing Page */}
        {appState === 'workflow-home' && (
          <WorkflowHome
            onStartJourney={handleStartJourney}
            onQuickAccess={handleQuickAccess}
            onLoadProject={handleProjectsClick}
          />
        )}

        {/* Guided Journey Mode */}
        {appState === 'guided-journey' && (
          <div className="space-y-8">
            <WorkflowStepper
              currentPhase={workflowPhase}
              completedPhases={completedPhases}
              onPhaseClick={handlePhaseClick}
            />

            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h2 className="text-2xl font-bold">
                Phase {workflowPhase === "ideation" ? "1" : workflowPhase === "foundation" ? "2" : workflowPhase === "strategy" ? "3" : "4"}: {workflowPhase.charAt(0).toUpperCase() + workflowPhase.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Use the tools below to complete this phase
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-8">
                {getPhaseTools(workflowPhase).map(toolId => (
                  <Card
                    key={toolId}
                    className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
                    onClick={() => handleQuickAccess(toolId)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {toolId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {getNextPhase(workflowPhase) && (
                <Button onClick={handleAdvancePhase} className="mt-8">
                  Complete Phase & Continue →
                </Button>
              )}
            </div>
          </div>
        )}

        {appState === 'home' && entryMode === null && (
          <>
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto mb-16 text-center">
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-2xl p-12 border border-accent/20">
                  <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-accent via-purple-500 to-accent bg-clip-text text-transparent animate-pulse">
                    SMELLO
                  </h1>
                  <div className="text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto space-y-2">
                    <p className="animate-fade-in-up">
                      <span className="font-semibold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Transform</span> ideas into structured epics
                    </p>
                    <p className="animate-fade-in-up animation-delay-200">
                      <span className="font-semibold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">Prioritize</span> features with AI precision
                    </p>
                    <p className="animate-fade-in-up animation-delay-400">
                      <span className="font-semibold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Research</span> markets with intelligent insights
                    </p>
                  </div>
                  <p className="text-lg text-muted-foreground/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
                    Your intelligent product development companion — from concept to completion, powered by AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Entry Options */}
            <div className="max-w-4xl mx-auto">
              {/* Manual Entry - Primary Option */}
              <div className="mb-12 text-center">
                <div className="bg-card border rounded-xl shadow-lg p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Edit3 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Start with Manual Entry</h3>
                  <p className="text-muted-foreground mb-6">
                    Create epics and user stories manually with AI assistance
                  </p>
                  <Button onClick={() => handleModeSelect("manual")} className="w-full">
                    Get Started
                  </Button>
                </div>
              </div>

              {/* PDF Upload - Secondary Option */}
              <div className="text-center">
                <div className="bg-card border rounded-xl shadow-lg p-6 max-w-md mx-auto">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload Product PDF</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a requirements doc or product spec to extract basics
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="pdf-upload"
                    onChange={handlePdfUpload}
                    title="Upload PDF"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                    className="w-full"
                  >
                    Upload PDF
                  </Button>
                  {fileError && <div className="text-red-600 mt-2 text-xs">{fileError}</div>}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Placeholder for PDF flow (stub for now) */}
        {appState === 'home' && entryMode === 'pdf' && (
          <div className="max-w-xl mx-auto text-center mt-24">
            <h2 className="text-2xl font-semibold mb-4">Preview Extracted Product Information</h2>
            {pdfParsing && (<div className="mb-4 text-muted-foreground">Parsing PDF, please wait...</div>)}
            {!pdfParsing && parsedPdfText && !showEditableExtract && (
              <>
                <pre className="bg-muted rounded border p-4 text-left overflow-x-auto max-h-80 whitespace-pre-wrap text-xs mb-2">{parsedPdfText.slice(0, 2000)}{parsedPdfText.length > 2000 && '...'}
                </pre>
                <div className="flex gap-2 justify-center mt-4">
                  <Button onClick={() => { setEntryMode(null); setParsedPdfText(null); }} variant="outline">Back</Button>
                  <Button variant="default" disabled={pdfParsing || !parsedPdfText} onClick={() => setShowEditableExtract(true)}>Continue</Button>
                </div>
              </>
            )}
            {!pdfParsing && showEditableExtract && (
              <form onSubmit={e => { e.preventDefault(); setShowEditableExtract(false); setAppState("mode-selection"); }} className="bg-card rounded-lg p-6 border max-w-lg mx-auto flex flex-col gap-4">
                <div className="text-left">
                  <label className="block font-semibold mb-1" htmlFor="prodName">Product Name</label>
                  <input id="prodName" className="bg-background border rounded px-3 py-2 w-full mb-2" value={extractedProductName} onChange={e => setExtractedProductName(e.target.value)} required />
                </div>
                <div className="text-left">
                  <label className="block font-semibold mb-1" htmlFor="prodDesc">Description</label>
                  <textarea id="prodDesc" className="bg-background border rounded px-3 py-2 w-full min-h-24" value={extractedDescription} onChange={e => setExtractedDescription(e.target.value)} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => { setShowEditableExtract(false); }} variant="outline" type="button">Back</Button>
                  <Button variant="default" type="submit">Confirm & Continue</Button>
                </div>
              </form>
            )}
            {!pdfParsing && !parsedPdfText && <div className="text-muted-foreground mb-4">No text extracted from PDF.</div>}
            {fileError && <div className="text-red-600 mt-2 text-xs">{fileError}</div>}
          </div>
        )}
        {/* Transition to existing flows if selected from cards */}
        {appState === 'home' && entryMode === 'manual' && (
          <ManualInputFlow onComplete={handleComplete} onBack={() => setEntryMode(null)} />
        )}
        {appState === 'home' && entryMode === 'ai' && (
          <IdeaGenerator onCreateProject={handleIdeaProjectCreate} onBack={() => setEntryMode(null)} />
        )}

        {appState === "mode-selection" && <ModeSelector onModeSelect={handleModeSelect} />}

        {appState === "ai-flow" && <AIGenerationFlow onComplete={handleComplete} onBack={handleBack} initialProduct={currentProject?.product} />}

        {appState === "manual-flow" && <ManualInputFlow onComplete={handleComplete} onBack={handleBack} />}

        {appState === "project-manager" && (
          <ProjectManager
            onCreateNew={handleCreateNew}
            onLoadProject={handleLoadProject}
            onModeSelect={handleModeSelect}
          />
        )}

        {appState === "project-view" && currentProject && (
          <ProjectDetailView
            project={currentProject}
            onBack={() => setAppState("project-manager")}
            onEdit={handleEditProject}
          />
        )}

        {appState === "project-edit" && currentProject && (
          <ProjectManagementView
            project={currentProject}
            onBack={() => setAppState("project-view")}
            onProjectUpdate={handleProjectUpdate}
            onNavigateToTool={(tool) => setAppState(tool as AppState)}
          />
        )}

        {appState === "project-path-selector" && currentProject && (
          <ProjectPathSelector
            project={currentProject}
            onSelectPath={(path) => setAppState(path as AppState)}
            onBack={() => setAppState("idea-generator")}
          />
        )}


        {appState === "idea-generator" && (
          <IdeaGenerator onCreateProject={handleIdeaProjectCreate} onBack={handleBack} />
        )}

        {appState === "feature-prioritization" && (
          <FeaturePrioritization />
        )}

        {appState === "research-agent" && (
          <ResearchAgent />
        )}

        {appState === "settings" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
              <p className="text-muted-foreground text-lg">Configure your API keys and application preferences.</p>
            </div>
            <EnhancedApiKeySettings />
          </div>
        )}

        {appState === "standalone-ai" && (
          <StandaloneAIGeneration onBack={() => setAppState("home")} />
        )}

        {appState === "prd-generator" && (
          <PRDGenerator
            project={currentProject}
            onBack={() => setAppState(currentProject ? "project-edit" : "home")}
          />
        )}

        {appState === "technical-blueprint" && (
          <TechnicalBlueprint
            project={currentProject}
            onBack={() => setAppState(currentProject ? "project-edit" : "home")}
          />
        )}

        {appState === "pitch-deck-generator" && (
          <PitchDeckGenerator
            project={currentProject}
            onBack={() => setAppState("home")}
          />
        )}

        {appState === "user-journey-map" && (
          <UserJourneyMap
            project={currentProject}
            onBack={() => setAppState(currentProject ? "project-edit" : "home")}
          />
        )}

        {appState === "competitive-intelligence" && (
          <CompetitiveIntelligence
            project={currentProject}
            onBack={() => setAppState(currentProject ? "project-edit" : "home")}
          />
        )}

        {appState === "roadmap-builder" && (
          <RoadmapBuilder
            project={currentProject}
            onBack={() => setAppState("home")}
          />
        )}

        {appState === "risk-analysis" && (
          <RiskAnalysis
            project={currentProject}
            onBack={() => setAppState("home")}
          />
        )}
      </main>
    </div>
  )
}
