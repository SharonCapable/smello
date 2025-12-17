# 🎯 SMELLO - AI-Powered Product Management Toolkit

SMELLO is a comprehensive product management platform that helps teams go from idea to execution using AI-powered tools.

## ✨ Features

### Core Capabilities
- **🤖 AI Idea Generation** - Generate product ideas with Claude and Gemini
- **📝 PRD Generator** - Create detailed Product Requirements Documents
- **🏗️ Technical Blueprint** - Generate system architecture, database schemas, and API specifications
- **📊 Epic & User Story Generation** - Break down products into actionable development tasks
- **🗺️ User Journey Mapping** - Design user flows and touchpoints
- **🔍 Research Agent** - Conduct market research with custom frameworks
- **🎯 Competitive Intelligence** - Analyze competitors and market opportunities

### User Experience
- **Flexible Workflow** - Choose your own path (PRD → Blueprint → Epics, or any order)
- **Visual Diagrams** - Mermaid-powered architecture and database diagrams
- **Project Management** - Save, load, and manage multiple projects
- **Usage Tracking** - 6 free AI operations for guests, unlimited for signed-in users

### Authentication
- **Google Sign-In** - Unlimited AI access with your Google account
- **Custom API Keys** - Use your own Gemini/Claude keys for full control
- **Guest Mode** - Try it out with 6 free operations (resets every 24 hours)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Docker (for Research Agent)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd smello

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📋 Environment Variables

Create a `.env` file with:

```env
# AI API Keys
NEXT_PUBLIC_CLAUDE_API_KEY=your-claude-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key

# NextAuth (for Google Sign-In)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Research Agent
RESEARCH_AGENT_URL=http://localhost:8000
```

## 🐳 Research Agent Setup

The Research Agent runs as a separate Docker service:

```bash
# Navigate to research agent folder
cd ../Automations/adhoc-research

# Build Docker image
docker build -t research-agent .

# Run container
docker run -p 8000:8000 --env-file .env research-agent
```

See `DOCKER_SETUP_GUIDE.md` for detailed instructions.

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to Vercel, Railway, or self-hosted
- **[Authentication Setup](AUTHENTICATION_SETUP.md)** - Configure Google OAuth
- **[Docker Setup](DOCKER_SETUP_GUIDE.md)** - Set up Research Agent

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI**: Google Gemini, Anthropic Claude
- **Authentication**: NextAuth.js
- **Diagrams**: Mermaid
- **Research Agent**: Python (FastAPI, Docker)

## 📦 Project Structure

```
smello/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Main app
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── ai-generation.ts  # AI service integration
│   ├── storage.ts        # Project storage
│   └── ...
└── types/                 # TypeScript types
```

## 🚢 Deployment

### Recommended Setup:
- **Next.js App**: Deploy to Vercel (free tier)
- **Research Agent**: Deploy to Railway (free tier supports Docker)

See `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/) and [Anthropic Claude](https://www.anthropic.com/)

---

**Made with ❤️ for Product Managers**
