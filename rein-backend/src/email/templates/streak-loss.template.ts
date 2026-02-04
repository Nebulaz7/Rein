import { baseTemplate } from './base.template';
import { StreakLossData } from '../types/email.types';

export const streakLossTemplate = (data: StreakLossData): string => {
  const content = `
    <h1>⚠️ Your ${data.lostStreak}-day streak just ended</h1>
    
    <p>Hi ${data.userName},</p>
    
    <p>
      We wanted to let you know that your streak of <strong>${data.lostStreak} days</strong> has ended.
    </p>
    
    <div class="stats-box" style="background: #fef2f2; border: 2px solid #fca5a5;">
      <div class="stat-item">
        <span class="stat-label">💔 Lost Streak:</span> ${data.lostStreak} days
      </div>
      <div class="stat-item">
        <span class="stat-label">🏆 Longest Streak:</span> ${data.longestStreak} days
      </div>
      <div class="stat-item">
        <span class="stat-label">📅 Last Activity:</span> ${data.lastActivityDate}
      </div>
      <div class="stat-item">
        <span class="stat-label">⏭️ Missed Tasks:</span> ${data.missedTasksCount}
      </div>
      <div class="stat-item">
        <span class="stat-label">📊 Current Progress:</span> ${data.currentProgress}%
      </div>
    </div>
    
    <h2 style="font-size: 18px; margin: 32px 0 16px 0; color: #18181b;">
      Don't Worry — Every Expert Has Off Days
    </h2>
    
    <p>
      Losing a streak doesn't mean you've failed. It's a normal part of the journey. 
      What matters is <strong>getting back on track</strong>.
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px; color: #166534;">
         <strong>Recovery Tip:</strong> Don't try to catch up on everything at once. 
        Start fresh today with one small task. Momentum builds from action, not perfection.
      </p>
    </div>
    
    <p>
      Remember: Your longest streak was <strong>${data.longestStreak} days</strong>. 
      You've done it before — you can do it again! 💪
    </p>
    
    <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions" class="button">
      View Today's Tasks
    </a>
    
    <p style="margin-top: 32px; color: #71717a; font-size: 14px;">
      <strong>Quick restart strategies:</strong>
    </p>
    <ul style="color: #71717a; font-size: 14px; line-height: 1.8;">
      <li>Complete just one small task today to rebuild momentum</li>
      <li>Set a specific time tomorrow for your Rein check-in</li>
      <li>Review what caused the break and plan around it</li>
    </ul>
    
    <p style="margin-top: 24px;">
      We believe in you! <br>
      <strong>— The Rein Team</strong>
    </p>
  `;

  const preheader = `Your ${data.lostStreak}-day streak ended. Time to get back on track!`;

  return baseTemplate(content, preheader);
};

export const streakLossTemplatePlainText = (data: StreakLossData): string => {
  return `
⚠️ Your ${data.lostStreak}-day streak just ended

Hi ${data.userName},

We wanted to let you know that your streak of ${data.lostStreak} days has ended.

WHAT HAPPENED:
- Lost Streak: ${data.lostStreak} days
- Longest Streak: ${data.longestStreak} days
- Last Activity: ${data.lastActivityDate}
- Missed Tasks: ${data.missedTasksCount}
- Current Progress: ${data.currentProgress}%

DON'T WORRY — EVERY EXPERT HAS OFF DAYS

Losing a streak doesn't mean you've failed. It's a normal part of the journey. What matters is getting back on track.

💡 Recovery Tip: Don't try to catch up on everything at once. Start fresh today with one small task. Momentum builds from action, not perfection.

Remember: Your longest streak was ${data.longestStreak} days. You've done it before — you can do it again! 💪

QUICK RESTART STRATEGIES:
- Complete just one small task today to rebuild momentum
- Set a specific time tomorrow for your Rein check-in
- Review what caused the break and plan around it

View today's tasks: ${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions

We believe in you! 🚀
— The Rein Team
  `.trim();
};