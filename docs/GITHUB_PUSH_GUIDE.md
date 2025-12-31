# GitHub Push Guide - SMELLO PM Toolkit

## 📋 Pre-Push Checklist

### 1. **Verify Build Success**
```bash
npm run build
```
✅ Ensure no errors before proceeding

### 2. **Check Git Status**
```bash
git status
```

### 3. **Review Changes**
```bash
git diff
```

## 🚀 Step-by-Step Push Instructions

### **Step 1: Stage All Changes**
```bash
git add .
```

### **Step 2: Commit with Meaningful Message**
```bash
git commit -m "feat: Complete PM Toolkit with Clerk auth and Firebase integration

- Implemented Clerk authentication with Google OAuth
- Added Firebase Firestore for data persistence
- Created 9 PM tools (Idea Generator, PRD, Blueprint, etc.)
- Built onboarding flow with path selection
- Added project management system
- Implemented API key management with encryption
- Created responsive UI with dark/light themes
- Added usage tracking and limits
- Integrated Gemini and Claude AI APIs

Breaking Changes:
- Migrated from custom auth to Clerk
- Switched from local storage to Firestore

Known Issues:
- Research Agent disabled (Railway trial expired)
- Team features need security improvements"
```

### **Step 3: Push to GitHub**

#### **If repository already exists:**
```bash
git push origin main
```

#### **If this is a new repository:**

**A. Create repository on GitHub:**
1. Go to https://github.com/new
2. Name: `smello` (or your preferred name)
3. Description: "AI-Powered Product Management Toolkit"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

**B. Connect and push:**
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/smello.git

# Verify remote
git remote -v

# Push to main branch
git push -u origin main
```

## 🔐 Security Verification

### **Before Pushing - Double Check:**

```bash
# Verify .gitignore is working
git status

# These should NOT appear in git status:
# ❌ .env
# ❌ .env.local
# ❌ firebase-service-account.json
# ❌ smello_service_account.json
# ❌ node_modules/
```

### **If sensitive files appear:**
```bash
# Remove from staging
git reset HEAD <filename>

# Add to .gitignore
echo "<filename>" >> .gitignore

# Commit .gitignore update
git add .gitignore
git commit -m "chore: update gitignore"
```

## 📦 Post-Push: Vercel Deployment

### **Step 1: Import to Vercel**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `smello` repository

### **Step 2: Configure Environment Variables**

Add these in Vercel dashboard:

#### **Required:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

API_KEY_ENCRYPTION_KEY=your_32_char_key
```

#### **Optional (for free tier):**
```
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
FREE_AI_OPERATIONS_LIMIT=6
```

### **Step 3: Deploy**
Click "Deploy" and wait for build to complete

### **Step 4: Update Clerk URLs**
1. Go to Clerk Dashboard
2. Update authorized domains to include your Vercel URL
3. Update redirect URLs

### **Step 5: Test Production**
1. Visit your Vercel URL
2. Test sign-in flow
3. Test creating a project
4. Test AI generation
5. Verify data persistence

## 🐛 Troubleshooting

### **Build Fails on Vercel**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint
```

### **Environment Variables Not Working**
- Ensure variables starting with `NEXT_PUBLIC_` are added
- Redeploy after adding environment variables
- Check Vercel logs for specific errors

### **Firebase Connection Issues**
- Verify Firebase service account JSON is properly stringified
- Check Firebase project settings match environment variables
- Ensure Firestore is enabled in Firebase console

### **Clerk Authentication Issues**
- Verify Clerk domain is authorized
- Check redirect URLs are correct
- Ensure API keys are for production (not test)

## 📊 Monitoring After Deployment

### **Check These:**
1. **Vercel Dashboard** - Build logs and errors
2. **Firebase Console** - Database writes and reads
3. **Clerk Dashboard** - User sign-ins
4. **Browser Console** - Client-side errors

### **Common Issues:**
- CORS errors → Check Clerk/Firebase domains
- 500 errors → Check server-side environment variables
- Build errors → Check dependencies and TypeScript

## 🎯 Next Steps After Successful Push

### **Immediate:**
1. ✅ Test production deployment thoroughly
2. ✅ Monitor error logs
3. ✅ Share with beta users
4. ✅ Gather feedback

### **Short Term:**
1. Create GitHub Issues for known bugs
2. Set up GitHub Actions for CI/CD
3. Add contributing guidelines
4. Create issue templates

### **Long Term:**
1. Implement Admin Dashboard (Phase 2)
2. Fix team security (invitation system)
3. Deploy Research Agent (Phase 3)
4. Add analytics and monitoring

## 📝 Git Best Practices

### **Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### **Branch Strategy (Future):**
```bash
# Create feature branch
git checkout -b feature/admin-dashboard

# Work on feature
git add .
git commit -m "feat: add admin dashboard"

# Push feature branch
git push origin feature/admin-dashboard

# Create Pull Request on GitHub
# Merge after review
```

## ✅ Success Criteria

Your push is successful when:
- ✅ Code is on GitHub
- ✅ Vercel deployment is live
- ✅ Users can sign in
- ✅ Projects can be created
- ✅ AI tools work
- ✅ Data persists
- ✅ No console errors

## 🎉 Congratulations!

Once pushed and deployed, you'll have:
- ✅ Production-ready PM Toolkit
- ✅ Secure authentication
- ✅ Cloud data persistence
- ✅ AI-powered features
- ✅ Professional UX
- ✅ Scalable architecture

**You're ready to ship! 🚀**

---

## 📞 Need Help?

- **GitHub Issues**: For bugs and feature requests
- **Vercel Support**: For deployment issues
- **Firebase Support**: For database issues
- **Clerk Support**: For authentication issues

**Remember**: Keep your `.env` file safe and never commit it to GitHub!
