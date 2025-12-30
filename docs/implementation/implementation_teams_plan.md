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

## 2. Phase 1: Foundation & Onboarding (Status: ✅ Completed)
- [x] **Org/Team Onboarding**: Update `onboarding-flow.tsx` to support:
  - [x] Step 1: Create or Selection Organization in Firestore.
  - [x] Step 2: Select or Create Team in Firestore.
- [x] **Global State**: Ensure `organizationId` and `teamId` are available via props and local storage.

## 3. Phase 2: The "My Dashboard" (Personal Workspace) (Status: ✅ Completed)
- [x] **Notion-Style Table Engine**: Create a reusable table component (`components/teams/task-table.tsx`) that supports:
  - Inline editing.
  - Drag-resizable columns.
  - Adding custom columns.
- [x] **Personal Task Management**: View and manage tasks that are purely personal or assigned to the user.

## 4. Phase 3: Collaboration Hub (Status: ✅ Completed)
- [x] Create shared task pool view in `CollaborationHub`.
- [x] Implement "Promote to Collaboration" logic in `MyDashboard`.
- [x] Basic Team Stats (Velocity placeholder, Active members).
- [x] Activity Log & Discussion visual structure.

## 5. Phase 4: Sprint Management (Status: ✅ Completed)
- [x] **Sprint Creator**: Modal/Form to define sprint duration and recurring rules.
- [x] **Sprint Board**: Kanban-style view of the current sprint with task status transitions.

## 6. UI/UX Style Guide (Status: ✅ Active & Polished)
- [x] **Theme**: Light-first, soft neutrals, high contrast where needed.
- [x] **Interactions**: Minimal clicks, no nested modals, hover-to-reveal cells.
- [x] **Components**: Use `shadcn/ui` with customized airy spacing.
- [x] **Table Polish**: Real-time resizing and dynamic column additions.

## 7. Phase 7: Analytics & Real-time Features (Status: ✅ Completed)
- [x] **Sprint Burndown Chart**: Visual representation of work remaining vs. time.
- [x] **Team Analytics**: Velocity tracking and workload distribution.
- [x] **Real-time Notifications**: In-app alerts for team mentions and status changes.

## 8. Phase 8: External Integrations & Communication (Status: ✅ UI/UX Functional)
- [x] **Unified Calendar View**: Combine personal and team schedules in `CalendarView`.
- [x] **Calendar Integration**: Google Calendar & MS Teams sync placeholders.
- [x] **Communication Hub**: In-app email/message previewer in `MessageCenter`.

---
*Status: Advanced Ecosystem Implemented - PRD v1.2*
