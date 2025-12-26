# Smello for Teams - Implementation Plan

## 1. Core Architecture Overhaul
### Data Model (Firestore)
- **Organizations**: `/organizations/{orgId}`
  - `name`: string
  - `createdBy`: userId
  - `createdAt`: timestamp
- **Teams**: `/organizations/{orgId}/teams/{teamId}`
  - `name`: string
  - `members`: array of userIds with roles (admin, member)
- **Tasks (Column-Driven)**: `/users/{userId}/tasks` (Personal) or `/organizations/{orgId}/tasks` (Team)
  - `title`: string
  - `type`: "personal" | "team"
  - `teamId`: string (optional)
  - `status`: string
  - `priority`: string
  - `customFields`: map of fieldId -> value
  - `sprintId`: string (optional)
- **Sprints**: `/organizations/{orgId}/teams/{teamId}/sprints/{sprintId}`

## 2. Phase 1: Foundation & Onboarding
- [ ] **Org/Team Onboarding**: Update `onboarding-flow.tsx` to support:
  - Step 1: Create or Selection Organization.
  - Step 2: Select or Create Team.
- [ ] **Global State**: Ensure `organizationId` and `teamId` are available throughout the app.

## 3. Phase 2: The "My Dashboard" (Personal Workspace)
- [ ] **Notion-Style Table Engine**: Create a reusable table component (`components/teams/task-table.tsx`) that supports:
  - Inline editing.
  - Drag-resizable columns.
  - Adding custom columns.
- [ ] **Personal Task Management**: View and manage tasks that are purely personal or assigned to the user.

## 4. Phase 3: Collaboration Hub (Status: ✅ Completed)
- [x] Create shared task pool view in `CollaborationHub`.
- [x] Implement "Promote to Collaboration" logic in `MyDashboard`.
- [x] Basic Team Stats (Velocity placeholder, Active members).
- [x] Activity Log & Discussion visual structure.

## 5. Phase 4: Sprint Management
- [ ] **Sprint Creator**: Modal/Form to define sprint duration and recurring rules.
- [ ] **Sprint Board**: Kanban-style view of the current sprint.

## 6. UI/UX Style Guide
- **Theme**: Light-first, soft neutrals, high contrast where needed.
- **Interactions**: Minimal clicks, no nested modals, hover-to-reveal.
- **Components**: Use `shadcn/ui` with customized airy spacing.

---
*Status: Initial Planning Based on PRD v1.0*
