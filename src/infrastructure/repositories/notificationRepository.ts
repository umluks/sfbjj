import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { AppNotification } from '@/domain/models/notification';
import { handleSupabaseError } from './errorHelper';

export class NotificationRepository {
  async getNotificationsByStudent(alunoId: number): Promise<AppNotification[]> {
    const cacheKey = `notifications_student_${alunoId}`;
    const cached = cache.getFresh<AppNotification[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results = (data as AppNotification[]) || [];
      cache.set(cacheKey, results);
      return results;
    } catch (error: any) {
      const stale = cache.get<AppNotification[]>(cacheKey);
      if (stale) return stale;
      throw handleSupabaseError(error, 'Falha ao carregar notificações do aluno.');
    }
  }

  async createNotification(notification: Omit<AppNotification, 'id' | 'created_at' | 'lida'>): Promise<AppNotification> {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert({
        ...notification,
        lida: false
      })
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar notificação: ${error.message}`);
    }

    cache.clear(`notifications_student_${notification.aluno_id}`);
    return data as AppNotification;
  }

  async markAsRead(id: number, alunoId: number): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao marcar notificação como lida: ${error.message}`);
    }

    cache.clear(`notifications_student_${alunoId}`);
  }

  async markAllAsRead(alunoId: number): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('aluno_id', alunoId)
      .eq('lida', false);

    if (error) {
      throw handleSupabaseError(error, `Erro ao marcar todas notificações como lidas: ${error.message}`);
    }

    cache.clear(`notifications_student_${alunoId}`);
  }
}

export const notificationRepository = new NotificationRepository();
