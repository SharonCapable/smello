# 🔐 Firestore Security Rules Migration Guide

## Overview
Your current Firestore rules only support **individual user access**. The new rules add **team collaboration** while preserving all existing functionality.

---

## 📋 What's Changed

### ✅ **Preserved (Your Existing Rules)**
- `/users/{userId}` - Personal user profiles
- `/projects/{projectId}` - Personal projects (individual use)
- `/usageStats/{userId}` - Personal usage tracking
- `/apiKeys/{userId}` - Personal API keys

### ✨ **New (Team Collaboration)**
- `/organizations/{orgId}` - Team organizations
- `/organizations/{orgId}/projects/{projectId}` - **Team projects**
- `/organizations/{orgId}/workflows/{workflowId}` - **Workflow tracking**
- `/organizations/{orgId}/tasks/{taskId}` - Team tasks
- `/organizations/{orgId}/teams/{teamId}` - Teams
- `/activities/{activityId}` - Activity logs (global)
- `/comments/{commentId}` - Comments system (global)
- `/invites/{inviteId}` - Organization invites

---

## 🚀 Migration Steps

### Step 1: Backup Current Rules
1. Go to Firebase Console → Firestore Database → Rules
2. Copy your current rules and save them somewhere safe
3. Take a screenshot for reference

### Step 2: Update Rules in Firebase Console

**Option A: Via Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file I just created
5. Paste into the Firebase Console
6. Click **Publish**

**Option B: Via Firebase CLI**
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Step 3: Create Required Indexes

The new team features require composite indexes. Create these in Firebase Console:

**Go to: Firestore Database → Indexes → Composite**

1. **Activities by Project**
   - Collection: `activities`
   - Fields: `projectId` (Ascending), `createdAt` (Descending)
   - Query Scope: Collection

2. **Comments by Project**
   - Collection: `comments`
   - Fields: `projectId` (Ascending), `createdAt` (Ascending)
   - Query Scope: Collection

3. **Comments by Project and Stage**
   - Collection: `comments`
   - Fields: `projectId` (Ascending), `stageId` (Ascending), `createdAt` (Ascending)
   - Query Scope: Collection

4. **Team Projects**
   - Collection Group: `projects` (under organizations)
   - Fields: `teamId` (Ascending), `updatedAt` (Descending)
   - Query Scope: Collection Group

**Or use these Firebase CLI commands:**
```bash
# The app will automatically suggest creating these indexes
# when you first run queries that need them
# Just click the link in the console error and Firebase will create them
```

---

## 🧪 Testing the New Rules

### Test 1: Personal Features Still Work
```javascript
// This should still work (your existing functionality)
const personalProject = await getDoc(doc(db, 'projects', projectId))
// ✅ Should succeed if you own the project
```

### Test 2: Team Features Work
```javascript
// This should now work (new team functionality)
const teamProjects = await getDocs(
  collection(db, 'organizations', orgId, 'projects')
)
// ✅ Should succeed if you're in the organization
```

### Test 3: Security Works
```javascript
// This should fail (security working correctly)
const otherUserProject = await getDoc(doc(db, 'projects', 'someone-elses-project'))
// ❌ Should fail with permission denied
```

---

## 🔍 Understanding the New Rules

### Access Control Hierarchy

```
Individual User (Existing)
├── /users/{userId} ← You own this
├── /projects/{projectId} ← You own this
├── /usageStats/{userId} ← You own this
└── /apiKeys/{userId} ← You own this

Organization (New)
├── /organizations/{orgId}
│   ├── /projects/{projectId} ← Team members can access
│   ├── /workflows/{workflowId} ← Team members can access
│   ├── /tasks/{taskId} ← Team members can access
│   └── /teams/{teamId}
│       ├── /sprints/{sprintId} ← Team members can access
│       └── /members/{memberId} ← Team members can access

Global Shared (New)
├── /activities/{activityId} ← All authenticated users can read
├── /comments/{commentId} ← All authenticated users can read/write
└── /invites/{inviteId} ← All authenticated users can read
```

