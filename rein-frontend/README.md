# Rein Frontend

Modern, AI-powered goal achievement platform built with Next.js 16. Beautiful UI with brutal design aesthetics, real-time chat interface, and seamless integrations with GitHub, Google Calendar, and Slack.

## 🎨 Features

### User Interface
- **Brutal Design System**: Bold borders, vibrant colors, strong shadows
- **Dark Mode**: Optimized for dark theme with high contrast
- **Responsive Layout**: Mobile-first design, works on all devices
- **Smooth Animations**: Framer Motion for polished interactions
- **3D Visualizations**: Three.js for interactive background effects

### Core Features
- **AI Chat Interface**: Natural conversation to refine goals
- **Dynamic Roadmap Generation**: Visual timeline with stages and tasks
- **Real-time Progress Tracking**: Interactive dashboard with analytics
- **Multi-Platform Sync**: One-click integration with GitHub, Calendar, Slack
- **Performance Insights**: AI-generated suggestions and progress analysis
- **Task Management**: Check off tasks, view upcoming deadlines

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend API running (see `rein-backend/README.md`)
- Supabase project for authentication

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## ⚙️ Environment Variables

Create `.env.local` in the root directory:

```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# OAuth Redirect URIs (for development)
NEXT_PUBLIC_GITHUB_REDIRECT_URI="http://localhost:3000/auth/github/callback"
NEXT_PUBLIC_SLACK_REDIRECT_URI="http://localhost:3000/auth/slack/callback"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google-calendar/callback"
```

## 🏃 Running the Application

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## 📁 Project Structure

```
app/
├── animations/         # GSAP/Three.js animations
├── auth/              # Authentication pages & callbacks
│   ├── callback/      # Supabase OAuth callback
│   └── github/        # GitHub integration callback
├── chat/              # Chat interface for goal clarification
│   └── Chat.tsx       # Main chat component with AI interaction
├── dashboard/         # Resolution dashboard
│   └── [id]/          # Dynamic route for specific resolution
│       ├── Dashboard.tsx
│       └── components/ # Dashboard-specific components
├── home/              # Landing page sections
├── resolution/        # Resolution creation/management
├── signin/            # Sign-in page with OAuth
├── svgs/              # SVG components
├── Components/        # Shared UI components
├── globals.css        # Global styles & Tailwind
├── layout.tsx         # Root layout with metadata
└── page.tsx           # Home page

components/
├── chat/              # Chat-specific components
├── ui/                # Shadcn UI components (buttons, dialogs, etc.)
├── resolution-input-form.tsx
└── TaskGitHubPromptModal.tsx

lib/
├── analytics.ts       # Analytics API client
├── github.ts          # GitHub integration utilities
├── integrations.ts    # Integration status management
├── resolutions.ts     # Resolution API client
├── supabase.ts        # Supabase client setup
└── utils.ts           # Utility functions

public/
└── rein-logo.svg      # Brand assets
```

## 🎨 Design System

### Colors
```css
--primary: Vibrant blue (#3b82f6)
--secondary: Dark gray (#1f2937)
--background: Deep dark (#0a0a0a)
--foreground: White (#ffffff)
--muted: Gray tones for secondary text
```

