# Rein Backend

AI-powered resolution management system built with NestJS. Helps users create, track, and achieve their goals through intelligent roadmap generation, multi-platform integrations, and automated reminders.

## 🚀 Features

### Core Capabilities
- **AI-Powered Resolution Generation**: Uses Google Gemini to create personalized goal roadmaps
- **Smart Context Analysis**: Clarifying conversation system to extract missing information
- **Multi-Platform Integrations**: 
  - GitHub (Issues, Projects, Repositories)
  - Google Calendar (Event scheduling)
  - Slack (Reminders and notifications)
- **Analytics & Scoring**: Performance tracking with Opik ML observability
- **Lazy Job Scheduler**: Sleep-friendly cron system for Render Free Tier
- **Email System**: Automated welcome emails, streak reminders, and weekly digests

### Technical Features
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth integration
- **Email Service**: Nodemailer with Gmail SMTP
- **Caching**: Redis for session management
- **LLM Tracing**: Opik integration for AI observability
- **Modular Architecture**: NestJS dependency injection

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance (optional, for caching)
- Gmail account (for SMTP)
- Supabase account
- Google Gemini API key
- Opik API key (optional, for ML observability)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
DEFAULT_LLM_MODEL="gemini-2.5-flash-lite"
EVALUATION_MODEL="gemini-2.5-flash-lite"
LLM_TEMPERATURE="0.7"
LLM_MAX_TOKENS="1000"

# Opik (ML Observability)
OPIK_API_KEY="your-opik-key"
OPIK_WORKSPACE="rein"
OPIK_PROJECT_NAME="rein-ai"

# Email (Gmail SMTP)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM_NAME="Rein"

# GitHub Integration
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Slack Integration
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_CLIENT_ID="your-client-id"
SLACK_CLIENT_SECRET="your-client-secret"
SLACK_REDIRECT_URI="https://your-domain.com/auth/slack/callback"

# Google Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis (Optional)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-password"

# Application
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
USE_MOCK_MESSAGING="false"
```

## 🏃 Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Test email functionality
curl -X POST http://localhost:3001/email/test/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","userId":"test-123","userName":"Test User","resolutionTitle":"My Goal"}'
```

## 📁 Project Structure

```
src/
├── analytics/           # Performance tracking & goal scoring
├── anchor/             # Slack messaging integration
├── auth/               # Authentication (Supabase)
├── common/             # Shared services (Supabase, LazyJobScheduler)
├── context/            # Clarification conversation system
├── email/              # Email service & templates
│   ├── services/       # EmailService, EmailSchedulerService
│   ├── templates/      # HTML/plain text templates
│   └── types/          # Email data types
├── generator/          # AI roadmap generation
├── integrations/       # Platform integration management
├── llm/                # LLM service (Gemini)
├── mcp/                # Model Context Protocol integrations
│   ├── github/         # GitHub OAuth & operations
│   ├── google-calendar/# Google Calendar sync
│   └── slack/          # Slack OAuth & scheduler
├── ml/                 # Machine learning & Opik tracing
├── preprocessor/       # Input analysis & platform detection
├── prisma/             # Database service
├── resolution/         # Resolution CRUD & business logic
└── user/               # User management
```

## 🔄 Lazy Job Scheduler

The backend uses a custom lazy job scheduler designed for sleeping backends (Render Free Tier):

```typescript
// Jobs are registered on startup
lazyJobScheduler.registerJob('email-streak-reminders', 1, callback);

// Check and run due jobs
POST /jobs/check

// Get job status
GET /jobs/status

// Manually trigger a job
POST /jobs/trigger/email-streak-reminders
```

**For production:** Set up external ping (UptimeRobot) to call `POST /jobs/check` every 15 minutes.

## 📧 Email System

### Automated Emails
- **Welcome Email**: Sent on first resolution creation
- **Streak Reminders**: Daily for users with 3+ day streaks
- **Weekly Digests**: Summary of progress and upcoming tasks

### Email Templates
Located in `src/email/templates/`:
- `welcome.template.ts` - Welcome email with dashboard link
- `base.template.ts` - Shared HTML/CSS structure

### Testing Emails
```bash
# Test welcome email
POST /email/test/welcome

# Test streak reminder
POST /email/test/streak-reminder

# Test weekly digest
POST /email/test/weekly-digest
```

## 🔌 API Endpoints

### Resolutions
- `POST /resolution` - Create new resolution
- `GET /resolution/user/:userId` - Get all user resolutions
- `GET /resolution/:id` - Get specific resolution
- `DELETE /resolution/:id` - Delete resolution
- `PATCH /resolution/:id/tasks/:taskId` - Update task status

### Context/Chat
- `POST /context/start` - Start clarification conversation
- `POST /context/next` - Get next question or finalize

### Integrations
- `GET /integrations/status` - Get connection status for all platforms
- `POST /github/connect` - Connect GitHub account
- `POST /google-calendar/connect` - Connect Google Calendar
- `GET /auth/slack/callback` - Slack OAuth callback

### Analytics
- `GET /analytics/performance/:resolutionId` - Get performance summary
- `GET /analytics/insights/:resolutionId` - Get AI-generated insights

### Jobs
- `GET /jobs/status` - View all registered jobs
- `POST /jobs/check` - Check and run due jobs
- `POST /jobs/trigger/:jobName` - Manually trigger specific job

## 🗄️ Database Schema

Key models:
- **User**: User accounts (from Supabase)
- **Resolution**: Goal/resolution with roadmap
- **NodeProgress**: Task completion tracking
- **Streak**: Daily activity streaks
- **Integration**: Platform connection credentials
- **JobSchedule**: Lazy job scheduling metadata
- **EmailLog**: Email tracking for rate limiting

## 🚀 Deployment

### Render.com (Recommended for Free Tier)

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy with:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Node Version**: 18+

4. Set up UptimeRobot to ping `/jobs/check` every 15 minutes

### Environment-Specific Notes
- **Production**: Set `NODE_ENV=production`
- **Database**: Use connection pooling (Supabase Pooler recommended)
- **Memory**: Increase Node.js memory if needed (`--max-old-space-size=4096`)

## 🔒 Security

- All OAuth credentials stored encrypted
- Supabase handles user authentication
- Service role key only for backend operations
- Email rate limiting to prevent spam
- Input validation with class-validator

## 📚 Documentation

- [Lazy Jobs System](./LAZY_JOBS.md)
- [Email Testing Guide](./EMAIL_TESTING.md)
- [Prisma Schema](./prisma/schema.prisma)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Proprietary - All rights reserved

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db push

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Email Not Sending
- Check Gmail SMTP credentials
- Enable "Less secure app access" or use App Password
- Verify SMTP_USER and SMTP_PASS in .env
- Check email logs in database

### Jobs Not Running
- Verify LazyJobScheduler is initialized
- Check job status: `GET /jobs/status`
- Manually trigger: `POST /jobs/trigger/job-name`
- Set up external ping for production

### AI Generation Failing
- Verify GEMINI_API_KEY is valid
- Check API quota/limits
- Review Opik dashboard for traces
- Check LLM service logs

## 📞 Support

For issues and questions:
- Check existing documentation
- Review logs in `src/**/*.service.ts`
- Test endpoints with included curl examples
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
