# Research Agent Cloud Run Deployment Guide

This guide will walk you through deploying your Research Agent to Google Cloud Run step by step.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed locally
3. **Docker** installed (optional, for local testing)
4. **Your Research Agent Code** ready to deploy

---

## Step 1: Set Up Google Cloud Project

### 1.1 Create or Select a Project
```bash
# List existing projects
gcloud projects list

# Create a new project (if needed)
gcloud projects create your-project-id --name="Research Agent"

# Set the active project
gcloud config set project your-project-id
```

### 1.2 Enable Required APIs
```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

### 1.3 Set Up Artifact Registry (for storing Docker images)
```bash
# Create an Artifact Registry repository
gcloud artifacts repositories create research-agent-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Research Agent Docker images"
```

---

## Step 2: Prepare Your Application

### 2.1 Project Structure
Your Research Agent should have this structure:
```
research-agent/
├── Dockerfile
├── requirements.txt (for Python)
├── main.py or api_server.py
├── service-account.json (DO NOT commit this!)
└── .dockerignore
```

### 2.2 Create/Update Dockerfile
```dockerfile
# Use Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run will set PORT environment variable
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run the application
CMD ["python", "api_server.py"]
```

### 2.3 Create .dockerignore
```
# .dockerignore
.git
.gitignore
*.pyc
__pycache__
.env
.env.local
*.md
.vscode
node_modules
service-account.json
```

---

## Step 3: Configure Secrets (Secure Way)

### 3.1 Store Service Account in Secret Manager
```bash
# Create a secret for your service account
gcloud secrets create research-agent-sa \
    --replication-policy="automatic"

# Add the service account JSON as a secret version
gcloud secrets versions add research-agent-sa \
    --data-file=path/to/your/service-account.json
```

### 3.2 Store API Keys as Secrets
```bash
# For Gemini API Key
gcloud secrets create gemini-api-key \
    --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

# For any other API keys
gcloud secrets create anthropic-api-key \
    --replication-policy="automatic"
echo -n "YOUR_ANTHROPIC_API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-
```

---

## Step 4: Build and Deploy

### Option A: Deploy Directly from Source (Recommended for Quick Start)
```bash
# Navigate to your project directory
cd research-agent

# Deploy directly to Cloud Run (Google builds the container for you)
gcloud run deploy research-agent \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --timeout 300 \
    --set-secrets="GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa:research-agent-sa:latest" \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

### Option B: Build and Push Docker Image Manually
```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1
export IMAGE_NAME=research-agent
export TAG=latest

# Configure Docker for Google Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build the Docker image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/research-agent-repo/${IMAGE_NAME}:${TAG} .

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/research-agent-repo/${IMAGE_NAME}:${TAG}

# Deploy to Cloud Run
gcloud run deploy research-agent \
    --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/research-agent-repo/${IMAGE_NAME}:${TAG} \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --timeout 300
```

---

## Step 5: Configure Service Account Permissions

### 5.1 Grant Cloud Run Access to Secrets
```bash
# Get the Cloud Run service account email
export SERVICE_ACCOUNT=$(gcloud run services describe research-agent \
    --region us-central1 \
    --format="value(spec.template.spec.serviceAccountName)")

# If empty, it uses the default compute service account
export SERVICE_ACCOUNT=${SERVICE_ACCOUNT:-$(gcloud iam service-accounts list \
    --filter="email ~ compute@developer.gserviceaccount.com" \
    --format="value(email)")}

# Grant access to secrets
gcloud secrets add-iam-policy-binding research-agent-sa \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
```

---

## Step 6: Update Your Application Code

### 6.1 Update api_server.py to Use Environment Variables
```python
import os
from fastapi import FastAPI
import json

app = FastAPI()

# Load secrets from environment or mounted files
def get_service_account():
    # Try mounted secret path first
    sa_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', '/secrets/sa')
    if os.path.exists(sa_path):
        with open(sa_path) as f:
            return json.load(f)
    # Fallback to environment variable
    sa_json = os.environ.get('SERVICE_ACCOUNT_JSON')
    if sa_json:
        return json.loads(sa_json)
    return None

def get_api_key(name: str) -> str | None:
    return os.environ.get(name)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/research")
async def research(request: dict):
    gemini_key = get_api_key('GEMINI_API_KEY')
    # Your research logic here
    pass
```

---

## Step 7: Verify Deployment

### 7.1 Get the Service URL
```bash
gcloud run services describe research-agent \
    --region us-central1 \
    --format="value(status.url)"
```

### 7.2 Test the Endpoint
```bash
# Test health endpoint
curl https://your-service-url.run.app/health

# Test research endpoint
curl -X POST https://your-service-url.run.app/research \
    -H "Content-Type: application/json" \
    -d '{"query": "test research query"}'
```

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Map Custom Domain
```bash
# Map your custom domain
gcloud run domain-mappings create \
    --service research-agent \
    --region us-central1 \
    --domain research.yourdomain.com
```

### 8.2 Update DNS Records
Add the following DNS records to your domain registrar:
- **Type:** CNAME
- **Name:** research (or whatever subdomain you chose)
- **Value:** ghs.googlehosted.com

---

## Troubleshooting

### View Logs
```bash
# Stream live logs
gcloud run services logs read research-agent --region us-central1 --tail 100

# Or use Cloud Console
# https://console.cloud.google.com/run/detail/us-central1/research-agent/logs
```

### Common Issues

1. **Container fails to start**
   - Check if PORT environment variable is used correctly
   - Ensure your app listens on `0.0.0.0`, not `localhost`
   
2. **Secret access denied**
   - Verify IAM permissions for the service account
   - Check secret names are correct

3. **Memory errors**
   - Increase memory allocation: `--memory 2Gi`
   
4. **Timeout errors**
   - Increase timeout: `--timeout 600`

---

## Cost Optimization

Cloud Run charges based on:
- **CPU time** (while handling requests)
- **Memory usage** (while instances are active)
- **Number of requests**

**Tips to reduce costs:**
1. Set minimum instances to 0: `--min-instances 0`
2. Use CPU allocation only during requests: `--cpu-throttling`
3. Set appropriate memory limits
4. Enable concurrency: `--concurrency 80`

```bash
# Cost-optimized deployment command
gcloud run deploy research-agent \
    --source . \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --timeout 300 \
    --min-instances 0 \
    --max-instances 10 \
    --concurrency 80 \
    --cpu-throttling \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

---

## Quick Reference Commands

```bash
# List all Cloud Run services
gcloud run services list

# Update an existing service
gcloud run services update research-agent --region us-central1 --memory 2Gi

# Delete a service
gcloud run services delete research-agent --region us-central1

# View service details
gcloud run services describe research-agent --region us-central1
```

---

## Need More Help?

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Secret Manager Guide](https://cloud.google.com/secret-manager/docs)
