# 🔄 SMELLO - System Flow Diagrams

This document contains comprehensive Mermaid diagrams showing all major flows in the SMELLO system.

---

## Table of Contents

1. [Complete System Architecture](#1-complete-system-architecture)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [New User Onboarding Flow](#3-new-user-onboarding-flow)
4. [Returning User Flow](#4-returning-user-flow)
5. [AI Generation Flow](#5-ai-generation-flow)
6. [Project Management Flow](#6-project-management-flow)
7. [Data Persistence Flow](#7-data-persistence-flow)
8. [API Key Management Flow](#8-api-key-management-flow)
9. [Usage Tracking Flow](#9-usage-tracking-flow)
10. [Error Handling Flow](#10-error-handling-flow)

---

## 1. Complete System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js App]
        B --> C[React Components]
        B --> D[Pages/Routes]
    end
    
    subgraph "Authentication Layer"
        E[Clerk Auth]
        F[Google OAuth]
    end
    
    subgraph "API Layer"
        G[/api/generate]
        H[/api/keys]
        I[/api/profile]
        J[/api/usage-stats]
    end
    
    subgraph "Service Layer"
        K[Gemini AI]
        L[Claude AI]
        M[Firestore DB]
    end
    
    subgraph "Storage Layer"
        N[(Firestore)]
        O[Local Storage]
    end
    
    C --> E
    E --> F
    C --> G
    C --> H
    C --> I
    C --> J
    
    G --> K
    G --> L
    H --> M
    I --> M
    J --> M
    
    M --> N
    C --> O
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style E fill:#f3e5f5
    style M fill:#e8f5e9
    style N fill:#fce4ec
```

---

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant LP as Landing Page
    participant PS as Path Selector
    participant OB as Onboarding
    participant CL as Clerk
    participant GO as Google OAuth
    participant FS as Firestore
    participant WH as Workflow Home
    
    U->>LP: Visit site
    LP->>U: Show landing page
    U->>LP: Click "Get Started"
    LP->>PS: Navigate to path selection
    PS->>U: Show PM Tools vs Teams
    U->>PS: Select "PM Tools"
    PS->>OB: Start onboarding
    
    OB->>U: Step 1: Select Role
    U->>OB: Choose "Product Manager"
    OB->>U: Step 2: Problem Description
    U->>OB: Enter description (optional)
    OB->>U: Step 4: Sign In Required
    U->>OB: Click "Sign in with Google"
    
    OB->>CL: Trigger sign-in
    CL->>GO: Redirect to Google
    GO->>U: Google login page
    U->>GO: Enter credentials
    GO->>CL: Return auth token
    CL->>OB: Auth successful
    
    OB->>FS: Create user profile
    FS->>OB: Profile created
    OB->>WH: Redirect to dashboard
    WH->>U: Show PM toolkit
```

---

## 3. New User Onboarding Flow

```mermaid
graph TD
    Start([User Clicks Get Started]) --> PathSelect{Path Selection}
    
    PathSelect -->|PM Tools| Role[Step 1: Select Role]
    PathSelect -->|Teams| ComingSoon[Show Coming Soon]
    
    Role --> Problem[Step 2: Problem Description]
    Problem --> Auth{Authenticated?}
    
    Auth -->|No| SignIn[Step 4: Sign In with Google]
    Auth -->|Yes| Verified[Step 4: Already Verified]
    
    SignIn --> ClerkModal[Clerk Sign-In Modal]
    ClerkModal --> GoogleAuth[Google OAuth]
    GoogleAuth --> Success{Auth Success?}
    
    Success -->|No| SignIn
    Success -->|Yes| CreateProfile[Create User Profile]
    
    Verified --> CreateProfile
    CreateProfile --> SaveFS[(Save to Firestore)]
    SaveFS --> SaveLocal[(Save to LocalStorage)]
    SaveLocal --> Dashboard[Redirect to Workflow Home]
    Dashboard --> End([User Ready to Use Tools])
    
    ComingSoon --> End2([Show Phase 2 Message])
    
    style Start fill:#4caf50
    style End fill:#2196f3
    style End2 fill:#ff9800
    style CreateProfile fill:#9c27b0
    style SaveFS fill:#f44336
```

---

## 4. Returning User Flow

```mermaid
graph TD
    Visit([User Visits Site]) --> CheckAuth{Is Authenticated?}
    
    CheckAuth -->|No| Landing[Show Landing Page]
    CheckAuth -->|Yes| CheckOnboarding{Has Onboarding Data?}
    
    Landing --> GetStarted[User Clicks Get Started]
    GetStarted --> Onboarding[Start Onboarding]
    
    CheckOnboarding -->|No| FetchProfile[Fetch from Firestore]
    CheckOnboarding -->|Yes| CheckType{Usage Type?}
    
    FetchProfile --> Found{Profile Found?}
    Found -->|Yes| RestoreLocal[Restore to LocalStorage]
    Found -->|No| Onboarding
    
    RestoreLocal --> CheckType
    
    CheckType -->|PM Tools| PMDashboard[Workflow Home]
    CheckType -->|Teams| TeamDashboard[Team Dashboard]
    
    PMDashboard --> Ready([User Can Access Tools])
    TeamDashboard --> Ready
    
    style Visit fill:#4caf50
    style Ready fill:#2196f3
    style PMDashboard fill:#9c27b0
    style TeamDashboard fill:#ff9800
```

---

## 5. AI Generation Flow

```mermaid
graph TD
    Start([User Opens Tool]) --> FillForm[Fill Input Form]
    FillForm --> ClickGenerate[Click Generate Button]
    ClickGenerate --> CheckKey{Has Custom API Key?}
    
    CheckKey -->|Yes| UseCustom[Use Custom Key]
    CheckKey -->|No| CheckServer{Has Server Key?}
    
    CheckServer -->|No| ShowSetup[Show API Key Setup]
    CheckServer -->|Yes| CheckLimit{Under Usage Limit?}
    
    CheckLimit -->|No| ShowSetup
    CheckLimit -->|Yes| UseServer[Use Server Key]
    
    UseCustom --> SelectProvider{Which Provider?}
    UseServer --> IncrementUsage[Increment Usage Counter]
    IncrementUsage --> SelectProvider
    
    SelectProvider -->|Gemini| CallGemini[Call Gemini API]
    SelectProvider -->|Claude| CallClaude[Call Claude API]
    
    CallGemini --> APISuccess{API Success?}
    CallClaude --> APISuccess
    
    APISuccess -->|No| ShowError[Display Error Message]
    APISuccess -->|Yes| ParseResponse[Parse AI Response]
    
    ParseResponse --> DisplayResults[Display Generated Content]
    DisplayResults --> SaveOption{Save to Project?}
    
    SaveOption -->|Yes| SaveProject[Save to Firestore]
    SaveOption -->|No| End([Generation Complete])
    
    SaveProject --> End
    ShowSetup --> End2([User Adds API Key])
    ShowError --> End3([User Retries])
    
    style Start fill:#4caf50
    style End fill:#2196f3
    style CallGemini fill:#ff9800
    style CallClaude fill:#9c27b0
    style SaveProject fill:#f44336
```

---

## 6. Project Management Flow

```mermaid
graph TD
    Dashboard([Workflow Home]) --> ChooseMode{Choose Mode}
    
    ChooseMode -->|Guided Journey| StartJourney[Start Product Journey]
    ChooseMode -->|Quick Access| SelectTool[Select Specific Tool]
    ChooseMode -->|Load Project| ProjectList[View Project List]
    
    StartJourney --> IdeaGen[Idea Generator]
    SelectTool --> IdeaGen
    
    IdeaGen --> GenerateIdea[Generate Product Idea]
    GenerateIdea --> CreateProject[Create New Project]
    
    CreateProject --> SaveLocal[(Save to LocalStorage)]
    SaveLocal --> SaveFirestore[(Save to Firestore)]
    SaveFirestore --> ProjectView[Project Detail View]
    
    ProjectView --> AccessTools{Access Tools}
    
    AccessTools --> PRD[PRD Generator]
    AccessTools --> Blueprint[Technical Blueprint]
    AccessTools --> Roadmap[Roadmap Builder]
    AccessTools --> Journey[User Journey Map]
    AccessTools --> Competitive[Competitive Intelligence]
    AccessTools --> Pitch[Pitch Deck]
    AccessTools --> Risk[Risk Analysis]
    AccessTools --> Priority[Feature Prioritization]
    
    PRD --> UpdateProject[Update Project Artifacts]
    Blueprint --> UpdateProject
    Roadmap --> UpdateProject
    Journey --> UpdateProject
    Competitive --> UpdateProject
    Pitch --> UpdateProject
    Risk --> UpdateProject
    Priority --> UpdateProject
    
    UpdateProject --> SaveChanges[(Save Changes)]
    SaveChanges --> ProjectView
    
    ProjectList --> LoadProject[Select Project]
    LoadProject --> FetchData[(Fetch from Firestore)]
    FetchData --> ProjectView
    
    style Dashboard fill:#4caf50
    style CreateProject fill:#2196f3
    style SaveFirestore fill:#f44336
    style UpdateProject fill:#9c27b0
```

---

## 7. Data Persistence Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant LS as LocalStorage
    participant API as API Route
    participant FS as Firestore
    
    Note over U,FS: Create/Update Operation
    
    U->>C: Perform action (create/edit)
    C->>LS: Save immediately to LocalStorage
    LS-->>C: Saved (instant)
    C->>U: Show success (optimistic)
    
    C->>API: Send data to API
    API->>FS: Write to Firestore
    FS-->>API: Write confirmed
    API-->>C: Success response
    C->>U: Confirm cloud save
    
    Note over U,FS: Load Operation
    
    U->>C: Request data
    C->>API: Fetch from Firestore
    API->>FS: Query data
    
    alt Data found in Firestore
        FS-->>API: Return data
        API-->>C: Send data
        C->>LS: Update LocalStorage
        LS-->>C: Updated
        C->>U: Display data
    else Data not found
        API-->>C: Not found
        C->>LS: Check LocalStorage
        LS-->>C: Return local data
        C->>U: Display local data
    end
    
    Note over U,FS: Sync Operation
    
    C->>LS: Get all local projects
    LS-->>C: Return projects
    C->>API: Sync to Firestore
    API->>FS: Batch write
    FS-->>API: Sync complete
    API-->>C: Success
    C->>U: Data synced
```

---

## 8. API Key Management Flow

```mermaid
graph TD
    Start([User Opens Settings]) --> ViewKeys[View API Key Settings]
    ViewKeys --> CheckKeys{Has Custom Keys?}
    
    CheckKeys -->|Yes| ShowMasked[Show Masked Keys]
    CheckKeys -->|No| ShowEmpty[Show Empty State]
    
    ShowMasked --> Actions{User Action}
    ShowEmpty --> Actions
    
    Actions -->|Add Key| EnterKey[Enter API Key]
    Actions -->|Update Key| EnterKey
    Actions -->|Delete Key| ConfirmDelete{Confirm Delete?}
    
    EnterKey --> ValidateKey[Validate Key Format]
    ValidateKey --> Valid{Is Valid?}
    
    Valid -->|No| ShowError[Show Validation Error]
    Valid -->|Yes| EncryptKey[Encrypt Key]
    
    EncryptKey --> SaveFirestore[(Save to Firestore)]
    SaveFirestore --> UpdateLocal[(Update LocalStorage)]
    UpdateLocal --> Success[Show Success Message]
    
    ConfirmDelete -->|Yes| DeleteFirestore[(Delete from Firestore)]
    ConfirmDelete -->|No| ViewKeys
    
    DeleteFirestore --> RemoveLocal[(Remove from LocalStorage)]
    RemoveLocal --> Success
    
    Success --> ViewKeys
    ShowError --> EnterKey
    
    style Start fill:#4caf50
    style EncryptKey fill:#ff9800
    style SaveFirestore fill:#f44336
    style Success fill:#2196f3
```

---

## 9. Usage Tracking Flow

```mermaid
graph TD
    Start([AI Generation Request]) --> CheckAuth{Is Authenticated?}
    
    CheckAuth -->|No| AllowAnonymous[Allow with Limits]
    CheckAuth -->|Yes| FetchProfile[(Fetch User Profile)]
    
    FetchProfile --> CheckCustomKey{Has Custom API Key?}
    
    CheckCustomKey -->|Yes| UnlimitedUse[Unlimited Usage]
    CheckCustomKey -->|No| CheckUsage{Check Usage Count}
    
    CheckUsage --> CurrentCount[Get aiOperationsUsed]
    CurrentCount --> CheckLimit{Under Limit?}
    
    CheckLimit -->|No| ShowUpgrade[Show Upgrade Message]
    CheckLimit -->|Yes| IncrementCount[Increment Counter]
    
    IncrementCount --> SaveCount[(Save to Firestore)]
    SaveCount --> AllowGeneration[Allow AI Generation]
    
    AllowGeneration --> GenerateContent[Generate Content]
    GenerateContent --> Success([Return Results])
    
    UnlimitedUse --> GenerateContent
    AllowAnonymous --> GenerateContent
    
    ShowUpgrade --> PromptKey[Prompt Add API Key]
    PromptKey --> End([User Adds Key or Cancels])
    
    style Start fill:#4caf50
    style Success fill:#2196f3
    style ShowUpgrade fill:#ff9800
    style SaveCount fill:#f44336
```

---

## 10. Error Handling Flow

```mermaid
graph TD
    Start([Operation Initiated]) --> TryOperation{Try Operation}
    
    TryOperation -->|Success| Success[Return Success]
    TryOperation -->|Error| CatchError[Catch Error]
    
    CatchError --> IdentifyError{Error Type?}
    
    IdentifyError -->|Network Error| NetworkHandler[Network Error Handler]
    IdentifyError -->|Auth Error| AuthHandler[Auth Error Handler]
    IdentifyError -->|API Error| APIHandler[API Error Handler]
    IdentifyError -->|Validation Error| ValidationHandler[Validation Error Handler]
    IdentifyError -->|Unknown Error| GenericHandler[Generic Error Handler]
    
    NetworkHandler --> LogError[(Log to Console)]
    AuthHandler --> LogError
    APIHandler --> LogError
    ValidationHandler --> LogError
    GenericHandler --> LogError
    
    LogError --> ShowToast[Show Error Toast]
    
    NetworkHandler --> RetryPrompt{Offer Retry?}
    APIHandler --> RetryPrompt
    
    RetryPrompt -->|Yes| RetryButton[Show Retry Button]
    RetryPrompt -->|No| ShowToast
    
    AuthHandler --> RedirectLogin[Redirect to Login]
    ValidationHandler --> HighlightField[Highlight Invalid Field]
    
    RetryButton --> UserRetry{User Clicks Retry?}
    UserRetry -->|Yes| TryOperation
    UserRetry -->|No| End([Operation Failed])
    
    ShowToast --> End
    RedirectLogin --> End
    HighlightField --> End
    Success --> End2([Operation Complete])
    
    style Start fill:#4caf50
    style End2 fill:#2196f3
    style End fill:#f44336
    style LogError fill:#ff9800
```

---

## 11. Complete User Journey Map

```mermaid
journey
    title SMELLO User Journey - From Discovery to Power User
    section Discovery
      Visit landing page: 5: User
      Read features: 4: User
      Click Get Started: 5: User
    section Onboarding
      Choose PM Tools: 5: User
      Select role: 4: User
      Sign in with Google: 3: User, Clerk
      Profile created: 5: User, System
    section First Use
      View workflow home: 5: User
      Explore tools: 4: User
      Generate first idea: 5: User, AI
      Create project: 5: User, System
    section Regular Use
      Open existing project: 5: User
      Generate PRD: 5: User, AI
      Build roadmap: 4: User, AI
      Create pitch deck: 5: User, AI
    section Power User
      Add custom API key: 4: User
      Use all tools: 5: User, AI
      Manage multiple projects: 5: User
      Export artifacts: 4: User
```

---

## 12. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Landing: Visit Site
    
    Landing --> PathSelection: Click Get Started
    PathSelection --> Onboarding: Select PM Tools
    PathSelection --> ComingSoon: Select Teams
    
    Onboarding --> Authenticating: Complete Steps
    Authenticating --> Authenticated: Sign In Success
    Authenticating --> Onboarding: Sign In Failed
    
    Authenticated --> WorkflowHome: PM Tools Selected
    Authenticated --> TeamDashboard: Teams Selected
    
    WorkflowHome --> ToolActive: Open Tool
    ToolActive --> Generating: Click Generate
    Generating --> ToolActive: Generation Complete
    Generating --> Error: Generation Failed
    Error --> ToolActive: Retry
    
    ToolActive --> ProjectView: Save to Project
    ProjectView --> ToolActive: Edit Artifact
    
    WorkflowHome --> ProjectManager: View Projects
    ProjectManager --> ProjectView: Select Project
    ProjectView --> ProjectManager: Back to List
    
    WorkflowHome --> Settings: Open Settings
    Settings --> WorkflowHome: Save Settings
    
    ComingSoon --> PathSelection: Go Back
    
    note right of Authenticated
        User profile created
        Session active
        Data synced
    end note
    
    note right of Generating
        AI API called
        Usage tracked
        Results parsed
    end note
```

---

## How to Use These Diagrams

### Viewing in GitHub
These Mermaid diagrams will render automatically when viewing this file on GitHub.

### Viewing Locally
1. Use a Mermaid-compatible Markdown viewer
2. Use VS Code with Mermaid extension
3. Use online Mermaid Live Editor: https://mermaid.live

### Editing Diagrams
1. Copy diagram code
2. Paste into Mermaid Live Editor
3. Make changes
4. Copy back to this file

### Exporting
1. Open in Mermaid Live Editor
2. Click "Actions" → "Export"
3. Choose PNG, SVG, or PDF

---

## Diagram Legend

### Node Shapes
- `[Rectangle]` - Process/Action
- `{Diamond}` - Decision Point
- `[(Database)]` - Data Storage
- `([Rounded])` - Start/End Point
- `[[Subroutine]]` - Sub-process

### Colors (in styled diagrams)
- 🟢 Green - Start/Success
- 🔵 Blue - End/Complete
- 🟠 Orange - Warning/Alternative
- 🟣 Purple - Important Process
- 🔴 Red - Storage/Critical

---

**Document Version**: 1.0  
**Last Updated**: December 31, 2025  
**Diagrams**: 12 comprehensive flows  
**Status**: Production Documentation
