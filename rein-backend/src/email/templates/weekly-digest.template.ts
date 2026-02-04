import { baseTemplate } from './base.template';
import { WeeklyDigestData } from '../types/email.types';

export const weeklyDigestTemplate = (data: WeeklyDigestData): string => {
  const progressColor = 
    data.weekStats.progressPercent >= 75 ? '#22c55e' :
    data.weekStats.progressPercent >= 50 ? '#f59e0b' :
    '#ef4444';

  const content = `
    <h1>📊 Your week with Rein: ${data.weekStats.tasksCompleted} tasks completed</h1>
    
    <p>Hi ${data.userName},</p>
    
    <p>
      Here's your weekly summary. ${
        data.weekStats.tasksCompleted > 0 
          ? "Great progress this week! 🎉" 
          : "Let's make this coming week count! 💪"
      }
    </p>
    
    <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #18181b;">
      📈 Your Stats
    </h2>
    
    <div class="stats-box">
      <div class="stat-item">
        <span class="stat-label">🔥 Current Streak:</span> ${data.weekStats.currentStreak} days
        ${data.weekStats.currentStreak >= data.weekStats.longestStreak 
          ? '<span style="color: #22c55e; font-weight: 600; margin-left: 8px;">🏆 Personal Best!</span>' 
          : ''}
      </div>
      <div class="stat-item">
        <span class="stat-label">🏅 Longest Streak:</span> ${data.weekStats.longestStreak} days
      </div>
      <div class="stat-item">
        <span class="stat-label">✅ Tasks Completed:</span> ${data.weekStats.tasksCompleted}/${data.weekStats.totalTasks}
      </div>
      <div class="stat-item">
        <span class="stat-label">📊 Overall Progress:</span> 
        <span style="color: ${progressColor}; font-weight: 600;">
          ${data.weekStats.progressPercent}%
        </span>
      </div>
    </div>
    
    ${data.achievements.length > 0 ? `
      <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #18181b;">
        🎯 Top Achievements
      </h2>
      
      <div style="margin: 16px 0;">
        ${data.achievements.map(achievement => `
          <div style="padding: 16px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #22c55e; margin-bottom: 12px; border-radius: 4px;">
            <div style="font-weight: 600; color: #166534; margin-bottom: 4px;">
              ${achievement.title}
            </div>
            <div style="font-size: 14px; color: #15803d;">
              ${achievement.description}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${data.overdueTasks.length > 0 ? `
      <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #18181b;">
        ⚠️ Attention Needed
      </h2>
      
      <div class="task-list">
        ${data.overdueTasks.map(task => `
          <div class="task-item overdue">
            <strong>${task.title}</strong>
            <span style="color: #ef4444; font-size: 13px; margin-left: 8px;">
              ${task.daysOverdue} ${task.daysOverdue === 1 ? 'day' : 'days'} overdue
            </span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    ${data.upcomingTasks.length > 0 ? `
      <h2 style="font-size: 20px; margin: 32px 0 16px 0; color: #18181b;">
        📅 Week Ahead
      </h2>
      
      <div class="task-list">
        ${data.upcomingTasks.map(task => `
          <div class="task-item">
            <div style="font-size: 13px; color: #71717a; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
              ${task.day}
            </div>
            <strong>${task.title}</strong>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions" class="button">
      View Full Roadmap
    </a>
    
    <p style="margin-top: 32px; color: #71717a; font-size: 14px;">
      ${
        data.weekStats.currentStreak >= 7 
          ? '🔥 Your consistency is inspiring! Keep this momentum going.' 
          : '💡 Tip: Try to complete at least one task every day this week to build a strong streak.'
      }
    </p>
    
    <p style="margin-top: 24px;">
      Keep up the momentum! 🚀<br>
      <strong>— The Rein Team</strong>
    </p>
  `;

  const preheader = `${data.weekStats.tasksCompleted} tasks completed this week. ${
    data.weekStats.currentStreak > 0 
      ? `${data.weekStats.currentStreak}-day streak going strong!` 
      : 'See your progress and upcoming tasks.'
  }`;

  return baseTemplate(content, preheader);
};

export const weeklyDigestTemplatePlainText = (data: WeeklyDigestData): string => {
  return `
📊 Your week with Rein: ${data.weekStats.tasksCompleted} tasks completed

Hi ${data.userName},

Here's your weekly summary. ${
  data.weekStats.tasksCompleted > 0 
    ? "Great progress this week! 🎉" 
    : "Let's make this coming week count! 💪"
}

YOUR STATS
- Current Streak: ${data.weekStats.currentStreak} days${
  data.weekStats.currentStreak >= data.weekStats.longestStreak ? ' 🏆 Personal Best!' : ''
}
- Longest Streak: ${data.weekStats.longestStreak} days
- Tasks Completed: ${data.weekStats.tasksCompleted}/${data.weekStats.totalTasks}
- Overall Progress: ${data.weekStats.progressPercent}%

${data.achievements.length > 0 ? `
TOP ACHIEVEMENTS
${data.achievements.map(a => `✓ ${a.title}\n  ${a.description}`).join('\n')}
` : ''}

${data.overdueTasks.length > 0 ? `
ATTENTION NEEDED
${data.overdueTasks.map(t => `⚠️ ${t.title} (${t.daysOverdue} ${t.daysOverdue === 1 ? 'day' : 'days'} overdue)`).join('\n')}
` : ''}

${data.upcomingTasks.length > 0 ? `
WEEK AHEAD
${data.upcomingTasks.map(t => `${t.day}: ${t.title}`).join('\n')}
` : ''}

View your full roadmap: ${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions

${
  data.weekStats.currentStreak >= 7 
    ? '🔥 Your consistency is inspiring! Keep this momentum going.' 
    : '💡 Tip: Try to complete at least one task every day this week to build a strong streak.'
}

Keep up the momentum! 🚀
— The Rein Team
  `.trim();
};