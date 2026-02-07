# Rein - AI Resolution Coach with Real-Time Quality Transparency

> **"Most AI resolution apps are black boxes. Rein shows you exactly how good your AI-generated plan is—and adapts as you work."**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rein-demo.vercel.app)
[![Opik](https://img.shields.io/badge/Powered%20by-Opik-orange)](https://www.comet.com/opik)

## 🎯 The Problem

**80% of New Year's resolutions fail by February.**

Why? Most AI planning tools:

- Give generic advice that doesn't account for your real life
- Create plans you never look at again
- Provide no way to know if the AI's suggestions are actually good
- Don't integrate with the tools you already use

## 💡 Our Solution

Rein transforms vague resolutions into actionable, tracked plans with **transparent AI quality scoring**. Unlike black-box AI assistants, Rein shows you real-time metrics on how clear, actionable, and personalized your plan is—then adapts its coaching based on your actual behavior.

**Key Innovation**: User-facing AI evaluation. Every resolution gets scored on Goal Clarity, Task Actionability, and Personalization—visible directly in your dashboard and tracked in Opik for production observability.

---

## ✨ Features

### 🎪 Intelligent Resolution Analysis

- Input resolutions in natural language ("I want to get better at programming")
- AI breaks down into SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Real-time quality scoring: Goal Clarity, Task Actionability, Personalization
- Every analysis logged to Opik with trace IDs for debugging

### 📋 Smart Task Generation

- Week-by-week actionable task breakdown
- Adaptive pacing based on your calendar availability
- Intelligent platform routing (GitHub for code, Calendar for time-blocks, Slack for accountability)
- Quality scores update as you engage with tasks

### 🔗 Seamless Platform Integration

Choose the integrations that work for you:

**GitHub** (for developers)

- Auto-create issues for coding tasks
- Track completion through commits
- Milestone-based progress

**Google Calendar** (for everyone)

- Time-block high-priority tasks
- Automatic scheduling around existing commitments
- Completion tracking through event status

**Slack** (for accountability)

- Daily check-in DMs
- Progress celebrations
- Team accountability channels (optional)

**Gmail** (mandatory for all users)

- Weekly progress digests
- AI coaching insights
- Streak reminders

### 🤖 Adaptive AI Coaching

**AI Insights Dashboard** - The game-changer:

```
Your AI Coach says:
"Every journey starts with a single step! You've begun with 1 task
completed. Focus on building a consistent streak—start with just
one task per day."

Generated with 70% confidence • Tracked by Opik
```

**Quality Metrics** (per resolution):

- Goal Clarity: 10/10
- Task Actionability: 10/10
- Personalization: 10/10
- ↑ 100% improvement since Week 1

**Behavioral Analytics**:

- Activity Score (tracks meaningful actions)
- Consistency Score (active days per week)
- Day-of-week productivity patterns
- Trend analysis with recommendations

**Every insight includes**:

- Confidence level (e.g., 70% confidence)
- Opik trace ID for full debugging
- Category (achievement, pattern, tip)
- Timestamp for historical tracking

### 📊 Unified Progress Tracking

**Multi-Platform Activity Feed**:

- GitHub issue closed → streak updates
- Calendar event completed → progress chart
- Check-in submitted → new AI insights
- Real-time sync across all platforms

**Streak System**:

- Daily consistency tracking
- Visual streak counter
- Smart definition: any meaningful action counts (task, check-in, or platform activity)
- No gamification bloat—just habit formation

---

## 🏗️ Architecture

### Tech Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts  
**Backend**: NestJS, PostgreSQL, Redis  
**AI/ML**: Google Gemini 2.0 Flash, Opik SDK  
**Integrations**: GitHub API, Google Calendar API, Slack API, Gmail API

### Multi-Agent System

```
User Resolution Input
         │
         ▼
┌─────────────────────────┐
│ Resolution Analyzer     │  → SMART goal breakdown
│ (Gemini 2.0 Flash)      │  → Quality scoring
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Plan Generator Agent    │  → Week-by-week tasks
│                         │  → Platform routing logic
└──────────┬──────────────┘
           │
    ┌──────┴──────┬──────────────┐
    │             │              │
    ▼             ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│ GitHub │  │ Calendar │  │  Slack   │
│ Issues │  │  Events  │  │ Check-in │
└────────┘  └──────────┘  └──────────┘
    │             │              │
    └──────┬──────┴──────────────┘
           │
           ▼
┌─────────────────────────┐
│   AI Insights Agent     │  → Behavioral analysis
│   (Adaptive Coaching)   │  → Confidence scoring
└─────────────────────────┘

All agents traced in Opik for observability
```

---

## 🔬 Opik Integration: User-Facing AI Quality

**Our Competitive Advantage**: We don't just use Opik for backend logging—we surface AI quality metrics directly to users.

### What We Track

**1. Real-Time Quality Scores** (per resolution)

```
Goal Clarity: 10/10        → How well-defined are goals?
Task Actionability: 10/10  → Can you act on tasks immediately?
Personalization: 10/10     → Tailored to your context?
```

Each score is:

- ✅ Calculated by Gemini evaluator per resolution
- ✅ Logged to Opik with unique trace ID
- ✅ Displayed in user dashboard
- ✅ Tracked week-over-week for improvement

**2. AI Insights with Confidence Levels**

Every coaching insight includes:

- Confidence score (70%, 85%, etc.)
- Opik trace ID (e.g., `pxurn5`)
- Category (achievement, pattern, recommendation)
- Reasoning visible on hover

**3. Behavioral Analytics**

- Activity Score: Tracks meaningful actions (tasks, check-ins, commits)
- Consistency Score: Active days per week
- Pattern Detection: "Fridays are your most productive days"
- Trend Analysis: "+100% activity this week"

**4. Production Observability**

- Full trace history for debugging
- Cost tracking across all Gemini API calls
- Latency monitoring per agent
- Error logging with context

### Why This Matters

Most AI apps are opaque. Users get confident-sounding advice with no way to verify quality.

**Rein solves this by**:

1. Quantifying plan quality in real-time
2. Showing users when AI is uncertain (confidence scores)
3. Providing trace IDs for full transparency
4. Tracking improvement as users engage with the system

**Example User Flow**:

```
User creates resolution → Sees quality scores (8/10, 9/10, 7/10)
→ Completes tasks → Activity score increases
→ AI generates new insights with 85% confidence
→ Quality scores improve to (9/10, 10/10, 9/10)
→ User sees "↑ 25% improvement since Week 1"
```

---

## 🚀 Getting Started

### Prerequisites

```bash
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Google Cloud account (Calendar, Gmail APIs)
- GitHub account (API access)
- Slack workspace (optional)
- Gemini API key
- Opik account (free tier)
```

### Installation

**1. Clone repository**

```bash
git clone https://github.com/your-team/rein.git
cd rein
```

**2. Backend Setup**

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with:
# - DATABASE_URL
# - REDIS_URL
# - GEMINI_API_KEY
# - OPIK_API_KEY
# - GOOGLE_CLIENT_ID / SECRET
# - GITHUB_CLIENT_ID / SECRET
# - SLACK_BOT_TOKEN (optional)
# - GMAIL_CLIENT_ID / SECRET

# Run migrations
npm run migration:run

# Start server
npm run start:dev
```

**3. Frontend Setup**

```bash
cd frontend
npm install

cp .env.local.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_GOOGLE_CLIENT_ID

npm run dev
```

**4. Access Application**

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Opik Dashboard: https://www.comet.com/opik

---

---

## 📊 Key Metrics

### User Engagement (Target)

- Streak length: 14+ days
- Check-in completion: 75%+
- Multi-platform users: 60%+
- Weekly active rate: 80%+

### AI Quality (Opik-Tracked)

- Goal Clarity: Target 8.5/10
- Task Actionability: Target 9.0/10
- Personalization: Target 7.5/10
- Coaching Confidence: Avg 75%+

### Platform Performance

- GitHub sync success: >90%
- Calendar sync success: >95%
- Slack message delivery: >98%
- Email delivery: >95%
- Average response time: <2 seconds

---

## 🎯 Example Use Cases

### Software Engineer - Career Advancement

```
Resolution: "Get promoted to senior engineer"

AI Plan:
✅ GitHub: Ship 3 major features, review 50+ PRs
✅ Calendar: Block time for system design study
✅ Slack: Weekly 1:1 check-ins with mentor

Quality Scores: 9/10, 10/10, 8/10
Platform Routing: All 3 integrations used
```

### Developer - Side Project

```
Resolution: "Launch my SaaS MVP by June"

AI Plan:
✅ GitHub: Break into 12 two-week sprints
✅ Calendar: 10 hours/week blocked for dev work
✅ Slack: Accountability channel with co-founder

Quality Scores: 10/10, 9/10, 9/10
Platform Routing: Heavy GitHub, Calendar for milestones
```

### Fitness Enthusiast

```
Resolution: "Run a marathon by October"

AI Plan:
✅ Calendar: 16-week training schedule (4 runs/week)
✅ Slack: Optional running group check-ins
✅ Gmail: Weekly progress reports

Quality Scores: 8/10, 10/10, 7/10
Platform Routing: Calendar-focused (no GitHub needed)
```

---

## 🔐 Security & Privacy

- ✅ OAuth 2.0 for all integrations (no password storage)
- ✅ Data encrypted at rest (PostgreSQL)
- ✅ Token auto-refresh for long-lived sessions
- ✅ Scoped permissions (minimal access per platform)
- ✅ Webhook signature verification (GitHub, Slack)
- ✅ Opik traces anonymized in shared dashboards
- ✅ GDPR-compliant data export/deletion

---

## 👥 Team

**[Peters Joshua]** - Frontend Development  
**[Aderemi Ademola]** - Backend & Integrations  
**[Olaniyi Ezekiel]** - AI/ML & Opik Implementation

---

## 🎯 Hackathon Alignment

### Productivity & Work Habits Track

**Functionality**: ✅ Multi-agent system with 3 platform integrations, adaptive AI coaching, and real-time quality scoring

**Real-world Relevance**: ✅ User-choice integrations (not forced complexity), transparent AI quality, adapts to actual behavior patterns

**Use of LLMs/Agents**: ✅ Multi-agent architecture (Analyzer → Planner → Router → Insights), intelligent platform routing, adaptive coaching

**Evaluation & Observability**: ✅ User-facing quality metrics, confidence scoring, Opik tracing with trace IDs, week-over-week improvement tracking

**Goal Alignment**: ✅ Purpose-built for resolution execution, habit formation through streaks, multi-platform accountability

---

**Built with ❤️ for the Comet Resolution Hackathon 2025**

_"AI you can trust, because you can see exactly how good it is."_
