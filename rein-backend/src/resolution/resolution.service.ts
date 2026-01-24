import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class ResolutionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(userId: string, title: string, goal: string, roadmap: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('resolutions')
      .insert([{ user_id: userId, title, goal, roadmap }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAllByUser(userId: string) {
    console.log('Finding resolution for userId:', userId);

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('resolutions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('Query result:', { data, error });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, userId?: string) {
    const client = this.supabaseService.getClient();
    
    let query = client
      .from('resolutions')
      .select('*')
      .eq('id', id);

    // If userId is provided, show their resolutions or public ones
    // If no userId, only show public resolutions
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string, userId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('resolutions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async togglePublic(id: string, userId: string, isPublic: boolean) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('resolutions')
      .update({ is_public: isPublic })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}