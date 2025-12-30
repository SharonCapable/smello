# 🎯 Smello - AI-Powered Project Management

**Smello** is a next-generation project management platform combining AI-powered tools with team collaboration features. Built for product managers, ML/AI teams, and modern organizations.

## ✨ Features

### **PM Toolkit** (Individual Use)
- 🤖 **AI Idea Generator** - Generate project ideas with AI
- 📝 **PRD Generator** - Create comprehensive Product Requirement Documents
- 🗺️ **Roadmap Builder** - Visual product roadmaps
- 👥 **User Journey Mapper** - Map user experiences
- 🔍 **Research Agent** - AI-powered market research
- ⚔️ **Competitive Intelligence** - SWOT analysis and feature comparison
- ⚠️ **Risk Assessment** - Identify and mitigate project risks

### **Smello for Teams** (Collaborative)
- 🏢 **Organization Management** - Multi-org support with role-based access
- 👥 **Team Collaboration** - Real-time project collaboration
- 🔄 **Workflow Tracking** - ML/AI-specific workflow templates
- 💬 **Comments & Mentions** - Threaded discussions with @mentions
- 🔔 **Real-time Notifications** - Stay updated on project changes
- ⌨️ **Command Palette** - Quick actions with Cmd+K
- 📊 **Sprint Management** - Agile sprint planning and tracking
- 📈 **Analytics Dashboard** - Team performance insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Firebase project
- Clerk account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smello.git
cd smello

# Install dependencies
npm install
# or
pnpm install

# Copy environment variables
cp .env.example .env

# Add your keys to .env
# - Clerk keys
# - Firebase config
# - AI API keys (optional)

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

All documentation is organized in the `/docs` folder:

### **Guides**
- [Quick Start Guide](docs/guides/QUICK_START_GUIDE.md) - Get started in 5 minutes
- [Access Control Guide](docs/guides/ACCESS_CONTROL_GUIDE.md) - Organization & permissions
- [Deployment Testing Guide](docs/guides/DEPLOYMENT_TESTING_GUIDE.md) - Testing checklist
- [Firestore Rules Migration](docs/guides/FIRESTORE_RULES_MIGRATION.md) - Security rules setup

### **Implementation**
- [Architecture](docs/implementation/ARCHITECTURE.md) - System design
- [Workflow Implementation](docs/implementation/WORKFLOW_IMPLEMENTATION.md) - Workflow system
- [Teams Complete](docs/implementation/SMELLO_TEAMS_COMPLETE.md) - All team features
- [Final Summary](docs/implementation/FINAL_IMPLEMENTATION_SUMMARY.md) - Complete overview

### **Reference**
- [Bug Fixes](docs/reference/BUG_FIXES.md) - Historical bug fixes
- [Clerk Migration](docs/reference/CLERK_MIGRATION.md) - Auth migration notes
- [UX Fixes](docs/reference/UX_FIXES_SUMMARY.md) - UI/UX improvements

## 🔐 Access Control

Smello for Teams uses a sophisticated access control system:

- **Super Admin** - Can create organizations
- **Org Admin** - Can invite users and create teams
- **Team Admin** - Can manage team projects
- **Member** - Can view and edit projects
- **Viewer** - Read-only access

See [Access Control Guide](docs/guides/ACCESS_CONTROL_GUIDE.md) for details.

## 🎯 Key Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **Authentication**: Clerk
- **Database**: Firebase Firestore (real-time)
- **AI**: Google Gemini, Anthropic Claude
- **Deployment**: Vercel

## 📦 Project Structure

```
smello/
├── app/                    # Next.js app router
├── components/             # React components
│   ├── teams/             # Team collaboration components
│   └── ui/                # Shadcn UI components
├── lib/                    # Utilities and services
│   ├── firestore-service.ts  # Firestore operations
│   └── firebase.ts        # Firebase config
├── types/                  # TypeScript types
├── docs/                   # Documentation
│   ├── guides/            # User guides
│   ├── implementation/    # Technical docs
│   └── reference/         # Historical reference
├── public/                 # Static assets
└── styles/                 # Global styles
```

## 🔧 Configuration

### Firestore Security Rules

Copy the rules from `firestore.rules` to your Firebase Console:

```bash
# Deploy via Firebase CLI
firebase deploy --only firestore:rules
```

### Environment Variables

Required variables in `.env`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side)
FIREBASE_SERVICE_ACCOUNT=

# AI APIs (optional - for free tier)
GEMINI_API_KEY=
CLAUDE_API_KEY=
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/) and [Anthropic Claude](https://www.anthropic.com/)

## 📞 Support

- Documentation: `/docs`
- Issues: [GitHub Issues](https://github.com/yourusername/smello/issues)
- Email: support@smello.ai

---

**Made with ❤️ for modern teams**
