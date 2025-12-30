# 🔐 Smello Access Control & Organization Management

## Overview
Smello now has **proper access control** to prevent unauthorized organization creation and ensure team collaboration is invitation-based.

---

## 🎯 Access Control Model

### **Two Modes of Operation**

```
┌─────────────────────────────────────────────────────────┐
│                    SMELLO ACCESS                         │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                    ┌────────▼────────┐
│  PM TOOLKIT    │                    │ SMELLO FOR TEAMS│
│  (Individual)  │                    │ (Invitation-Only)│
└────────────────┘                    └─────────────────┘
        │                                       │
        │                                       │
   ✅ Anyone                              ✅ Invited Users Only
   can access                             ✅ Must join organization
                                         ✅ Admin-controlled
```

---

## 👥 User Roles & Permissions

### **Role Hierarchy**

```
Super Admin (You)
    ├── Can create organizations
    ├── Can delete organizations
    ├── Full access to all features
    └── Can promote other super admins
        │
        ▼
Organization Admin
    ├── Can invite users to organization
    ├── Can create teams
    ├── Can manage organization settings
    └── Cannot create new organizations
        │
        ▼
Team Admin
    ├── Can invite users to their team
    ├── Can manage team projects
    └── Cannot create teams
        │
        ▼
Member
    ├── Can view and edit team projects
    ├── Can comment and collaborate
    └── Cannot invite others
        │
        ▼
Viewer
    ├── Read-only access
    └── Cannot edit anything
```

---

## 🚀 How It Works

### **1. Initial Setup (You - Super Admin)**

```typescript
// Step 1: Mark yourself as super admin in Firestore
// Go to Firebase Console → Firestore → users → {your-user-id}
// Add field: isSuperAdmin = true

// Step 2: Create your organization
const orgId = await createOrganization(
  userId,
  "Wizzle",
  "wizzle.ai", // Optional: email domain
  {
    allowSelfSignup: false, // Users can't join without invite
    requireApproval: true,  // Join requests need approval
    maxMembers: 50          // Optional: limit team size
  }
)
```

### **2. Inviting Team Members**

```typescript
// As org admin, send invite
const inviteId = await sendOrganizationInvite(orgId, {
  orgId: orgId,
  orgName: "Wizzle",
  email: "teammate@wizzle.ai",
  role: "member", // or "org_admin", "team_admin", "viewer"
  invitedBy: userId,
  invitedByName: "Sharon",
  message: "Join our team on Smello!"
})

// Invite expires in 7 days automatically
```

### **3. User Accepts Invite**

```typescript
// User logs in and sees pending invite
const invites = await getPendingInvitesForUser(userEmail)

// User clicks "Accept"
await acceptOrganizationInvite(
  inviteId,
  userId,
  userEmail,
  userName
)

// User is now part of organization!
```

---

## 🔒 Security Features

### **1. Organization Creation**
- ❌ Regular users **CANNOT** create organizations
- ✅ Only **super admins** can create organizations
- ✅ Prevents spam and unauthorized orgs

### **2. Team Access**
- ❌ Users **CANNOT** access teams without invitation
- ✅ Must be organization member first
- ✅ Then can be added to specific teams

### **3. Invitation System**
- ✅ Email-based invitations
- ✅ 7-day expiration
- ✅ One-time use
- ✅ Role-based access

### **4. Data Isolation**
- ✅ PM Toolkit data is separate
- ✅ Team data is organization-scoped
- ✅ No cross-contamination

---

## 📋 Firestore Structure

```
/users/{userId}
  ├── isSuperAdmin: boolean        ← YOU set this to true
  ├── email: string
  └── name: string

/organizations/{orgId}
  ├── name: "Wizzle"
  ├── domain: "wizzle.ai"
  ├── superAdmins: [userId]
  ├── settings: {...}
  │
  ├── /members/{userId}            ← Organization members
  │   ├── role: "org_admin"
  │   ├── email: string
  │   └── joinedAt: timestamp
  │
  ├── /teams/{teamId}              ← Teams within org
  │   ├── name: "Engineering"
  │   │
  │   └── /members/{userId}        ← Team members
  │       ├── role: "admin"
  │       └── joinedAt: timestamp
  │
  ├── /projects/{projectId}        ← Team projects
  └── /workflows/{workflowId}      ← Workflows

/invites/{inviteId}                ← Pending invitations
  ├── orgId: string
  ├── email: string
  ├── status: "pending"
  ├── expiresAt: timestamp
  └── role: string
```

