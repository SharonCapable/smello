# Clerk Authentication Migration Guide

## Overview

SMELLO has migrated from NextAuth to **Clerk** for authentication. Clerk provides a more robust authentication system with better Google OAuth integration and superior user management.

## ✅ Migration Completed

### Files Modified:
1. **Authentication Setup:**
   - ✅ Created `middleware.ts` for Clerk route protection
   - ✅ Updated `app/layout.tsx` with ClerkProvider
   - ✅ Removed NextAuth API route (`app/api/auth/[...nextauth]/`)
   
2. **Client Components:**
   - ✅ `components/auth-provider.tsx` - Now syncs Clerk user to Firestore
   - ✅ `components/app-header.tsx` - Uses Clerk authentication
   - ✅ `components/landing-page.tsx` - Uses Clerk sign-in
   - ✅ `components/onboarding-flow.tsx` - Uses Clerk sign-in
   - ✅ `components/user-profile.tsx` - Uses Clerk hooks
   - ✅ `components/api-key-setup.tsx` - Uses Clerk authentication state
   - ✅ `app/page.tsx` - Main page uses Clerk hooks
   - ✅ `app/onboarding/page.tsx` - Onboarding uses Clerk

3. **Server Components/API Routes:**
   - ✅ `app/api/generate/route.ts` - Uses Clerk auth()
   - ✅ `app/api/profile/[uid]/route.ts` - Uses Clerk auth()
   - ✅ `app/api/keys/route.ts` - Uses Clerk auth()
   - ✅ `app/settings/keys/page.tsx` - Uses Clerk hooks

4. **Layout Improvements:**
   - ✅ Competitive Intelligence - Full-width layout
   - ✅ PRD Generator - Full-width layout
   - ✅ Feature Prioritization - Full-width layout
   - ✅ Research Agent - Full-width layout

## 🔧 Setup Instructions

### 1. Get Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use existing)
3. Go to **API Keys** in the sidebar
4. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)

### 2. Configure Google OAuth in Clerk

1. In Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Enable **Google**
3. Follow Clerk's instructions to set up Google OAuth
4. Clerk will handle the OAuth flow automatically

### 3. Update Environment Variables

Add to your `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Keep existing variables
GEMINI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### 4. Deploy to Vercel

Add environment variables in Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both Clerk keys
4. Redeploy

## 🎯 Key Changes

### User ID Mapping
- **Before (NextAuth):** `session.user.uid` or email-based fallback
- **After (Clerk):** `user.id` (consistent Clerk user ID)

Users are now identified by Clerk's `user.id`, which is synced to Firestore profiles automatically by `AuthProvider`.

### Authentication Flow
1. User clicks "Sign In" → Clerk's sign-in modal appears
2. User authenticates with Google
3. Clerk redirects to app
4. `AuthProvider` syncs Clerk user to Firestore:
   - User ID: `user.id`
   - Email: `user.primaryEmailAddress.emailAddress`
   - Name: `user.fullName`
   - Photo: `user.imageUrl`

### API Route Authentication

**Before:**
```typescript
const session = await getServerSession(authOptions)
if (!session) return unauthorized
const uid = session.user.uid
```

**After:**
```typescript
const { userId } = await auth()
if (!userId) return unauthorized
// userId is Clerk user ID
```

## 🔒 Security Improvements

1. **JWT-based sessions** managed by Clerk
2. **Automatic token refresh** 
3. **Built-in CSRF protection**
4. **Session management** across devices
5. **Secure OAuth flow** handled by Clerk

## 🧪 Testing Checklist

- [ ] Sign in with Google works
- [ ] User profile syncs to Firestore
- [ ] Onboarding flow completes
- [ ] API key storage/retrieval works
- [ ] AI generation respects usage limits
- [ ] Sign out works correctly
- [ ] Session persists across page reloads

## 🚨 Important Notes

### Google OAuth Tokens
The previous NextAuth implementation stored Google OAuth access/refresh tokens. **Clerk does not expose these by default.**

If you need Google API access (e.g., for Google AI with user's token):
1. Use Clerk's [OAuth Access Token feature](https://clerk.com/docs/users/oauth)
2. Or continue using server-side API keys (current approach)

### Existing Users
- Existing Firestore user profiles remain intact
- User IDs will change from email-based to Clerk IDs
- Users will need to re-authenticate once
- Consider adding a migration script if needed

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Authentication](https://clerk.com/docs/authentication/overview)

---

**Migration completed on:** 2025-12-24
**Next.js version:** 14.2.16
**Clerk version:** 6.36.5 (installed with --legacy-peer-deps due to Next.js peer dependency)
