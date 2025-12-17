# 🚀 SMELLO - Pre-Deployment Checklist & Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables & Secrets
- [ ] **Production `.env` file created** with all required variables
- [ ] **API Keys secured** (not committed to Git)
- [ ] **NextAuth secret generated** for production
- [ ] **Google OAuth credentials** configured for production domain
- [ ] **Research Agent service account** JSON file secured

### 2. Code Quality & Testing
- [ ] **All TypeScript errors resolved**
- [ ] **Build succeeds** (`npm run build`)
- [ ] **Core features tested**:
  - [ ] Idea generation works
  - [ ] Epic/Story generation works
  - [ ] PRD generation works
  - [ ] Technical Blueprint works
  - [ ] Research Agent works (with Docker)
  - [ ] User authentication works
  - [ ] Project saving/loading works
- [ ] **Usage counter** displays correctly
- [ ] **Mermaid diagrams** render properly

### 3. Docker & Services
- [ ] **Research Agent Docker image** built and tested
- [ ] **Docker container** runs successfully
- [ ] **Health check endpoint** (`/health`) responds
- [ ] **Service account authentication** working

### 4. Security
- [ ] **API keys** not exposed in client-side code
- [ ] **CORS** configured properly
- [ ] **Authentication** working (Google OAuth)
- [ ] **Rate limiting** considered (optional)
- [ ] **Environment variables** use `NEXT_PUBLIC_` prefix only when needed

### 5. Performance
- [ ] **Images optimized** (if any)
- [ ] **Bundle size** acceptable (`npm run build` shows sizes)
- [ ] **No console errors** in production build

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Pros:**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier available
- ✅ Git integration

**Cons:**
- ❌ Need separate hosting for Docker (Research Agent)

#### Steps:

1. **Push to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Add environment variables:
     ```
     NEXT_PUBLIC_CLAUDE_API_KEY=...
     NEXT_PUBLIC_GEMINI_API_KEY=...
     NEXTAUTH_URL=https://your-domain.vercel.app
     NEXTAUTH_SECRET=...
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     RESEARCH_AGENT_URL=https://your-research-agent-url.com
     ```
   - Click "Deploy"

3. **Deploy Research Agent Separately**
   - Use **Railway**, **Render**, or **DigitalOcean** for Docker
   - See "Docker Deployment" section below

---

### Option 2: Railway (Full Stack with Docker)

**Pros:**
- ✅ Supports Docker
- ✅ Can host both Next.js and Research Agent
- ✅ Simple deployment
- ✅ Free tier available

**Cons:**
- ❌ Smaller free tier than Vercel

#### Steps:

1. **Create `railway.json`** (optional, for configuration)
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy Main App**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Add environment variables (same as Vercel)
   - Deploy

3. **Deploy Research Agent**
   - In Railway, click "New" → "Docker Image"
   - Connect to your `adhoc-research` folder
   - Set port to `8000`
   - Add service account as environment variable or secret file
   - Deploy

---

### Option 3: Self-Hosted (VPS)

**Pros:**
- ✅ Full control
- ✅ Can run everything on one server
- ✅ Cost-effective for high traffic

**Cons:**
- ❌ More setup required
- ❌ You manage infrastructure

#### Steps:

1. **Get a VPS** (DigitalOcean, Linode, AWS EC2, etc.)

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose
   ```

3. **Create `docker-compose.yml`** in your project root:
   ```yaml
   version: '3.8'
   
   services:
     nextjs:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_CLAUDE_API_KEY=${NEXT_PUBLIC_CLAUDE_API_KEY}
         - NEXT_PUBLIC_GEMINI_API_KEY=${NEXT_PUBLIC_GEMINI_API_KEY}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
         - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
         - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
         - RESEARCH_AGENT_URL=http://research-agent:8000
       depends_on:
         - research-agent
     
     research-agent:
       build: ../Automations/adhoc-research
       ports:
         - "8000:8000"
       volumes:
         - ../Automations/adhoc-research/service-account.json:/app/service-account.json:ro
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

5. **Setup Nginx** (for HTTPS and reverse proxy)
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```

---

## 🐳 Docker Deployment (Research Agent)

### For Railway/Render/DigitalOcean App Platform:

1. **Ensure your Dockerfile is in `adhoc-research` folder**

2. **Add `.dockerignore`:**
   ```
   __pycache__
   *.pyc
   .env
   .git
   token.json
   token.pickle
   ```

3. **Build and test locally:**
   ```bash
   cd C:\Users\Sharon\Videos\Wizzle\Automations\adhoc-research
   docker build -t research-agent .
   docker run -p 8000:8000 research-agent
   ```

4. **Push to container registry** (if needed):
   ```bash
   docker tag research-agent your-registry.com/research-agent
   docker push your-registry.com/research-agent
   ```

---

## 📋 Production Environment Variables

Create a `.env.production` file:

```env
# API Keys (Server-side only)
NEXT_PUBLIC_CLAUDE_API_KEY=your-production-claude-key
NEXT_PUBLIC_GEMINI_API_KEY=your-production-gemini-key

# NextAuth
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<generate-new-secret-for-production>

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret

# Research Agent
RESEARCH_AGENT_URL=https://your-research-agent-domain.com

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Generate new NextAuth secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 Security Checklist

- [ ] **Remove all console.logs** with sensitive data
- [ ] **API keys** are server-side only (no `NEXT_PUBLIC_` for secrets)
- [ ] **CORS** configured for production domain
- [ ] **Rate limiting** implemented (optional but recommended)
- [ ] **HTTPS** enabled
- [ ] **Service account JSON** not committed to Git
- [ ] **`.env` files** in `.gitignore`

---

## 🧪 Pre-Deployment Testing

Run these commands before deploying:

```bash
# 1. Build check
npm run build

# 2. Type check
npm run type-check  # (if you have this script)

# 3. Lint check
npm run lint

# 4. Test production build locally
npm run build && npm run start
```

---

## 📊 Post-Deployment Monitoring

### Things to Monitor:

1. **Error tracking** - Set up Sentry or similar
2. **API usage** - Monitor Gemini/Claude API costs
3. **Docker container health** - Research Agent uptime
4. **Database** (if you add one later) - Connection pool, queries
5. **User feedback** - Usage counter, sign-ins

### Recommended Tools:

- **Vercel Analytics** (if using Vercel)
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **Uptime Robot** (uptime monitoring)

---

## 🚨 Rollback Plan

If something goes wrong:

### Vercel:
- Go to Deployments → Click previous deployment → "Promote to Production"

### Railway:
- Go to Deployments → Select previous deployment → "Redeploy"

### Self-Hosted:
```bash
git revert HEAD
docker-compose down
docker-compose up -d
```

---

## 📝 Final Checklist Before Going Live

- [ ] All features tested in production build
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] Research Agent accessible from production Next.js app
- [ ] Terms of Service and Privacy Policy reviewed
- [ ] Usage counter working correctly
- [ ] Authentication flow tested
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Mobile responsive (test on phone)

---

## 🎉 You're Ready to Deploy!

**Recommended deployment order:**

1. Deploy Research Agent (Docker) first
2. Get its URL
3. Update `RESEARCH_AGENT_URL` in Next.js env
4. Deploy Next.js app
5. Test end-to-end
6. Monitor for 24 hours

**Good luck! 🚀**
