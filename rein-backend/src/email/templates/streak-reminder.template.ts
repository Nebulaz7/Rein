import { baseTemplate } from './base.template';
import { StreakReminderData } from '../types/email.types';

export const streakReminderTemplate = (data: StreakReminderData): string => {
  const content = `
    <h1>🔥 Don't break your ${data.currentStreak}-day streak!</h1>
    
    <p>Hi ${data.userName},</p>
    
    <p>
      You haven't completed any tasks today, and your <strong>${data.currentStreak}-day streak</strong> is at risk!
    </p>
    
    <div class="stats-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b;">
      <div style="text-align: center; padding: 8px;">
        <div style="font-size: 48px; font-weight: 700; color: #ea580c; margin-bottom: 8px;">
          ${data.currentStreak}
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #9a3412; text-transform: uppercase; letter-spacing: 1px;">
          Day Streak
        </div>
      </div>
    </div>
    
    <h2 style="font-size: 18px; margin: 32px 0 16px 0; color: #18181b;">
      Today's Pending Tasks
    </h2>
    
    <div class="task-list">
      ${data.todaysTasks.map(task => `
        <div class="task-item ${task.isOverdue ? 'overdue' : ''}">
          <strong>${task.title}</strong>
          ${task.isOverdue ? '<span style="color: #ef4444; font-size: 13px; margin-left: 8px;">⚠️ Overdue</span>' : ''}
        </div>
      `).join('')}
    </div>
    
    <p style="margin-top: 24px;">
      💪 <strong>Take just 5 minutes right now</strong> to keep your momentum going. 
      Every day counts!
    </p>
    
    <a href="${data.appLink}" class="button">
      Complete Tasks Now
    </a>
    
    <p style="margin-top: 32px; color: #71717a; font-size: 14px;">
      <em>Tip: Set a daily reminder in your calendar to check off your tasks. 
      The best time to build habits is at the same time every day.</em>
    </p>
    
    <p style="margin-top: 24px;">
      You've got this! 💪<br>
      <strong>— The Rein Team</strong>
    </p>
  `;

  const preheader = `Your ${data.currentStreak}-day streak is at risk! Complete your tasks today.`;

  return baseTemplate(content, preheader);
};

export const streakReminderTemplatePlainText = (data: StreakReminderData): string => {
  return `
🔥 Don't break your ${data.currentStreak}-day streak!

Hi ${data.userName},

You haven't completed any tasks today, and your ${data.currentStreak}-day streak is at risk!

CURRENT STREAK: ${data.currentStreak} DAYS

TODAY'S PENDING TASKS:
${data.todaysTasks.map(task => `
- ${task.title}${task.isOverdue ? ' (⚠️ Overdue)' : ''}
`).join('')}

Take just 5 minutes right now to keep your momentum going. Every day counts!

Complete your tasks: ${data.appLink}

Tip: Set a daily reminder in your calendar to check off your tasks. The best time to build habits is at the same time every day.

You've got this! 💪
— The Rein Team
  `.trim();
};