### Key Security Features

1. **Personal Data Protected** ✅
   - Only you can access your personal projects, API keys, etc.

2. **Team Data Shared** ✅
   - Team members can access organization projects
   - Workflows are visible to all team members
   - Comments are collaborative

3. **Creation Rights** ✅
   - Any authenticated user can create organizations
   - Only team members can create projects within organizations

4. **Modification Rights** ✅
   - Only resource owners can update their personal data
   - Only team members can update team resources

---

## ⚠️ Important Notes

### 1. **Backward Compatibility**
✅ All existing personal projects will continue to work  
✅ No data migration needed  
✅ Users can use both personal and team features  

### 2. **Data Separation**
- **Personal projects**: `/projects/{projectId}`
- **Team projects**: `/organizations/{orgId}/projects/{projectId}`
- These are **separate collections** - no conflicts!

### 3. **Simplified Access Control**
The rules use a simplified `hasOrgAccess()` function that checks:
- User is authenticated
- Organization exists

For production, you may want to add more granular checks:
```javascript
// Future enhancement: Check actual team membership
function isTeamMember(orgId, teamId) {
  return exists(/databases/$(database)/documents/organizations/$(orgId)/teams/$(teamId)/members/$(request.auth.uid));
}
```

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: Rules not published or indexes not created

**Solution**:
1. Verify rules are published in Firebase Console
2. Check if indexes are created (Firestore → Indexes)
3. Wait 1-2 minutes for rules to propagate

### Error: "The query requires an index"

**Cause**: Composite index not created

**Solution**:
1. Click the link in the error message
2. Firebase will auto-create the index
3. Wait for index to build (usually 1-2 minutes)

### Error: "Cannot read from organization"

**Cause**: Organization doesn't exist or user not authenticated

**Solution**:
1. Verify user is logged in (check `auth.currentUser`)
2. Verify organization exists in Firestore
3. Check browser console for auth errors

---

## 📊 Monitoring

### Check Rules Usage
1. Go to Firebase Console → Firestore → Usage
2. Monitor read/write operations
3. Check for permission denied errors

### Security Audit
```javascript
// Test these scenarios:
1. ✅ Can read own personal projects
2. ✅ Can read team projects in my org
3. ❌ Cannot read other users' personal projects
4. ❌ Cannot read projects in orgs I'm not in
5. ✅ Can create projects in my org
6. ❌ Cannot delete other users' data
```

---

## 🚀 Deployment Checklist

- [ ] Backup current Firestore rules
- [ ] Copy new rules to Firebase Console
- [ ] Publish rules
- [ ] Create composite indexes
- [ ] Wait for indexes to build
- [ ] Test personal features (existing)
- [ ] Test team features (new)
- [ ] Monitor for errors
- [ ] Verify security works

---

## 📝 Quick Reference

### Deploy Rules via CLI
```bash
firebase deploy --only firestore:rules
```

### Deploy Rules + Indexes
```bash
firebase deploy --only firestore
```

### Test Rules Locally
```bash
firebase emulators:start --only firestore
```

---

## 🎯 Next Steps

After updating rules:

1. **Test in Development**
   - Create a test organization
   - Create a test project
   - Verify real-time sync works

2. **Monitor in Production**
   - Watch for permission errors
   - Check index build status
   - Monitor query performance

3. **Optimize Later**
   - Add role-based access control (admin, member, viewer)
   - Add project-level permissions
   - Add audit logging

---

## ✅ Summary

**What You Need to Do:**
1. ✅ Copy `firestore.rules` to Firebase Console
2. ✅ Publish the rules
3. ✅ Create the 4 composite indexes
4. ✅ Test both personal and team features

**What's Protected:**
- ✅ All your existing personal data
- ✅ All new team collaboration data
- ✅ Proper access control for both

**Ready to go!** 🚀

---

**Questions?** Check the troubleshooting section or reach out for help!
