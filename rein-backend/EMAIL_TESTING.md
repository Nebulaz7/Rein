# 📧 Email Service Testing Guide

## ✅ What's Been Integrated

### 1. **Welcome Email** (Automatic)
- **Trigger**: When a user creates their FIRST resolution
- **Location**: `resolution.service.ts` → `create()` method
- **Checks**: 
  - Only sends if it's user's first resolution
  - User has an email address
  - User hasn't opted out (`emailPreferences.welcomeEmail`)

### 2. **Streak Loss Alert** (Automatic)
- **Trigger**: When a user's streak drops from > 0 to 0
- **Location**: `resolution.service.ts` → `updateResolutionStreak()` method
- **Checks**:
  - Old streak was > 0
  - New streak is 0
  - User has an email address
  - User hasn't opted out (`emailPreferences.streakLossAlert`)

### 3. **Streak Reminders** (Cron Job)
- **Schedule**: Runs every hour
- **Location**: `email-scheduler.service.ts` → `@Cron` decorated method
- **Sends**: To users with streak >= 3 who haven't completed today's tasks

### 4. **Weekly Digest** (Cron Job)
- **Schedule**: Runs every Monday at 9 AM
- **Location**: `email-scheduler.service.ts` → `@Cron` decorated method
- **Sends**: Weekly progress summary to all active users

---

## 🧪 Testing Endpoints

### Test Welcome Email
```bash
POST http://localhost:4000/email/test/welcome
Content-Type: application/json

{
  "email": "your-email@example.com",
  "userId": "your-user-id",
  "userName": "John",
  "resolutionTitle": "Master TypeScript"
}
```

### Test Streak Reminder
```bash
POST http://localhost:4000/email/test/streak-reminder
Content-Type: application/json

{
  "email": "your-email@example.com",
  "userId": "your-user-id",
  "userName": "John",
  "currentStreak": 5
}
```

### Test Streak Loss Alert
```bash
POST http://localhost:4000/email/test/streak-loss
Content-Type: application/json

{
  "email": "your-email@example.com",
  "userId": "your-user-id",
  "userName": "John",
  "lostStreak": 10
}
```

### Test Weekly Digest
```bash
POST http://localhost:4000/email/test/weekly-digest
Content-Type: application/json

{
  "email": "your-email@example.com",
  "userId": "your-user-id",
  "userName": "John"
}
```

### Manually Trigger Cron Jobs
```bash
# Trigger streak reminder check
POST http://localhost:4000/email/test/cron/streak-reminder/:userId

# Trigger weekly digest
POST http://localhost:4000/email/test/cron/weekly-digest/:userId
```

---

## 🔧 Environment Variables

Make sure these are set in your `.env` file:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# From email (must be verified domain or use onboarding@resend.dev for testing)
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL for links in emails
FRONTEND_URL=http://localhost:3000
```

---

## 📊 Database Check

### Check if email was sent:
```sql
SELECT * FROM email_logs 
WHERE user_id = 'your-user-id' 
ORDER BY sent_at DESC;
```

### Check user email preferences:
```sql
SELECT * FROM email_preferences 
WHERE user_id = 'your-user-id';
```

### Create default email preferences for a user:
```sql
INSERT INTO email_preferences (user_id, welcome_email, streak_reminder, streak_loss_alert, weekly_digest, milestone_emails)
VALUES ('your-user-id', true, true, true, true, true);
```

---

## 🎯 Real-World Testing

### 1. Test Welcome Email with Real Data
Create a new resolution via your API and watch for the email:

```bash
POST http://localhost:4000/resolutions
Content-Type: application/json

{
  "userId": "user-123",
  "title": "Learn React",
  "goal": "Master React development",
  "roadmap": [...] # Your actual roadmap data
}
```

**Expected**: If this is the user's first resolution and they have an email, they should receive a welcome email.

### 2. Test Streak Loss Alert
1. Complete some tasks to build a streak
2. Mark a previously completed task as incomplete
3. The streak should drop and trigger an alert email

```bash
PUT http://localhost:4000/resolutions/:id/tasks/:taskId
Content-Type: application/json

{
  "completed": false
}
```

---

## 🐛 Debugging

### Enable detailed logging
The services already log key events. Check your console for:
- `✅ Sent [email_type] email to [email]`
- `❌ Failed to send [email_type] email`

### Common Issues

**1. Emails not sending**
- Check `RESEND_API_KEY` is set correctly
- Verify email address in database is valid
- Check user hasn't opted out (check `email_preferences` table)

**2. Cron jobs not running**
- Make sure `@nestjs/schedule` is installed
- Check `ScheduleModule.forRoot()` is in `EmailModule`
- Restart the backend server

**3. Welcome email sends multiple times**
- Check the logic in `sendWelcomeEmailIfFirst()` - it counts resolutions
- Verify database has correct resolution count

---

## 📝 Next Steps

1. **Get Resend API Key**: Sign up at https://resend.com
2. **Add Email to Test User**: Update your test user's email in the database
3. **Test Each Email Type**: Use the test endpoints above
4. **Create First Resolution**: Test automatic welcome email
5. **Break a Streak**: Test automatic streak loss alert
6. **Wait for Cron**: Or manually trigger cron jobs

---

## ✨ Email Flow Summary

```
User creates first resolution
    ↓
Resolution.create() called
    ↓
sendWelcomeEmailIfFirst() checks
    ↓
EmailService.sendWelcomeEmail()
    ↓
Resend API sends email
    ↓
Logged in email_logs table
```

```
User uncompletes task (streak breaks)
    ↓
updateTaskStatus() called
    ↓
updateResolutionStreak() recalculates
    ↓
sendStreakLossAlertIfNeeded() checks
    ↓
EmailService.sendStreakLossAlert()
    ↓
Resend API sends email
    ↓
Logged in email_logs table
```

Happy testing! 🚀
