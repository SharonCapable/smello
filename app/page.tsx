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
import { saveProject, setUserId, migrateToFirestore } from "@/lib/storage-hybrid"
import type { StoredProject } from "@/lib/storage"
import FeaturePrioritization from "@/app/feature-prioritization"
import ResearchAgent from "@/app/research-agent"
import type { InputMode, ProjectData } from "@/types/user-story"
import { useTheme } from "next-themes"
import { SidebarNavigation } from "@/components/sidebar-navigation"
// Import PDF utilities
// Import PDF utilities
import { validatePdfFile } from '@/lib/pdf-utils';
import { parsePdf } from '@/app/actions/parse-pdf';
import { useUser } from "@clerk/nextjs"
import { LandingPage } from "@/components/landing-page"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { TeamDashboard } from "@/components/team-dashboard"
import { AppHeader } from "@/components/app-header"
import { OnboardingPathSelector } from "@/components/onboarding-path-selector"

type AppState =
  | "landing"
  | "path-selection"
  | "onboarding"
  | "team-dashboard"
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
  // Determine initial state based on storage/session
  const [appState, setAppState] = useState<AppState>("landing")

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

  const { user, isLoaded, isSignedIn } = useUser()

  // Workflow state
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>("ideation")
  const [completedPhases, setCompletedPhases] = useState<WorkflowPhase[]>([])
  const [isGuidedMode, setIsGuidedMode] = useState(false)

  // Loading state for initial profile check
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)

  useEffect(() => {
    setMounted(true)

    if (!isLoaded) return

    // Check for temporary onboarding data (from pre-auth flow)
    const tempOnboardingData = localStorage.getItem("smello-onboarding-temp")


    if (isSignedIn && user && tempOnboardingData) {
      // User just authenticated after onboarding step 3
      const data = JSON.parse(tempOnboardingData)

      // Save to permanent storage
      localStorage.setItem("smello-user-onboarding", JSON.stringify(data))
      localStorage.removeItem("smello-onboarding-temp")

      // Save profile to Firestore to complete onboarding
      fetch(`/api/profile/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || user.fullName || user.firstName || 'User',
          role: data.role,
          selectedPath: data.usageType === 'team' ? 'team' : 'pm',
          onboardingCompleted: true
        })
      }).then(() => {
        console.log('Profile saved to Firestore after auth')
      }).catch(err => {
        console.error('Failed to save profile:', err)
      })

      // Redirect to appropriate dashboard
      if (data.usageType === "team") {
        setAppState("team-dashboard")
      } else {
        setAppState("workflow-home")
      }
      setIsCheckingProfile(false)
      return // Stop further checks
    }

    // Check existing permanent onboarding status
    const onboardingData = localStorage.getItem("smello-user-onboarding")

    // ONLY redirect if we are in a 'neutral' or 'auth' state.
    const isTransitionState = appState === "landing" || appState === "onboarding"

    if (isSignedIn && user) {
      if (onboardingData) {
        const data = JSON.parse(onboardingData)

        // RBAC: Restricted PM Role Check
        const pmRoles = ["Product Manager", "Product Owner", "Founder / CEO", "CTO / Technical Lead", "Project Manager"];
        const isPMRole = pmRoles.includes(data.role);

        // If we are currently in landing/onboarding, move them to their dashboard
        if (isTransitionState) {
          if (data.usageType === "team") {
            if (!data.organizationId) {
              setAppState("onboarding")
            } else {
              setAppState("team-dashboard")
            }
          } else {
            if (!isPMRole) {
              // If they chose personal but aren't a PM role, maybe they should be in team?
              // For now, still allow but we'll add a badge/limit or prompt
              setAppState("workflow-home")
            } else {
              setAppState("workflow-home")
            }
          }
        }
        setIsCheckingProfile(false)
      } else {
        // Session exists but no onboarding data in local storage.
        // Fetch from server to check if user has already onboarded.
        const uid = user.id
        if (uid) {
          fetch(`/api/profile/${uid}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.onboardingCompleted) {
                // Restore local storage
                localStorage.setItem("smello-user-onboarding", JSON.stringify({
                  name: data.name || user.fullName,
                  role: data.role || "Product Manager",
                  usageType: data.selectedPath === "team" ? "team" : "personal"
                }))
                // Redirect to dashboard
                if (isTransitionState) {
                  alert(`Welcome back, ${data.name}! We found your existing account. Redirecting you to your dashboard.`);
                  if (data.selectedPath === "team") {
                    setAppState("team-dashboard")
                  } else {
                    setAppState("workflow-home")
                  }
                }
              } else {
                // Not onboarded on server either.
              }
            })
            .catch(e => console.error("Failed to sync profile on home load", e))
            .finally(() => setIsCheckingProfile(false))
        } else {
          setIsCheckingProfile(false)
        }
      }
    } else {
      // No session. 
      // Allow landing, path-selection, and onboarding states for unauthenticated users
      if (appState !== "landing" && appState !== "onboarding" && appState !== "path-selection") {
        setAppState("landing")
      }
      setIsCheckingProfile(false)
    }
  }, [user, isLoaded, isSignedIn, appState])

  // Sync user ID with storage layer and migrate projects if needed
  useEffect(() => {
    if (isSignedIn && user) {
      setUserId(user.id)
      // Attempt migration of local projects to Firestore
      migrateToFirestore(user.id).then((count) => {
        if (count > 0) {
          console.log(`Migrated ${count} projects to Firestore`)
        }
      })
    } else {
      setUserId(null)
    }
  }, [isSignedIn, user])

  useEffect(() => {
    if (entryMode === 'pdf' && parsedPdfText && !showEditableExtract) {
      const lines = parsedPdfText.split('\n');
      const titleLine = lines.find(l => l.trim().length > 6 && l === l.toUpperCase());
      setExtractedProductName(titleLine || "");
      const descLine = lines.find(l => l !== titleLine && l.trim().length > 30);
      setExtractedDescription(descLine || "");
    }
    // eslint-disable-next-line
  }, [parsedPdfText, entryMode, showEditableExtract]);

  const handleGetStarted = () => {
    // If user is already signed in, redirect to their dashboard
    if (isSignedIn && user) {
      const onboardingData = localStorage.getItem("smello-user-onboarding")
      if (onboardingData) {
        const data = JSON.parse(onboardingData)
        if (data.usageType === "team") {
          setAppState("team-dashboard")
        } else {
          setAppState("workflow-home")
        }
        return
      }
    }
    // Otherwise, proceed to path selection
    setAppState("path-selection")
  }

  const handlePathSelect = (path: 'pm' | 'teams') => {
    const usageType = path === 'pm' ? 'personal' : 'team'

    // Pre-seed the onboarding data with the selected type
    const existingData = JSON.parse(localStorage.getItem("smello-user-onboarding") || "{}")
    localStorage.setItem("smello-user-onboarding", JSON.stringify({
      ...existingData,
      usageType
    }))

    setAppState("onboarding")
  }

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem("smello-user-onboarding", JSON.stringify(data))
    if (data.usageType === "team") {
      setAppState("team-dashboard")
    } else {
      setAppState("workflow-home") // Changed from "settings" to "workflow-home"
    }
  }

  const handleModeSelect = (mode: InputMode) => {
    setSelectedMode(mode)
    setAppState(mode === "ai" ? "ai-flow" : "manual-flow")
  }

  const handleProjectsClick = () => {
    setAppState("project-manager")
  }

  const handleNavigation = (state: AppState) => {
    // Onboarding Check for Team Dashboard
    if (state === "team-dashboard") {
      const onboardingDataRaw = localStorage.getItem("smello-user-onboarding")
      const onboardingData = onboardingDataRaw ? JSON.parse(onboardingDataRaw) : {}

      if (!onboardingData.organizationId) {
        // User hasn't set up an organization yet
        setAppState("onboarding")
        return
      }
    }

    setAppState(state);
    if (state === 'home') {
      setEntryMode(null);
      setCurrentProject(null);
    }
  };

  const handleBack = () => {
    if (appState === "team-dashboard") {
      // Reset onboarding allow user to choose again? Or go back to landing?
      setAppState("landing")
    } else if (appState === 'project-view') {
      setAppState('project-manager');
      setCurrentProject(null);
    } else if (appState === 'guided-journey') {
      setAppState('workflow-home');
      setIsGuidedMode(false);
    } else if (isGuidedMode) {
      setAppState('guided-journey');
    } else if (currentProject) {
      setAppState('project-view');
    } else if (appState !== 'workflow-home' && appState !== 'home') {
      setAppState('workflow-home');
    } else {
      setAppState('workflow-home');
      setEntryMode(null);
      setCurrentProject(null);
    }
  };

  const handleComplete = async (data: ProjectData) => {
    const savedProject = await saveProject(
      data,
      parsedPdfText || undefined,
      uploadedFile?.name || undefined
    )
    setCurrentProject(savedProject)
    setAppState("project-view")
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
    setCurrentProject(null)
    setExtractedProductName("")
    setExtractedDescription("")
    setParsedPdfText(null)
    setAppState("idea-generator")
  }

  const handleIdeaProjectCreate = async (idea: any, mode: InputMode) => {
    const productData: ProjectData["product"] = {
      name: idea.title,
      description: idea.description,
      sector: idea.sector,
      target_audience: idea.targetAudience,
      key_features: idea.keyFeatures,
      business_goals: [],
    }

    // saveProject handles ID creation internally if ID is not provided in data (it extracts from product name usually or generates new)
    // But here we construct a StoredProject shape partially? No, saveProject takes ProjectData.
    // We should pass ProjectData.
    // Refactoring to match saveProject expectation more cleanly.

    // The previous code created 'newProject' object manually including ID and timestamps.
    // storage-hybrid's saveProject takes ProjectData and returns the stored object.
    // So we should just construct ProjectData and let saveProject handle the rest.

    const projectData: ProjectData = {
      product: productData,
      epics: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const savedProject = await saveProject(projectData)
    setCurrentProject(savedProject)

    if (isGuidedMode || appState === 'idea-generator') {
      setWorkflowPhase("foundation")
      setCompletedPhases(prev => [...prev, "ideation"])
    }

    setAppState("project-path-selector")
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

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

      const formData = new FormData();
      formData.append('file', file);

      const result = await parsePdf(formData);

      if (result.success && result.text) {
        console.log('PDF parsing successful, text length:', result.text.length);
        setParsedPdfText(result.text);
      } else {
        throw new Error(result.error || 'Failed to parse PDF');
      }
    } catch (e) {
      console.error('PDF parsing error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Could not parse PDF. Try a different file.';
      setFileError(errorMessage);
      setParsedPdfText(null);
    } finally {
      setPdfParsing(false);
    }
  };

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

  const handleAdvancePhase = () => {
    const nextPhase = getNextPhase(workflowPhase)
    if (nextPhase) {
      setCompletedPhases([...completedPhases, workflowPhase])
      setWorkflowPhase(nextPhase)
    }
  }

  // Show loader while checking session/profile
  if (!isLoaded || isCheckingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Pre-onboarding views (No Sidebar)
  if (appState === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  if (appState === "path-selection") {
    return <OnboardingPathSelector onSelectPath={handlePathSelect} />
  }

  if (appState === "onboarding") {
    const existingData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("smello-user-onboarding") || "{}") : {}
    const needsTeamSetup = existingData.usageType === "team" && !existingData.organizationId

    return <OnboardingFlow
      onComplete={handleOnboardingComplete}
      isAuthenticated={!!isSignedIn}
      onBack={() => setAppState("path-selection")}
      initialData={existingData}
      initialStep={needsTeamSetup ? 5 : 1}
    />
  }

  if (appState === "team-dashboard") {
    const onboardingData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("smello-user-onboarding") || "{}") : {}
    return <TeamDashboard
      organizationId={onboardingData.organizationId}
      teamId={onboardingData.teamId}
      organizationName={onboardingData.organizationName}
      onBack={() => {
        // Return to mode selection instead of landing
        setAppState("workflow-home")
      }}
    />
  }

  // Main App Views (With Sidebar)
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      <SidebarNavigation
        appState={appState}
        onNavigate={handleNavigation}
        onBack={handleBack}
        showBackButton={appState !== "workflow-home" && appState !== "home"}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />

        <main className="flex-1 container mx-auto px-6 py-8 overflow-x-hidden overflow-y-auto">
          {/* Workflow Home - Main Dashboard for PMs */}
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
                      className="cursor-pointer hover:shadow-lg hover:border-accent transition-all animate-fade-in-up"
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

          {/* Legacy Home (kept for state compatibility slightly, but likely unreachable via nav now) */}
          {appState === 'home' && entryMode === null && (
            <div className="text-center p-8">
              <Button onClick={() => setAppState("workflow-home")}>Go to Dashboard</Button>
            </div>
          )}

          {/* PDF / Manual Entry Flows */}
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

          {appState === 'home' && entryMode === 'manual' && (
            <ManualInputFlow onComplete={handleComplete} onBack={() => setEntryMode(null)} />
          )}
          {appState === 'home' && entryMode === 'ai' && (
            <IdeaGenerator onCreateProject={handleIdeaProjectCreate} onBack={() => setEntryMode(null)} />
          )}

          {appState === "mode-selection" && <ModeSelector onModeSelect={handleModeSelect} />}

          {appState === "ai-flow" && <AIGenerationFlow
            onComplete={handleComplete}
            onBack={handleBack}
            initialProduct={currentProject?.product || (extractedProductName || extractedDescription ? {
              name: extractedProductName,
              description: extractedDescription,
              sector: "",
              target_audience: "",
              key_features: [],
              business_goals: []
            } : undefined)}
          />}

          {appState === "manual-flow" && <ManualInputFlow
            onComplete={handleComplete}
            onBack={handleBack}
            initialProduct={currentProject?.product || (extractedProductName || extractedDescription ? {
              name: extractedProductName,
              description: extractedDescription,
              sector: "",
              target_audience: "",
              key_features: [],
              business_goals: []
            } : undefined)}
          />}

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
              onNavigateToTool={(tool) => setAppState(tool as AppState)}
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
            <FeaturePrioritization onBack={handleBack} />
          )}

          {appState === "research-agent" && (
            <ResearchAgent
              project={currentProject}
              onBack={() => setAppState(currentProject ? "project-view" : "workflow-home")}
            />
          )}

          {appState === "settings" && (
            <EnhancedApiKeySettings />
          )}

          {appState === "standalone-ai" && (
            <StandaloneAIGeneration onBack={() => setAppState("workflow-home")} />
          )}

          {appState === "prd-generator" && (
            <PRDGenerator
              project={currentProject}
              onBack={() => setAppState(currentProject ? "project-view" : "workflow-home")}
              onProjectUpdate={handleProjectUpdate}
            />
          )}

          {appState === "technical-blueprint" && (
            <TechnicalBlueprint
              project={currentProject}
              onBack={() => setAppState(currentProject ? "project-view" : "workflow-home")}
            />
          )}

          {appState === "pitch-deck-generator" && (
            <PitchDeckGenerator
              project={currentProject}
              onBack={() => setAppState("project-view")}
            />
          )}

          {appState === "user-journey-map" && (
            <UserJourneyMap
              project={currentProject}
              onBack={() => setAppState(currentProject ? "project-view" : "workflow-home")}
            />
          )}

          {appState === "competitive-intelligence" && (
            <CompetitiveIntelligence
              project={currentProject}
              onBack={() => setAppState(currentProject ? "project-view" : "workflow-home")}
            />
          )}

          {appState === "roadmap-builder" && (
            <RoadmapBuilder
              project={currentProject}
              onBack={() => setAppState("project-view")}
            />
          )}

          {appState === "risk-analysis" && (
            <RiskAnalysis
              project={currentProject}
              onBack={() => setAppState("project-view")}
            />
          )}
        </main>
      </div>
    </div>
  )
}
