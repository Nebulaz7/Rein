<p align="center">
  <h1 align="center">Rein</h1>
  <p align="center"><strong>AI execution agent that turns resolutions into automated workflows across GitHub, Google Calendar, and Slack.</strong></p>
</p>

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rein-demo.vercel.app)
[![Opik](https://img.shields.io/badge/Powered%20by-Opik-orange)](https://www.comet.com/opik)

<p align="center">
  <a href="#architecture">Architecture</a> &middot;
  <a href="#how-it-works">How It Works</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#tech-stack">Tech Stack</a> &middot;
  <a href="#getting-started">Getting Started</a>
</p>

---

## The Problem

Most New Year's resolutions fail — not from lack of motivation, but from three structural gaps:

| Gap                   | Description                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **The Vagueness Gap** | Ambitions are too broad to be actionable; big goals lack the precise micro-steps required for real progress.             |
| **Platform Friction** | Goals die in the distance between planners and execution tools; manual syncing between apps kills momentum.              |
| **Passive Inertia**   | Current AI offers "advice" instead of "action," leaving the user to do all the heavy lifting of scheduling and tracking. |

## The Solution

Rein is an AI execution agent that sits between your intentions and your tools. It conducts a natural conversation to understand your goals, breaks them into time-distributed tasks, then **automatically syncs those tasks** across the platforms where work actually happens.

- **Intelligent Breakdown** — Rein's AI agent dissects broad resolutions into granular, time-bound tasks mapped to daily actions.
- **Automated Integration** — One conversation syncs your entire plan across GitHub, Calendar, and Slack — no manual updates.
- **Active Enforcement** — Rein schedules, reminds, tracks, and adapts in real-time to keep you accountable.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REIN ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐ │
│   │  Next.js 16  │    │   NestJS API     │    │  Python Model    │ │
│   │  Frontend    │───▶│   Backend        │───▶│  Layer           │ │
│   │              │    │                  │    │                  │ │
│   │  React 19    │    │  Gemini 2.5      │    │  Gemini 2.5      │ │
│   │  Tailwind 4  │    │  Flash Lite      │    │  Flash Lite      │ │
│   │  Framer      │    │  Prisma ORM      │    │  Opik Tracing    │ │
│   │  Motion      │    │  Supabase Auth   │    │                  │ │
│   └──────────────┘    └────────┬─────────┘    └──────────────────┘ │
│                                │                                    │
│              ┌─────────────────┼─────────────────┐                 │
│              ▼                 ▼                  ▼                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐        │
│   │   GitHub     │  │   Google     │  │     Slack         │        │
│   │   API        │  │   Calendar   │  │     API           │        │
│   │              │  │   API        │  │                    │        │
│   │  Auto-create │  │  Schedule    │  │  Reminders &       │        │
│   │  repos &     │  │  events from │  │  accountability    │        │
│   │  issues      │  │  roadmap     │  │  check-ins         │        │
│   └──────────────┘  └──────────────┘  └──────────────────┘        │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    OBSERVABILITY LAYER                       │  │
│   │                                                             │  │
│   │  Opik: Traces every LLM call, scores goal quality,         │  │
│   │        evaluates resolution clarity, logs user feedback,    │  │
│   │        monitors coaching effectiveness                      │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│   │  PostgreSQL      │  │  Supabase    │  │  Gmail SMTP      │    │
│   │  (Prisma)        │  │  Auth        │  │  Email System    │    │
│   └──────────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### System Data Flow

```
User Input                  AI Processing                Platform Sync
───────────                 ────────────                 ─────────────

"I want to               Goal Preprocessor             GitHub
 contribute              ┌──────────────┐            ┌──────────────┐
 to open      ──────▶    │ Extract:     │            │ Create repo  │
 source"                 │ - Goal type  │            │ Create issues│
                         │ - Timeframe  │            │ Track commits│
                         │ - Experience │            └──────┬───────┘
                         │ - Platforms  │                   │
                         └──────┬───────┘                   │
                                │                           │
                                ▼                           │
                         Context Service              Google Calendar
                         ┌──────────────┐            ┌──────────────┐
                         │ Clarify via  │            │ Block time   │
                         │ multi-round  │───────▶    │ for tasks    │
                         │ conversation │            │ Auto-refresh │
                         │ (max 3)      │            │ OAuth tokens │
                         └──────┬───────┘            └──────┬───────┘
                                │                           │
                                ▼                           │
                         Generator Service                  │
                         ┌──────────────┐              Slack
                         │ Build road-  │            ┌──────────────┐
                         │ map with     │            │ Daily remind │
                         │ stages,      │───────▶    │ Streak alerts│
                         │ dates, tasks │            │ Check-ins    │
                         └──────┬───────┘            └──────┬───────┘
                                │                           │
                                ▼                           ▼
                         ┌──────────────────────────────────────┐
                         │          Resolution Dashboard        │
                         │  Tasks | Analytics | Integrations    │
                         │  AI Insights | Opik Quality Scores   │
                         └──────────────────────────────────────┘
```

---

## How It Works

### 1. Natural Conversation

The user describes their goal in plain language. The **Goal Preprocessor** (powered by Gemini) extracts structured metadata — goal type, experience level, timeframe, and suggested platforms — using SMART criteria from the system prompt trained on Atomic Habits and OKR frameworks.

### 2. Multi-Round Clarification

If the goal is ambiguous, the **Context Service** initiates up to 3 clarification rounds. Each round refines missing fields (timeframe, specificity, measurability) until the AI has enough context to generate a quality plan. After round 2, an implementation summary is auto-generated.

### 3. Roadmap Generation

The **Generator Service** produces a full resolution containing:

- **Stages** — high-level phases with start/end dates
- **Nodes** — individual tasks distributed across the timeframe using `DateCalculator`
- **Practical tasks** — platform-specific actions (GitHub issues, calendar blocks, Slack reminders)
- **Calendar and GitHub sync metadata** — flags indicating which integrations to trigger

### 4. Platform Sync

Based on the generated roadmap:

| Platform            | Automation                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **GitHub**          | `GitHubIssueService` creates a repository and issues for each resolution node. Commits are tracked via webhook.        |
| **Google Calendar** | `McpCalendarService` creates time-blocked events from roadmap nodes with auto-refreshing OAuth tokens.                 |
| **Slack**           | `SlackMessagingService` sends reminders, accountability check-ins, and streak notifications through the Anchor system. |

### 5. Tracking and Adaptation

The **Dashboard** provides five views:

- **Overview** — streak count, progress percentage, health status, AI coach message
- **Tasks** — today's tasks with completion toggles, tomorrow's preview, resource links
- **Analytics** — weekly progress charts, platform distribution, quality scores
- **Integrations** — connection status for each platform, sync triggers
- **AI Insights** — Opik-powered quality scores, audit insights, personalized recommendations

### 6. Email Lifecycle

The **Email Scheduler** (using a lazy job pattern designed for sleeping backends) manages:

- Welcome emails on signup
- Streak reminders (hourly checks)
- Streak loss alerts when momentum drops
- Weekly digest summaries with progress data

---

## Features

### AI Agent Pipeline

| Component                | Role                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Goal Preprocessor**    | Classifies goals (`coding-learning`, `execution`, `mixed`), extracts SMART fields, suggests platforms |
| **Context Service**      | Multi-round clarification with conversation history persistence                                       |
| **Generator Service**    | Produces date-distributed roadmaps with stages, nodes, and sync metadata                              |
| **Evaluation Service**   | LLM-based scoring of generated resolutions on clarity, specificity, measurability, actionability      |
| **Goal Scoring Service** | Rule-based scoring logged to Opik spans for quality tracking                                          |
| **Coaching Engine**      | Personalized responses based on user progress, patterns, and goal context                             |

### Platform Integrations

| Integration         | Capabilities                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **GitHub**          | OAuth flow, auto-create repositories, create issues from roadmap nodes, track commits via webhooks         |
| **Google Calendar** | OAuth with token refresh, create events from roadmap, time-block scheduling                                |
| **Slack**           | OAuth flow, accountability reminders, streak notifications, platform-agnostic messaging via Anchor pattern |

### Accountability System (Anchor)

The Anchor module is a **platform-agnostic accountability engine**:

```
AnchorService (Core Logic)
     │
     ├── createCommitment()     ── User commits to a goal
     ├── sendReminder()         ── Timed nudges via messaging layer
     ├── collectResponse()      ── Captures check-in responses
     └── handleEscalation()     ── Escalates missed commitments
           │
           ▼
    MessagingService Interface
           │
           ├── SlackMessagingService    (production)
           └── MockMessagingService     (testing)
```

The messaging backend is injected at module initialization (`AnchorModule.forRoot(SlackMessagingService)`), making it trivial to add new platforms.

### Opik Observability

Opik is integrated at every layer of the system:

```
                    ┌─────────────────────────┐
                    │      Opik Dashboard      │
                    │    Project: "rein-ai"    │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                       │
   ┌──────▼──────┐      ┌───────▼───────┐      ┌───────▼───────┐
   │ LLM Tracing │      │ Quality       │      │ User Feedback │
   │             │      │ Evaluation    │      │               │
   │ Every call  │      │               │      │ Rating (1-5)  │
   │ traced with │      │ Clarity       │      │ Usefulness    │
   │ - prompt    │      │ Specificity   │      │ Clarity       │
   │ - response  │      │ Measurability │      │ Motivation    │
   │ - tokens    │      │ Actionability │      │               │
   │ - latency   │      │ (0-10 each)   │      │ Logged to     │
   │             │      │               │      │ Opik traces   │
   └─────────────┘      └───────────────┘      └───────────────┘

   Backend: @Trace decorator + OpikClientService
   Python:  @track decorator + evaluate_experiment
```

**What is traced:**

- Every LLM call (prompt input, model response, estimated tokens, latency)
- Goal preprocessing results (extracted fields, classifications)
- Resolution quality scores (clarity, specificity, measurability, feasibility, motivation)
- User feedback (rating, usefulness, clarity, motivation — logged per resolution)
- Coaching responses (context, generation quality)
- Analytics computations (activity scores, consistency metrics)

### Database Schema (14 Models)

```
User ──────┬── ClarificationSession
           ├── Resolution ──── NodeProgress
           │                    └── (GitHub issue links)
           ├── Streak
           ├── Commitment ──┬── Reminder
           │                └── Escalation
           ├── SlackConnection
           ├── CalendarConnection
           ├── GitHubAccount ── GitHubCommit
           ├── GitHubConnection
           ├── EmailLog
           ├── EmailPreferences
           └── UserPerformanceSnapshot

JobSchedule (singleton per job type)
```

---

## Tech Stack

### Backend — NestJS

| Technology            | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| NestJS 11             | Modular REST API framework with dependency injection |
| Prisma 6              | Type-safe ORM for PostgreSQL                         |
| Gemini 2.5 Flash Lite | LLM for goal analysis, roadmap generation, coaching  |
| Supabase              | Authentication (Google OAuth, email)                 |
| Opik SDK              | LLM tracing, evaluation, and feedback logging        |
| Octokit               | GitHub API client for repos, issues, webhooks        |
| googleapis            | Google Calendar API with OAuth token refresh         |
| Nodemailer            | Gmail SMTP for transactional emails                  |
| Luxon                 | Date/time calculations for roadmap scheduling        |

### Frontend — Next.js

| Technology     | Purpose                                       |
| -------------- | --------------------------------------------- |
| Next.js 16     | App router with static + dynamic rendering    |
| React 19       | Component framework                           |
| Tailwind CSS 4 | Utility-first styling with custom dark theme  |
| Framer Motion  | Scroll-triggered animations, page transitions |
| GSAP           | Card stacking animations (CardSwap component) |
| Recharts       | Dashboard analytics charts                    |
| Supabase JS    | Client-side auth and session management       |
| React Markdown | Rendering AI responses                        |

### Python Model Layer

| Technology          | Purpose                                   |
| ------------------- | ----------------------------------------- |
| google-generativeai | Gemini integration for ML pipeline        |
| Opik                | `@track` decorator for end-to-end tracing |
| Pydantic            | Structured data validation for model I/O  |
| Tenacity            | Retry logic for API calls                 |

### Infrastructure

| Component      | Service                                                  |
| -------------- | -------------------------------------------------------- |
| Database       | PostgreSQL (Prisma migrations)                           |
| Auth           | Supabase Auth (Google OAuth, email/password)             |
| Email          | Gmail SMTP via Nodemailer                                |
| Observability  | Opik (Comet)                                             |
| Job Scheduling | Custom LazyJobScheduler (designed for sleeping backends) |

---

## Project Structure

```
rein/
├── rein-backend/                # NestJS API server
│   ├── src/
│   │   ├── analytics/           # Performance tracking & scoring
│   │   ├── anchor/              # Platform-agnostic accountability
│   │   ├── auth/                # Supabase auth integration
│   │   ├── common/              # Guards, utils, Supabase service
│   │   ├── context/             # Multi-round clarification service
│   │   ├── email/               # Templates, scheduler, preferences
│   │   ├── generator/           # Roadmap generation + prompt builder
│   │   ├── integrations/        # Unified integration status API
│   │   ├── llm/                 # Base LLM service
│   │   ├── mcp/
│   │   │   ├── calendar/        # Google Calendar sync
│   │   │   ├── github/          # GitHub repos, issues, webhooks
│   │   │   └── slack/           # Slack messaging + OAuth
│   │   ├── ml/
│   │   │   ├── evaluation/      # LLM-based resolution evaluation
│   │   │   ├── feedback/        # User feedback logging to Opik
│   │   │   ├── llm/             # LLM service with Opik tracing
│   │   │   ├── opik/            # Opik client wrapper
│   │   │   └── tracing/         # @Trace decorator, tracing service
│   │   ├── preprocessor/        # Goal analysis & classification
│   │   ├── prisma/              # Database service
│   │   ├── resolution/          # Resolution CRUD & task management
│   │   └── user/                # User management
│   └── prisma/
│       └── schema.prisma        # 14-model database schema
│
├── rein-frontend/               # Next.js 16 application
│   ├── app/
│   │   ├── Components/          # Landing page sections
│   │   ├── chat/                # AI conversation interface
│   │   ├── dashboard/[id]/      # Resolution dashboard (5 views)
│   │   ├── home/                # Authenticated home + prompt input
│   │   └── auth/                # OAuth callback handlers
│   ├── components/ui/           # shadcn/ui components
│   └── lib/                     # API clients (resolutions, analytics, integrations)
│
├── rein-model/                  # Python ML pipeline
│   └── main.py                  # Opik-traced goal processing pipeline
│
└── prompts/                     # System prompts (SMART, Atomic Habits, OKR)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+
- PostgreSQL
- Supabase project (for auth)
- Google Cloud project (Calendar API, Gemini API)
- GitHub OAuth app
- Slack app
- Opik account (Comet)

### Backend

```bash
cd rein-backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

Required environment variables:

```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
GOOGLE_AI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_BOT_TOKEN=
OPIK_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

### Frontend

```bash
cd rein-frontend
npm install
npm run dev
```

Required environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Python Model

```bash
cd rein-model
pip install -r requirements.txt
python main.py
```

---

## Team

**[Peters Joshua]** - Frontend Development  
**[Aderemi Ademola]** - Backend & Integrations  
**[Olaniyi Ezekiel]** - AI/ML & Opik Implementation

## Hackathon Alignment

### Productivity & Work Habits Track

**Functionality**: ✅ Multi-agent system with 3 platform integrations, adaptive AI coaching, and real-time quality scoring

**Real-world Relevance**: ✅ User-choice integrations (not forced complexity), transparent AI quality, adapts to actual behavior patterns

**Use of LLMs/Agents**: ✅ Multi-agent architecture (Analyzer → Planner → Router → Insights), intelligent platform routing, adaptive coaching

**Evaluation & Observability**: ✅ User-facing quality metrics, confidence scoring, Opik tracing with trace IDs, week-over-week improvement tracking

**Goal Alignment**: ✅ Purpose-built for resolution execution, habit formation through streaks, multi-platform accountability

---

## License

This project was built for the [Commit To Change: An AI Agents Hackathon Hackathon 2026](https://www.encodeclub.com/my-programmes/comet-resolution-v2-hackathon) — Track 1: Productivity & Work Habits.

_"AI you can trust, because you can see exactly how good it is."_
