/**
 * Base HTML template wrapper for all emails
 * Provides consistent branding, styling, and footer
 */
export const baseTemplate = (content: string, preheader?: string): string => {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Rein</title>
    <style>
      /* Reset styles */
      body,
      table,
      td,
      a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }

      /* Base styles */
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, sans-serif;
        background-color: #0a0a0a;
        color: #fafafa;
      }

      /* Container */
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #0a0a0a;
      }

      /* Header */
      .header {
        padding: 32px 24px;
        text-align: center;
        background-color: #0a0a0a;
        border-bottom: 2px solid #52cbff;
      }

      .logo {
        font-size: 24px;
        font-weight: 700;
        color: #52cbff;
        text-decoration: none;
        letter-spacing: -0.5px;
        text-transform: uppercase;
      }

      /* Content */
      .content {
        padding: 40px 24px;
        background-color: #0a0a0a;
      }

      /* Typography */
      h1 {
        margin: 0 0 24px 0;
        font-size: 28px;
        font-weight: 900;
        line-height: 1.2;
        color: #fafafa;
        text-transform: uppercase;
        letter-spacing: -0.5px;
      }

      p {
        margin: 0 0 16px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #a1a1aa;
      }

      .strong-text {
        color: #fafafa;
        font-weight: 600;
      }

      /* Brutal Card/Box */
      .brutal-box {
        background-color: #18181b;
        border: 2px solid #52cbff;
        border-radius: 10px;
        box-shadow: 4px 4px 0px 0px #52cbff;
        padding: 24px;
        margin: 24px 0;
      }

      .brutal-box-success {
        background-color: #18181b;
        border: 2px solid #10b981;
        border-radius: 10px;
        box-shadow: 4px 4px 0px 0px #10b981;
        padding: 24px;
        margin: 24px 0;
      }

      .brutal-box-warning {
        background-color: #18181b;
        border: 2px solid #f59e0b;
        border-radius: 10px;
        box-shadow: 4px 4px 0px 0px #f59e0b;
        padding: 24px;
        margin: 24px 0;
      }

      /* Buttons */
      .button {
        display: inline-block;
        padding: 14px 32px;
        margin: 24px 0;
        background: #52cbff;
        color: #0a0a0a !important;
        text-decoration: none;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        border: 2px solid #52cbff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .button:hover {
        background: #3db8f0;
        border-color: #3db8f0;
      }

      .button-outline {
        display: inline-block;
        padding: 14px 32px;
        margin: 24px 0;
        background: transparent;
        color: #52cbff !important;
        text-decoration: none;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        border: 2px solid #52cbff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .button-outline:hover {
        background: #52cbff;
        color: #0a0a0a !important;
      }

      /* Stats box */
      .stats-box {
        background-color: #18181b;
        border: 2px solid #27272a;
        border-radius: 10px;
        padding: 20px;
        margin: 24px 0;
      }

      .stat-item {
        margin-bottom: 12px;
        font-size: 15px;
        color: #a1a1aa;
      }

      .stat-item:last-child {
        margin-bottom: 0;
      }

      .stat-label {
        font-weight: 600;
        color: #fafafa;
      }

      /* Task list */
      .task-list {
        margin: 24px 0;
      }

      .task-item {
        padding: 16px;
        background-color: #18181b;
        border: 2px solid #27272a;
        margin-bottom: 12px;
        border-radius: 8px;
      }

      .task-item.completed {
        border-color: #10b981;
      }

      .task-item.overdue {
        border-color: #ef4444;
      }

      /* Badge */
      .badge {
        display: inline-block;
        padding: 6px 14px;
        background-color: rgba(82, 203, 255, 0.1);
        border: 1px solid rgba(82, 203, 255, 0.3);
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        color: #52cbff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 16px;
      }

      /* Footer */
      .footer {
        padding: 32px 24px;
        text-align: center;
        background-color: #0a0a0a;
        border-top: 2px solid #27272a;
      }

      .footer-text {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #71717a;
      }

      .footer-link {
        color: #52cbff;
        text-decoration: none;
        font-weight: 500;
      }

      .footer-link:hover {
        text-decoration: underline;
      }

      /* Divider */
      .divider {
        height: 2px;
        background-color: #27272a;
        margin: 32px 0;
        border: none;
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
          font-size: 24px !important;
        }

        .button,
        .button-outline {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box;
        }
      }
    </style>
  </head>
  <body>
    ${preheader ? `
    <!-- Preheader text (hidden but shown in email preview) -->
    <div style="display: none; max-height: 0; overflow: hidden">
      ${preheader}
    </div>
    ` : ''}

    <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      width="100%"
      style="background-color: #0a0a0a;"
    >
      <tr>
        <td style="padding: 40px 10px">
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <a href="${process.env.FRONTEND_URL || 'https://rein.app'}" class="logo">
                🎯 REIN
              </a>
            </div>

            <!-- Main Content -->
            <div class="content">
              ${content}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">Made with 🩵 by the Rein team</p>
              <p class="footer-text">
                <a
                  href="${process.env.FRONTEND_URL || 'https://rein.app'}/settings/email"
                  class="footer-link"
                >
                  Email Preferences
                </a>
                •
                <a
                  href="${process.env.FRONTEND_URL || 'https://rein.app'}/help"
                  class="footer-link"
                >
                  Help Center
                </a>
              </p>
              <p class="footer-text" style="margin-top: 16px; font-size: 12px">
                If you no longer wish to receive these emails, you can
                <a
                  href="${process.env.FRONTEND_URL || 'https://rein.app'}/settings/email"
                  class="footer-link"
                >
                  update your preferences</a>.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
};