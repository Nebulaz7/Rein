import { Controller, Get, Query, Res, Post, Body } from '@nestjs/common';
import type { Response } from 'express';
import { google } from 'googleapis';
import { McpCalendarService } from './mcp-calendar.service';
import type { ParsedResolution } from '../../common/types/index';

@Controller('mcp/calendar')
export class McpCalendarController {
  constructor(private readonly service: McpCalendarService) {}

  @Get('auth')
  auth(@Query('userId') userId: string, @Res() res: Response) {
    if (!userId) return res.status(400).send('Missing userId');

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}/mcp/calendar/callback`,
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: JSON.stringify({ userId }),
    });

    res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!code || !state) return res.status(400).send('Invalid callback');

    const { userId } = JSON.parse(state);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}/mcp/calendar/callback`,
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await this.service.storeTokens(userId, tokens);

    res.send(`
      <html>
        <body>
          <p id="status">Calendar connected successfully!</p>
          <script>
            const status = document.getElementById('status');
            console.log('window.opener:', window.opener);
            
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage({ type: 'calendar_connected', success: true }, '*');
                status.textContent = 'Calendar connected! Notifying parent window...';
                setTimeout(() => {
                  status.textContent = 'Done! This window will close now.';
                  window.close();
                }, 1000);
              } catch (e) {
                status.textContent = 'Connected but could not notify parent: ' + e.message;
                console.error('postMessage error:', e);
              }
            } else {
              status.textContent = 'Calendar connected! You can close this window manually.';
              console.log('No opener available');
            }
          </script>
        </body>
      </html>
    `);
  }

  // Internal endpoint – called from ChatService
  @Post('execute')
  async execute(
    @Body()
    body: {
      userId: string;
      roadmap: ParsedResolution;
      startDate?: string;
    },
  ) {
    return this.service.addRoadmapToCalendar(body.userId, body.roadmap, { startDate: body.startDate });
  }
}