### Typography
- **Font**: Geist (Vercel's font family)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Code**: Monospace for technical content

### Components
Built with Radix UI and Tailwind CSS:
- Buttons with brutal shadow effects
- Dialogs for modals
- Progress bars for task completion
- Scroll areas for long content
- Custom cards with thick borders

## 🔐 Authentication Flow

1. **Sign In Page** (`/signin`)
   - Google OAuth via Supabase
   - GitHub OAuth via Supabase

2. **OAuth Callback** (`/auth/callback`)
   - Handles Supabase redirect
   - Exchanges code for session
   - Redirects to chat page

3. **Protected Routes**
   - All routes check for active Supabase session
   - Redirects to `/signin` if not authenticated

## 💬 Chat Interface

The chat page (`/app/chat/Chat.tsx`) orchestrates the goal clarification process:

1. **Initial Prompt**: User enters their goal
2. **Missing Field Detection**: Backend analyzes and asks clarifying questions
3. **Conversation**: Multi-turn Q&A to gather all necessary context
4. **Summary**: AI generates implementation plan
5. **Integration Selection**: User chooses platforms to sync
6. **Implementation**: Creates resolution and syncs tasks

### Key States
- `messages`: Chat message history
- `session`: Current clarification session
- `showSummary`: Display implementation plan
- `sidebarStatus`: Show/hide integration panel
- `currentResolution`: Active resolution being created

## 📊 Dashboard

The dashboard (`/app/dashboard/[id]/Dashboard.tsx`) provides:

- **Resolution Overview**: Title, description, dates
- **Progress Statistics**: Completion percentage, streak tracking
- **Task List**: All tasks with status and deadlines
- **Integration Status**: Connected platforms
- **Analytics**: Performance charts and insights
- **Quick Actions**: Complete tasks, sync integrations

### Real-time Updates
- Analytics refresh on task completion
- Integration status updates
- Progress recalculation

## 🔌 API Integration

### Resolution API (`lib/resolutions.ts`)
```typescript
// Create resolution
await resolutionAPI.create({
  userId,
  title,
  goal,
  roadmap,
  suggestedPlatforms,
  userEmail,
  userName
});

// Get all resolutions
await resolutionAPI.getAllByUser(userId);

// Update task status
await resolutionAPI.updateTask(resolutionId, taskId, userId, completed);
```

### Analytics API (`lib/analytics.ts`)
```typescript
// Get performance summary
await analyticsAPI.getPerformanceSummary(resolutionId, userId);

// Get insights
await analyticsAPI.getInsights(resolutionId, userId);
```

### Integration API (`lib/integrations.ts`)
```typescript
// Check status
await integrationsAPI.checkStatus(userId);

// Connect platform
await integrationsAPI.connectGitHub(userId, code);
```

## 🎭 Animations

### Framer Motion
Used for:
- Page transitions
- Component entry/exit
- Hover effects
- Scroll-triggered animations

### Three.js
3D background effects in hero section:
- Particle systems
- Interactive camera movement
- Responsive to mouse/scroll

### GSAP
Timeline-based animations for:
- Section reveals
- Text animations
- Complex sequences

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add Environment Variables** (from .env.local)
5. **Deploy**

### Environment-Specific Settings

**Development**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Production**
```env
NEXT_PUBLIC_API_URL="https://your-backend.onrender.com"
```

### Custom Domain
- Add domain in Vercel dashboard
- Update OAuth redirect URIs in:
  - Supabase dashboard
  - Backend environment variables

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Lint check
npm run lint

# Build test
npm run build
```

### Manual Testing Checklist
- [ ] Sign in with Google
- [ ] Sign in with GitHub
- [ ] Create new resolution via chat
- [ ] Complete clarification questions
- [ ] Select integrations
- [ ] View dashboard
- [ ] Complete tasks
- [ ] Check analytics updates
- [ ] Test on mobile

## 🎯 Key Features Explained

### 1. Missing Field Detection
When user submits a prompt, backend analyzes it and returns:
- `type: "skip"` - No questions needed, proceed to implementation
- `type: "question"` - Missing info, ask clarifying questions

Frontend handles both paths seamlessly.

### 2. Lazy Integration Loading
Integration status checked on component mount:
```typescript
useEffect(() => {
  const checkIntegrations = async () => {
    const status = await integrationsAPI.checkStatus(user.id);
    setIntegrationStatuses(status);
  };
}, []);
```

### 3. Real-time Analytics
Dashboard refetches analytics after task completion:
```typescript
const handleTaskComplete = async (taskId: string, completed: boolean) => {
  await resolutionAPI.updateTask(resolutionId, taskId, userId, completed);
  // Immediately refresh analytics
  const updated = await analyticsAPI.getPerformanceSummary(resolutionId, userId);
  setAnalytics(updated);
};
```

### 4. Responsive Sidebar
Sidebar state managed for mobile/desktop:
- `none`: Hidden
- `hidden`: Can be toggled
- `flex`: Always visible (desktop)

## 🔧 Customization

### Theme Colors
Edit `app/globals.css`:
```css
:root {
  --primary: 217 91% 60%; /* HSL values */
  --secondary: 215 28% 17%;
}
```

### Animation Timing
Adjust Framer Motion variants:
```typescript
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
```

### API Endpoints
Change base URL in lib files:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rein.app";
```

## 🐛 Troubleshooting

### Authentication Issues
- **Problem**: Redirect loop after sign-in
- **Solution**: Check Supabase redirect URL matches exactly
- **Verify**: `NEXT_PUBLIC_SUPABASE_URL` is correct

### API Connection Errors
- **Problem**: 404 or CORS errors
- **Solution**: Verify backend is running and URL is correct
- **Check**: `NEXT_PUBLIC_API_URL` environment variable

### Build Failures
- **Problem**: Type errors during build
- **Solution**: Run `npx tsc --noEmit` to see specific errors
- **Common**: Missing TypeScript types for dependencies

### Styling Issues
- **Problem**: Tailwind classes not applying
- **Solution**: Restart dev server after Tailwind config changes
- **Check**: Class names are not being purged incorrectly

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Three.js](https://threejs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/awesome-ui`)
3. Follow the brutal design system
4. Test on multiple screen sizes
5. Commit changes (`git commit -m 'Add awesome UI'`)
6. Push to branch (`git push origin feature/awesome-ui`)
7. Open Pull Request

## 📝 License

Proprietary - All rights reserved

## 💡 Tips

- **Performance**: Use `next/image` for all images
- **SEO**: Update metadata in `layout.tsx` for each page
- **Accessibility**: Test with keyboard navigation
- **Mobile**: Always test on real devices, not just DevTools
- **Dark Mode**: All components optimized for dark theme by default