---

## 🎯 Implementation Steps

### **Step 1: Make Yourself Super Admin**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Firestore Database**
3. Find **users** collection
4. Find your user document (your Clerk user ID)
5. Click **Add field**:
   - Field: `isSuperAdmin`
   - Type: `boolean`
   - Value: `true`
6. Save

**Alternatively, use this code:**
```typescript
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Run this once to make yourself super admin
await updateDoc(doc(db, 'users', 'YOUR_USER_ID'), {
  isSuperAdmin: true
})
```

### **Step 2: Create Your Organization**

```typescript
// In your app, create organization
const orgId = await createOrganization(
  userId,
  "Wizzle",
  "wizzle.ai"
)
```

### **Step 3: Invite Team Members**

Use the new invitation UI (I'll create this next) or manually:

```typescript
await sendOrganizationInvite(orgId, {
  orgId,
  orgName: "Wizzle",
  email: "teammate@wizzle.ai",
  role: "member",
  invitedBy: userId,
  invitedByName: "Sharon"
})
```

---

## 🔄 User Flow

### **For You (Super Admin)**
1. ✅ Access PM Toolkit (always available)
2. ✅ Access Smello for Teams
3. ✅ Create organization "Wizzle"
4. ✅ Invite team members
5. ✅ Create teams within organization
6. ✅ Manage everything

### **For Team Members**
1. ✅ Access PM Toolkit (always available)
2. ❌ Cannot access Smello for Teams (no org)
3. ✅ Receive email invitation
4. ✅ Accept invitation
5. ✅ Now can access Smello for Teams
6. ✅ See only "Wizzle" organization
7. ✅ Collaborate on team projects

### **For Random Users**
1. ✅ Access PM Toolkit (always available)
2. ❌ Cannot access Smello for Teams
3. ❌ Cannot create organizations
4. ❌ Cannot see your team data
5. ✅ Can use all PM tools independently

---

## 🛡️ Updated Firestore Rules

```javascript
// Organizations - only super admins can create
match /organizations/{orgId} {
  allow read: if isAuthenticated() && isOrgMember(orgId);
  allow create: if isAuthenticated() && isSuperAdmin();
  allow update, delete: if isOrgAdmin(orgId);
  
  // Members subcollection
  match /members/{memberId} {
    allow read: if isOrgMember(orgId);
    allow write: if isOrgAdmin(orgId);
  }
  
  // Teams subcollection
  match /teams/{teamId} {
    allow read: if isOrgMember(orgId);
    allow create: if isOrgAdmin(orgId);
    allow update, delete: if isOrgAdmin(orgId);
    
    match /members/{memberId} {
      allow read: if isOrgMember(orgId);
      allow write: if isTeamAdmin(orgId, teamId);
    }
  }
  
  // Projects, workflows, etc.
  match /projects/{projectId} {
    allow read, write: if isOrgMember(orgId);
  }
}

// Helper functions
function isSuperAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isSuperAdmin == true;
}

function isOrgMember(orgId) {
  return exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
}

function isOrgAdmin(orgId) {
  let member = get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data;
  return member.role == 'super_admin' || member.role == 'org_admin';
}
```

---

## ✅ Benefits

### **For You**
- ✅ **Full Control**: Only you can create organizations
- ✅ **Secure**: Team data is isolated
- ✅ **Manageable**: Invite-only access
- ✅ **Scalable**: Can create multiple orgs if needed

### **For Your Team**
- ✅ **Clear Access**: Know exactly who's in the team
- ✅ **Professional**: Invitation-based onboarding
- ✅ **Organized**: Proper role hierarchy
- ✅ **Collaborative**: Full team features

### **For Deployment**
- ✅ **Secure**: No unauthorized access
- ✅ **Compliant**: Proper access control
- ✅ **Auditable**: Track who invited whom
- ✅ **Maintainable**: Clear permission model

---

## 🎊 Summary

**What Changed:**
- ✅ Only super admins can create organizations
- ✅ Users must be invited to join teams
- ✅ PM Toolkit remains open to all
- ✅ Team features are invitation-only
- ✅ Proper role-based access control

**What You Need to Do:**
1. Set `isSuperAdmin: true` in your user document
2. Create your "Wizzle" organization
3. Invite your team members
4. They accept invites and join

**Result:**
- 🔒 Secure team collaboration
- 🎯 Controlled access
- 👥 Professional onboarding
- 🚀 Production-ready

---

**Ready to implement!** 🎉
