import { baseTemplate } from './base.template';
import { WelcomeEmailData } from '../types/email.types';

export const welcomeTemplate = (data: WelcomeEmailData): string => {
  const content = `
    <h1>🎯 Your journey to "${data.resolutionTitle}" begins now!</h1>
    
    <p>Hi ${data.userName},</p>
    
    <p>
      Congratulations on taking the first step! You've just created your first resolution,
      and we're excited to be part of your journey.
    </p>
    
    <div class="stats-box">
      <div class="stat-item">
        <span class="stat-label">📅 Total Stages:</span> ${data.totalNodes}
      </div>
      <div class="stat-item">
        <span class="stat-label">⏱️ Duration:</span> ${data.durationInDays} days
      </div>
      <div class="stat-item">
        <span class="stat-label">🎯 Goal:</span> ${data.resolutionTitle}
      </div>
    </div>
    
    <h2 style="font-size: 18px; margin: 32px 0 16px 0; color: #18181b;">
      What's Next?
    </h2>
    
    <p>
      Your first task is scheduled for <strong>${data.firstNodeDate}</strong>:
    </p>
    
    <div class="task-list">
      <div class="task-item">
        <strong>${data.firstNodeTitle}</strong>
      </div>
    </div>
    
    <p>
      💡 <strong>Pro tip:</strong> Build a streak by completing tasks daily. 
      Consistency is the key to achieving your goals!
    </p>
    
    <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions" class="button">
      View Your Roadmap
    </a>
    
    <p style="margin-top: 32px; color: #71717a; font-size: 14px;">
      Need help getting started? Reply to this email — we're here to help!
    </p>
    
    <p style="margin-top: 24px;">
      Keep going! 🚀<br>
      <strong>— The Rein Team</strong>
    </p>
  `;

  const preheader = `Welcome to Rein! Your journey to ${data.resolutionTitle} starts today.`;

  return baseTemplate(content, preheader);
};

// Plain text version for email clients that don't support HTML
export const welcomeTemplatePlainText = (data: WelcomeEmailData): string => {
  return `
🎯 Your journey to "${data.resolutionTitle}" begins now!

Hi ${data.userName},

Congratulations on taking the first step! You've just created your first resolution, and we're excited to be part of your journey.

HERE'S WHAT YOU'VE SET UP:
- Total Stages: ${data.totalNodes}
- Duration: ${data.durationInDays} days
- Goal: ${data.resolutionTitle}

WHAT'S NEXT?
Your first task is scheduled for ${data.firstNodeDate}:
"${data.firstNodeTitle}"

Pro tip: Build a streak by completing tasks daily. Consistency is the key to achieving your goals!

View your roadmap: ${process.env.FRONTEND_URL || 'https://rein.app'}/resolutions

Need help getting started? Reply to this email — we're here to help!

Keep going! 🚀
— The Rein Team
  `.trim();
};