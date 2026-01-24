import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { SupabaseAuthGuard } from '../common/guard/auth.guard';
import type { Request } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Controller('user')
export class UserController {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return {
      message: 'Authenticated user',
      user: req['user'],
    };
  }

  @Get('profile')
  async getProfile(@Query('userId') userId: string) {
    if (!userId) {
      return { error: 'userId is required' };
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, calendar_connected')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return { calendar_connected: false };
    }

    return data;
  }
}