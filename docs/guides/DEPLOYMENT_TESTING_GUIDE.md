# 🚀 Smello for Teams - Deployment & Testing Guide

## Quick Start

### 1. Environment Setup

Create/update your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# AI API Keys (Optional - for free tier)
GEMINI_API_KEY=your_gemini_key
CLAUDE_API_KEY=your_claude_key
FREE_AI_OPERATIONS_LIMIT=6

# Encryption
ENCRYPTION_KEY=your_32_char_encryption_key
```

### 2. Firestore Security Rules

Add these rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOrgMember(orgId) {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOrgMember(orgId);
      
      // Projects
      match /projects/{projectId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId);
      }
      
      // Workflows
      match /workflows/{workflowId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId);
      }
      
      // Tasks
      match /tasks/{taskId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId);
      }
      
      // Teams
      match /teams/{teamId} {
        allow read: if isOrgMember(orgId);
        allow write: if isOrgMember(orgId);
        
        // Sprints
        match /sprints/{sprintId} {
          allow read: if isOrgMember(orgId);
          allow write: if isOrgMember(orgId);
        }
      }
    }
    
    // Activities (global read for authenticated users)
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId;
    }
    
    // API Keys (encrypted)
    match /apiKeys/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Usage Stats
    match /usageStats/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if isAuthenticated();
    }
    
    // Invites
    match /invites/{inviteId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
  }
}
```

### 3. Firestore Indexes

Create these composite indexes in Firebase Console:

