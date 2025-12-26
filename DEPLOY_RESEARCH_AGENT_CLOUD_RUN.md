# Deploying the Research Agent to Google Cloud Run

This guide will walk you through deploying your Dockerized Research Agent to Google Cloud Run. This assumes you have the Research Agent code (Docker application) ready on your machine.

## Prerequisites

1.  **Google Cloud Account**: Ensure you have an active Google Cloud Platform (GCP) account and a project created.
2.  **Google Cloud SDK**: Install the `gcloud` CLI if you haven't already. [Download here](https://cloud.google.com/sdk/docs/install).
3.  **Docker**: Ensure Docker Desktop is installed and running.

## Step 1: Initialize Google Cloud SDK

Open your terminal (PowerShell or Command Prompt) and run:

```bash
gcloud init
```
*   Follow the prompts to log in with your Google account.
*   Select your project (or create a new one).

## Step 2: Enable Required APIs

Run the following commands to enable Cloud Run and Artifact Registry:

```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## Step 3: Configure Docker Authentication

Configure Docker to authenticate with Google Cloud's Artifact Registry:

```bash
gcloud auth configure-docker
```

## Step 4: Build and Submit the Container

Navigate to the directory containing your Research Agent's `Dockerfile`.

Instead of building locally and pushing (which can be slow), we'll use Google Cloud Build to build the container directly in the cloud.

Replace `[SERVICE-NAME]` with a name for your agent (e.g., `research-agent`).

```bash
gcloud builds submit --tag gcr.io/[PROJECT-ID]/[SERVICE-NAME]
```
*   *Note: Replace `[PROJECT-ID]` with your actual Google Cloud Project ID (you can see it in `gcloud config get-value project`).*

## Step 5: Deploy to Cloud Run

Once the build is complete, deploy the image to Cloud Run:

```bash
gcloud run deploy [SERVICE-NAME] --image gcr.io/[PROJECT-ID]/[SERVICE-NAME] --platform managed --region us-central1 --allow-unauthenticated
```
*   `--allow-unauthenticated`: Makes the service publicly accessible (necessary if your Next.js app calls it directly from the browser or if you haven't set up IAM auth). If you need security, remove this flag, but you'll need to handle authentication headers in your Next.js app.

## Step 6: Update Environment Variables

1.  After deployment, the command will output a **Service URL** (e.g., `https://research-agent-xyz-uc.a.run.app`).
2.  Copy this URL.
3.  Open the `.env` file in your **Smello** (Next.js) project.
4.  Update the Research Agent URL variable (check key name, typically `NEXT_PUBLIC_RESEARCH_AGENT_URL` or similar):

```env
RESEARCH_AGENT_URL=https://research-agent-xyz-uc.a.run.app
```

## Step 7: Verify

1.  Restart your Smello local server (`npm run dev`).
2.  Try running a research task. It should now communicate with the Cloud Run instance.

## Troubleshooting

*   **Port Issues**: Ensure your Docker container listens on the port defined by the `PORT` environment variable (Cloud Run injects this, usually `8080`). Your code should look like: `app.listen(process.env.PORT || 8080)`.
*   **Logs**: You can view logs in the Google Cloud Console under "Cloud Run" -> [Your Service] -> "Logs" to debug any runtime errors.
