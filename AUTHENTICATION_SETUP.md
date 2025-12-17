# 🔐 Authentication System - Setup Guide

## Overview

SMELLO now has a **3-tier authentication system** that provides flexible AI access:

### Tier 1: Anonymous/Guest (Current)
- ✅ 6 free AI operations per 24-hour session
- ✅ Uses ENV API keys
- ✅ Projects saved in localStorage
- ⚠️ Limited operations

### Tier 2: Google Sign-In (NEW!)
- ✅ Unlimited AI operations
- ✅ Access to Google AI (Gemini) if linked to account
- ✅ Projects saved to cloud database (future)
- ✅ Cross-device sync (future)
- ✅ No operation limits

### Tier 3: Custom API Keys
- ✅ Unlimited operations
- ✅ Use your own Gemini/Claude API keys
- ✅ Full control over AI usage
- ✅ No dependency on ENV keys

## 🚀 Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Generative Language API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: SMELLO
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: SMELLO Web Client
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Existing API Keys (keep these)
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-claude-key
```

### Step 3: Generate NextAuth Secret

Run in terminal:
```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env`

### Step 4: Restart Development Server

```bash
npm run dev
```

## 📁 Files Created

### Authentication Core:
```
app/api/auth/[...nextauth]/route.ts  # NextAuth configuration
app/auth/signin/page.tsx              # Custom sign-in page
components/auth-provider.tsx          # Session provider wrapper
components/user-profile.tsx           # User profile UI
lib/ai-service-manager.ts             # Tiered AI access manager
```

### Dependencies Added:
```json
{
  "next-auth": "latest",
  "@auth/core": "latest"
}
```

## 🎯 How It Works

### Authentication Flow:

1. **User clicks "Sign In"** → Redirected to Google OAuth
2. **User authorizes SMELLO** → Google returns access token
3. **NextAuth creates session** → Token stored in JWT
4. **User is signed in** → Access to unlimited AI operations

### AI Service Priority:

```typescript
// When generating AI content:
1. Check if user signed in with Google → Use Google AI access token
2. Check if user has custom API key → Use their key
3. Fall back to ENV key → Apply usage limits (6 operations)
```

### Usage Counter Behavior:

- **Signed Out**: Counter shows "X/6" and decrements
- **Signed In (Google)**: Counter shows "∞" (unlimited)
- **Signed In (Custom Key)**: Counter shows "∞" (unlimited)

## 🧪 Testing

### Test Anonymous Access:
1. Don't sign in
2. Generate ideas → Counter shows "5/6"
3. Continue until "0/6"
4. See prompt to sign in

### Test Google Sign-In:
1. Click "Sign In" in sidebar
2. Authorize with Google
3. See your profile in sidebar
4. Generate content → No limits!
5. Counter shows unlimited

### Test API Key Override:
1. Sign in with Google
2. Go to Settings
3. Add custom Gemini key
4. Generate content → Uses your key

## 🔒 Security Features

### Session Management:
- JWT-based sessions (no database required initially)
- 30-day session expiration
- Secure HTTP-only cookies
- CSRF protection built-in

### Token Storage:
- Access tokens encrypted in JWT
- Refresh tokens for long-term access
- Automatic token refresh

### Data Privacy:
- User data only stored in session
- Projects in localStorage (for now)
- No tracking or analytics

## 🚀 Future Enhancements

### Database Integration (Next Phase):
```typescript
// Store projects in database instead of localStorage
- User ID linked to projects
- Cross-device sync
- Team collaboration
- Version history
```

### Enhanced AI Access:
```typescript
// Check if user has Claude linked to Google account
- Anthropic OAuth integration
- Multi-provider support
- Automatic provider selection
```

### User Dashboard:
```typescript
// Personal dashboard for signed-in users
- Usage statistics
- Project history
- Team management
- Billing (if premium features added)
```

## 📊 Component Integration

### Sidebar Navigation:
```tsx
// Shows user profile at bottom
<UserProfile />
// Displays:
// - Avatar
// - Name
// - "Pro" badge
// - Sign out option
```

### Usage Counter Badge:
```tsx
// Updates based on auth state
{session ? (
  <Badge>∞ Unlimited</Badge>
) : (
  <Badge>{remaining}/6</Badge>
)}
```

### AI Generation:
```tsx
// Uses AIServiceManager
const config = await AIServiceManager.getServiceConfig('gemini', session)
// Returns best available service
```

## 🐛 Troubleshooting

### "Invalid OAuth Redirect URI":
- Check redirect URI in Google Console matches exactly
- Must be: `http://localhost:3000/api/auth/callback/google`

### "NEXTAUTH_SECRET is not set":
- Generate secret: `openssl rand -base64 32`
- Add to `.env` file
- Restart server

### "Session not persisting":
- Clear browser cookies
- Check NEXTAUTH_URL matches your domain
- Verify `.env` file is loaded

### "Google AI access not working":
- Ensure Generative Language API is enabled
- Check OAuth scopes include AI access
- Verify access token is valid

## 📝 Environment Variables Checklist

```env
✅ NEXTAUTH_URL=http://localhost:3000
✅ NEXTAUTH_SECRET=<generated-secret>
✅ GOOGLE_CLIENT_ID=<from-google-console>
✅ GOOGLE_CLIENT_SECRET=<from-google-console>
✅ GEMINI_API_KEY=<your-key>
✅ ANTHROPIC_API_KEY=<your-key>
```

## 🎉 What Users See

### Before Sign-In:
- "Sign In" button in sidebar
- Usage counter: "6/6"
- Limited to 6 operations
- Prompt to sign in when limit reached

### After Sign-In:
- User avatar and name in sidebar
- "Pro" badge
- Usage counter: "∞ Unlimited"
- Access to all features
- Projects sync (future)

## 🔄 Migration Path

### Current Users (localStorage):
1. Sign in with Google
2. Projects remain in localStorage
3. Future: Migrate to cloud database
4. Seamless transition

### New Users:
1. Can start as guest (6 operations)
2. Sign in anytime for unlimited access
3. Projects automatically saved to account

## 📚 API Reference

### AIServiceManager:
```typescript
// Get best available AI service
const config = await AIServiceManager.getServiceConfig('gemini', session)

// Check if operation should count
const shouldCount = AIServiceManager.shouldCountOperation(config)

// Check if user can perform operation
const { allowed, reason } = AIServiceManager.canPerformOperation(config)
```

### Session Access:
```typescript
import { useSession } from "next-auth/react"

const { data: session, status } = useSession()
// session.user.name
// session.user.email
// session.user.image
// session.accessToken (for Google AI)
```

## 🎯 Success Criteria

✅ Users can sign in with Google
✅ Signed-in users have unlimited AI access
✅ Anonymous users limited to 6 operations
✅ Custom API keys work for all users
✅ Session persists across page reloads
✅ User profile shows in sidebar
✅ Sign out works correctly

---

**Ready to test!** Just add your Google OAuth credentials to `.env` and restart the server. 🚀