```
Collection: activities
Fields: projectId (Ascending), createdAt (Descending)

Collection: comments
Fields: projectId (Ascending), createdAt (Ascending)

Collection: comments
Fields: projectId (Ascending), stageId (Ascending), createdAt (Ascending)

Collection: organizations/{orgId}/projects
Fields: teamId (Ascending), updatedAt (Descending)

Collection: organizations/{orgId}/workflows
Fields: projectId (Ascending)
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication & Onboarding
- [ ] Sign up with new account
- [ ] Complete onboarding flow
- [ ] Choose "Smello for Teams" path
- [ ] Create organization and team
- [ ] Verify redirect to team dashboard

#### Project Management
- [ ] Navigate to Projects tab
- [ ] Click "New Project"
- [ ] Fill in project details (name, client, description)
- [ ] Select "Full Research & Development Pipeline"
- [ ] Preview workflow stages
- [ ] Create project
- [ ] Verify project appears in list
- [ ] Click on project to view workflow

#### Workflow Tracking
- [ ] View workflow tracker
- [ ] Check current stage is highlighted
- [ ] Click on a stage to expand details
- [ ] Update stage status
- [ ] Add notes to stage
- [ ] Add a blocker
- [ ] Click "Complete & Advance"
- [ ] Verify next stage becomes current
- [ ] Check progress bar updates

#### Real-Time Sync (Multi-User)
- [ ] Open app in two different browsers/users
- [ ] User 1: Create a project
- [ ] User 2: Verify project appears immediately
- [ ] User 1: Update workflow stage
- [ ] User 2: Verify stage update appears live
- [ ] User 1: Add comment
- [ ] User 2: Verify comment appears instantly

#### Comments & Mentions
- [ ] Navigate to a project
- [ ] Add a comment
- [ ] Use @mention to tag someone
- [ ] Reply to a comment
- [ ] Add emoji reaction
- [ ] Verify threaded conversation
- [ ] Check mentioned user gets notification

#### Notifications
- [ ] Click bell icon
- [ ] Verify unread count badge
- [ ] View notification list
- [ ] Click notification to mark as read
- [ ] Click "Mark all as read"
- [ ] Clear all notifications

#### Command Palette
- [ ] Press Cmd+K (or Ctrl+K on Windows)
- [ ] Type "create project"
- [ ] Use arrow keys to navigate
- [ ] Press Enter to execute
- [ ] Try "Go to Analytics"
- [ ] Test keyboard shortcuts

#### Search & Filter
- [ ] Search for project by name
- [ ] Filter by status (Active)
- [ ] Filter by status (Completed)
- [ ] Clear filters
- [ ] Verify results update instantly

#### Error Handling
- [ ] Try creating project without name
- [ ] Try advancing workflow without completing stage
- [ ] Test with poor internet connection
- [ ] Verify error messages are clear
- [ ] Check toast notifications appear

---

## 🔍 Performance Testing

### Metrics to Monitor

```javascript
// Add to your analytics
const metrics = {
  pageLoad: performance.now(),
  realtimeLatency: Date.now() - lastUpdate,
  renderTime: performance.measure('render'),
  memoryUsage: performance.memory?.usedJSHeapSize
}
```

### Performance Targets
- ✅ Initial page load: < 2 seconds
- ✅ Real-time update latency: < 500ms
- ✅ Command palette open: < 100ms
- ✅ Search results: < 200ms
- ✅ Workflow render: < 300ms

### Load Testing
```bash
# Test with multiple concurrent users
# Use tools like:
- Artillery
- k6
- Apache JMeter
```

---

## 🐛 Debugging

### Common Issues

#### 1. "Firestore not initialized"
**Solution**: Check Firebase config in `.env.local`

#### 2. Real-time updates not working
**Solution**: 
- Verify Firestore security rules
- Check browser console for errors
- Ensure user is authenticated

#### 3. Notifications not appearing
**Solution**:
- Check activity logging is working
- Verify `subscribeToProjectActivities` is called
- Check Firestore indexes are created

#### 4. Workflow not saving
**Solution**:
- Check Timestamp conversions
- Verify Firestore write permissions
- Check browser console for errors

### Debug Mode

Add to your component:

```typescript
useEffect(() => {
  console.log('Projects:', projects)
  console.log('Workflows:', workflows)
  console.log('Selected:', selectedProjectId)
}, [projects, workflows, selectedProjectId])
```

---

## 📊 Monitoring

### Firebase Console
- Monitor Firestore usage
- Check security rule violations
- View real-time database activity
- Track authentication events

### Vercel Analytics (if deployed)
- Page views
- User sessions
- Error rates
- Performance metrics

### Custom Logging

```typescript
// Add to critical functions
const logActivity = async (action: string, details: any) => {
  console.log(`[${new Date().toISOString()}] ${action}`, details)
  
  // Send to analytics
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(action, details)
  }
}
```

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables in Vercel
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all variables from `.env.local`
4. Redeploy

### Post-Deployment Checklist
- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Check Firestore connection
- [ ] Test real-time features
- [ ] Verify API routes work
- [ ] Check error logging
- [ ] Test on mobile devices
- [ ] Run performance audit

---

## 📱 Mobile Testing

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Test Devices
- iPhone 12/13/14
- iPad Pro
- Samsung Galaxy S21
- Various Android tablets

### Mobile-Specific Features
- [ ] Touch gestures work
- [ ] Modals are scrollable
- [ ] Text is readable
- [ ] Buttons are tappable (min 44x44px)
- [ ] Forms are usable
- [ ] Navigation is accessible

---

## 🔐 Security Checklist

- [ ] Firestore security rules configured
- [ ] API keys encrypted
- [ ] User authentication required
- [ ] CORS configured properly
- [ ] No sensitive data in client code
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens where needed

---

## 📈 Analytics Events to Track

```typescript
// Track these events
const events = {
  // User Actions
  'project_created': { projectId, templateId },
  'workflow_advanced': { projectId, stageId },
  'comment_added': { projectId, hasM mentions },
  'notification_clicked': { notificationId, type },
  
  // Engagement
  'command_palette_used': { action },
  'search_performed': { query, resultsCount },
  'filter_applied': { filterType, value },
  
  // Performance
  'page_load_time': { page, duration },
  'realtime_latency': { duration },
  
  // Errors
  'error_occurred': { error, context }
}
```

---

## 🎯 Success Criteria

### Week 1
- [ ] 10 active users
- [ ] 20+ projects created
- [ ] 50+ workflow stages completed
- [ ] < 5% error rate

### Month 1
- [ ] 100 active users
- [ ] 500+ projects
- [ ] 90% user retention
- [ ] < 2% error rate
- [ ] < 2s average page load

### Quarter 1
- [ ] 1000 active users
- [ ] 5000+ projects
- [ ] 95% uptime
- [ ] Feature parity with ClickUp
- [ ] Mobile app launched

---

## 🆘 Support

### Documentation
- User Guide: `/docs/user-guide.md`
- API Docs: `/docs/api.md`
- FAQs: `/docs/faq.md`

### Contact
- Email: support@smello.ai
- Discord: discord.gg/smello
- GitHub Issues: github.com/smello/issues

---

## 🎊 Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] Security audit completed
- [ ] Performance optimized
- [ ] Documentation written
- [ ] Support channels ready
- [ ] Analytics configured
- [ ] Backup strategy in place

### Launch Day
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Watch real-time metrics
- [ ] Be ready for support requests
- [ ] Announce on social media
- [ ] Send email to beta users

### Post-Launch
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Optimize based on metrics
- [ ] Plan next features
- [ ] Celebrate! 🎉

---

**Ready to launch! 🚀**

Last Updated: December 29, 2024
