# 🐳 Dockerizing the Research Agent

To make your Research Agent robust and independent of your local Python environment, follow these steps to containerize it.

## 1. Create Files in `Automations/adhoc-research`

Navigate to `C:\Users\Sharon\Videos\Wizzle\Automations\adhoc-research` and create these 3 files:

### File 1: `api_server.py`
This wraps your existing script in a fast web server.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os
import json
import subprocess

# Import your existing logic if possible, or run it as a subprocess
# Assuming your logic is in a file that can be imported or run

app = FastAPI()

class ResearchRequest(BaseModel):
    query: string
    frameworkSource: Optional[str] = None

@app.post("/research")
async def run_research(request: ResearchRequest):
    try:
        # Option A: If you can import your main function
        # from run_api import run_research_logic
        # result = run_research_logic(request.query, request.frameworkSource)
        
        # Option B: Run existing script as subprocess (easier migration)
        input_data = json.dumps({
            "query": request.query,
            "frameworkSource": request.frameworkSource
        })
        
        process = subprocess.Popen(
            ["python", "run_api.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=input_data)
        
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Script error: {stderr}")
            
        try:
            return json.loads(stdout)
        except json.JSONDecodeError:
            return {"success": False, "error": "Invalid JSON output", "raw": stdout}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### File 2: `requirements.txt`
Ensure you have all dependencies listed.

```text
fastapi
uvicorn
pydantic
# Add your agent dependencies below:
requests
openai
anthropic
# etc...
```

### File 3: `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed
# RUN apt-get update && apt-get install -y git

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all agent code
COPY . .

# Expose port
EXPOSE 8000

# Run the API server
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 2. Run the Service

Open a terminal in `Automations/adhoc-research` and run:

```bash
# Build the image
docker build -t research-agent .

# Run the container
docker run -p 8000:8000 --env-file .env research-agent
```

*(Make sure you have a `.env` file in that folder with your API keys like OPENAI_API_KEY)*

## 3. Update SMELLO to use the Docker Service

Once your Docker container is running, update `app/api/research/route.ts` in SMELLO to call this service instead of spawning a process.

**I can update the route for you once you confirm you want to switch to this method.**

For now, you can use the **Immediate Fix** by adding this to your SMELLO `.env` file:

```env
RESEARCH_PYTHON_PATH=C:\Users\Sharon\anaconda3\envs\adhoc\python.exe
```
*(Replace with your actual python path)*
