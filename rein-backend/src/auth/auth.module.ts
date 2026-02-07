import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { SupabaseService } from '../common/supabase.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('google')
  async googleLogin(@Res() res: Response) {
    const { data, error } = await this.supabase.getClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://rein-63fq.onrender.com/auth/callback',
      },
    });

    if (error || !data.url) {
      return res.redirect('http://localhost:3000/login?error=google_auth_failed');
    }

    // Redirect browser to Google via Supabase
    res.redirect(data.url);
  }

  @Get('callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      return res.redirect('http://localhost:3000/login?error=no_code');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return res.redirect(`${frontendUrl}/dashboard?auth=success`);
  }

  // Optional: Sign out
  @Get('signout')
  async signOut(@Res() res: Response) {
    await this.supabase.getClient().auth.signOut();
    res.clearCookie('sb-access-token');
    return res.redirect('http://localhost:3000/signin');
  }
}