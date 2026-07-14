import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { IAnnouncementRepository } from '@/domain/repositories/announcementRepository';
import type { Aviso } from '@/domain/models/announcement';
import { handleSupabaseError } from './errorHelper';

export class AnnouncementRepository implements IAnnouncementRepository {
  async getAnnouncements(): Promise<Aviso[]> {
    const cacheKey = 'announcements';
    const cached = cache.getFresh<Aviso[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*');

      if (error) {
        throw error;
      }

      const result = data || [];
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Aviso[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando comunicados do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, `Erro ao carregar avisos do banco: ${error.message}`);
    }
  }

  async createAnnouncement(announcementData: Omit<Aviso, 'id'>): Promise<Aviso> {
    const { data, error } = await supabase
      .from('avisos')
      .insert(announcementData)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar aviso no banco: ${error.message}`);
    }

    cache.clear('announcements');
    return data;
  }

  async updateAnnouncement(id: number, announcementData: Partial<Aviso>): Promise<void> {
    const { id: _, ...payload } = announcementData;

    const { error } = await supabase
      .from('avisos')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar aviso no banco: ${error.message}`);
    }

    cache.clear('announcements');
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao excluir aviso do banco: ${error.message}`);
    }

    cache.clear('announcements');
  }
}
