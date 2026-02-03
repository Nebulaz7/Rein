import { Controller, Get, Query, Redirect, Req } from '@nestjs/common';
import { GitHubService } from '../github.service';

@Controller('auth/github')
export class GitHubAuthController {
  constructor(private githubService: GitHubService) {}

  // User clicks "Connect GitHub" button -> redirect to this
  @Get('authorize')
  @Redirect()
  authorize(@Req() req) {
    const userId = req.user?.id || 'demo-user'; // Use your auth
    const redirectUri = 'http://localhost:5000/auth/github/callback';
    
    const url = this.githubService.getAuthorizationUrl(userId, redirectUri);
    return { url };
  }

  // GitHub redirects here after user authorizes
  @Get('callback')
  async callback(@Query('code') code: string, @Req() req) {
    const userId = req.user?.id || 'demo-user'; // Use your auth
    
    const account = await this.githubService.connectAccount({
      userId,
      code,
    });

    // Redirect to success page
    return {
      success: true,
      message: `GitHub account @${account.username} connected!`,
      redirectTo: '/dashboard',
    };
  }
}