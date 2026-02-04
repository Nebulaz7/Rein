/**
 * Base HTML template wrapper for all emails
 * Provides consistent branding, styling, and footer
 */
export const baseTemplate = (content: string, preheader?: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Rein</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Header */
    .header {
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    
    /* Content */
    .content {
      padding: 40px 24px;
    }
    
    /* Typography */
    h1 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      color: #18181b;
    }
    
    p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #3f3f46;
    }
    
    /* Buttons */
    .button {
      display: inline-block;
      padding: 14px 28px;
      margin: 24px 0;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    
    .button:hover {
      opacity: 0.9;
    }
    
    /* Stats box */
    .stats-box {
      background-color: #f4f4f5;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .stat-item {
      margin-bottom: 12px;
      font-size: 15px;
      color: #52525b;
    }
    
    .stat-item:last-child {
      margin-bottom: 0;
    }
    
    .stat-label {
      font-weight: 600;
      color: #18181b;
    }
    
    /* Task list */
    .task-list {
      margin: 24px 0;
    }
    
    .task-item {
      padding: 12px 16px;
      background-color: #fafafa;
      border-left: 3px solid #6366f1;
      margin-bottom: 8px;
      border-radius: 4px;
    }
    
    .task-item.overdue {
      border-left-color: #ef4444;
      background-color: #fef2f2;
    }
    
    /* Footer */
    .footer {
      padding: 32px 24px;
      text-align: center;
      background-color: #fafafa;
      border-top: 1px solid #e4e4e7;
    }
    
    .footer-text {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #71717a;
    }
    
    .footer-link {
      color: #6366f1;
      text-decoration: none;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      
      .content {
        padding: 32px 20px !important;
      }
      
      h1 {
        font-size: 22px !important;
      }
      
      .button {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `
  <!-- Preheader text (hidden but shown in email preview) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${preheader}
  </div>
  ` : ''}
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 10px;">
        <div class="email-container">
          
          <!-- Header -->
          <div class="header">
            <a href="${process.env.FRONTEND_URL || 'https://rein.app'}" class="logo">
              🎯 Rein
            </a>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            ${content}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              Made with 💜 by the Rein team
            </p>
            <p class="footer-text">
              <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/settings/email" class="footer-link">
                Email Preferences
              </a>
              •
              <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/help" class="footer-link">
                Help Center
              </a>
            </p>
            <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
              If you no longer wish to receive these emails, you can 
              <a href="${process.env.FRONTEND_URL || 'https://rein.app'}/settings/email" class="footer-link">
                update your preferences
              </a>.
            </p>
          </div>
          
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};