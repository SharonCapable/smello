# 🚂 Research Agent Deployment to Railway - Step by Step

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Research Agent folder: `C:\Users\Sharon\Videos\Wizzle\Automations\adhoc-research`
- ✅ Dockerfile in that folder
- ✅ api_server.py (updated with service account support)
- ✅ run_api.py (your main script)
- ✅ requirements.txt (all Python dependencies)
- ✅ service-account.json (Google service account key)
- ✅ .env file with API keys

## 🎯 Deployment Options

### Option 1: Deploy from GitHub (Recommended)

#### Step 1: Push Research Agent to GitHub

```bash
# Navigate to research agent folder
cd C:\Users\Sharon\Videos\Wizzle\Automations\adhoc-research

# Initialize Git
git init

# Create .gitignore
echo "__pycache__/
*.pyc
.env
token.json
token.pickle
*.log" > .gitignore

# Add files (service-account.json will be added as Railway secret)
git add .
git commit -m "Initial commit: Research Agent"

# Create new repo on GitHub or push to existing
git remote add origin https://github.com/SharonCapable/research-agent.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Railway

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `research-agent` repository

3. **Configure Service**
   - Railway will auto-detect the Dockerfile
   - Click "Add variables" to add environment variables

4. **Add Environment Variables**
   ```
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   GOOGLE_API_KEY=your-google-key
   GOOGLE_SERVICE_ACCOUNT_FILE=/app/service-account.json
   ```

5. **Add Service Account as Secret File**
   - In Railway dashboard, go to "Variables"
   - Click "Raw Editor"
   - Add a new variable:
     ```
     GOOGLE_SERVICE_ACCOUNT_JSON=<paste-entire-json-content>
     ```
   - Update your Dockerfile to create the file from env:
     ```dockerfile
     # In Dockerfile, add before CMD:
     RUN echo "$GOOGLE_SERVICE_ACCOUNT_JSON" > /app/service-account.json
     ```

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Railway will build and deploy your container

7. **Get Public URL**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://research-agent-production.up.railway.app`)

---

### Option 2: Deploy from Local (Alternative)

#### Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

#### Step 2: Deploy

```bash
# Navigate to research agent folder
cd C:\Users\Sharon\Videos\Wizzle\Automations\adhoc-research

# Initialize Railway project
railway init

# Link to new project
railway link

# Add environment variables
railway variables set OPENAI_API_KEY=your-key
railway variables set ANTHROPIC_API_KEY=your-key
# ... add all other variables

# Deploy
railway up
```

---

## 🔧 Required Files Checklist

Make sure these files exist in your `adhoc-research` folder:

### 1. **Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the API server
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. **api_server.py**
Should have the improved version with:
- FastAPI app
- CORS middleware
- `/research` endpoint
- `/health` endpoint
- Service account support

### 3. **requirements.txt**
Should include:
```
fastapi
uvicorn
pydantic
requests
openai
anthropic
google-auth
google-auth-oauthlib
google-auth-httplib2
google-api-python-client
# ... your other dependencies
```

### 4. **.dockerignore**
```
__pycache__
*.pyc
.env
.git
token.json
token.pickle
*.log
venv/
```

### 5. **railway.json** (Optional but recommended)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn api_server:app --host 0.0.0.0 --port 8000",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🧪 Testing After Deployment

Once deployed, test your Research Agent:

### 1. Health Check
```bash
curl https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "python_version": "3.11.x",
  "cwd": "/app"
}
```

### 2. Research Test
```bash
curl -X POST https://your-railway-url.up.railway.app/research \
  -H "Content-Type: application/json" \
  -d '{"query":"What are the benefits of AI?","frameworkSource":null}'
```

Expected: JSON response with research findings

---

## 🔐 Security Best Practices

### Don't Commit These Files:
- ❌ `service-account.json`
- ❌ `.env`
- ❌ `token.json` / `token.pickle`
- ❌ Any API keys

### Do Commit:
- ✅ `Dockerfile`
- ✅ `api_server.py`
- ✅ `run_api.py`
- ✅ `requirements.txt`
- ✅ `.dockerignore`
- ✅ `railway.json`

---

## 📊 Railway Dashboard Overview

After deployment, you'll see:
- **Deployments**: Build logs and status
- **Metrics**: CPU, Memory, Network usage
- **Variables**: Environment variables
- **Settings**: Domain, scaling, etc.
- **Logs**: Real-time application logs

---

## 🆘 Troubleshooting

### Build Fails
**Check:**
- Dockerfile syntax
- requirements.txt has all dependencies
- Python version compatibility

**View logs:**
- Railway Dashboard → Deployments → Click on build

### Service Won't Start
**Check:**
- Port 8000 is exposed
- uvicorn command is correct
- No syntax errors in api_server.py

**View logs:**
- Railway Dashboard → Deployments → View Logs

### 500 Errors
**Check:**
- Service account JSON is valid
- Environment variables are set
- run_api.py works locally

**Debug:**
- Check Railway logs for Python errors
- Test locally with Docker first

---

## ✅ Final Checklist

Before deploying:
- [ ] Dockerfile exists and is correct
- [ ] api_server.py has service account support
- [ ] requirements.txt is complete
- [ ] .dockerignore excludes secrets
- [ ] Service account JSON ready (will add as Railway secret)
- [ ] All API keys ready

After deploying:
- [ ] Health check returns 200 OK
- [ ] Research endpoint works
- [ ] Copy Railway URL
- [ ] Update SMELLO's `RESEARCH_AGENT_URL` in Vercel
- [ ] Test end-to-end from SMELLO

---

## 🎯 Next Step

After Research Agent is deployed:
1. Copy the Railway URL
2. Go to Vercel dashboard
3. Update `RESEARCH_AGENT_URL` environment variable
4. Redeploy SMELLO (or it will auto-redeploy)
5. Test the Research Agent feature in SMELLO

---

**Estimated deployment time: 10-15 minutes**

Good luck! 🚀
