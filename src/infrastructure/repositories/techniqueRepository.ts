import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { Technique } from '@/domain/models/technique';
import { handleSupabaseError } from './errorHelper';

export class TechniqueRepository {
  async getTechniques(statusFilter?: 'aprovado' | 'pendente' | 'rejeitado' | 'todos'): Promise<Technique[]> {
    const cacheKey = `techniques_${statusFilter || 'todos'}`;
    
    // Tenta obter do cache fresco
    const cached = cache.getFresh<Technique[]>(cacheKey);
    if (cached) return cached;

    try {
      let data: any[] | null = null;
      let error: any = null;

      // 1. Tenta consulta normal
      try {
        let query = supabase.from('tecnicas').select('*');
        if (statusFilter && statusFilter !== 'todos') {
          query = query.eq('status', statusFilter);
        }
        const res = await query;
        data = res.data;
        error = res.error;
      } catch (err) {
        error = err;
      }

      // 2. Se falhar por causa da coluna status não existir no banco de dados ainda, faz fallback sem o filtro eq('status')
      if (error && (error.code === 'PGRST204' || error.message?.includes('status') || error.message?.includes('schema cache') || error.message?.includes('column'))) {
        console.warn('[TechniqueRepository] Coluna status ou classificacao ausente no banco. Executando fallback.');
        const resFallback = await supabase.from('tecnicas').select('*');
        if (!resFallback.error && resFallback.data) {
          data = resFallback.data;
          error = null;
        }
      }

      if (error) {
        throw error;
      }

      const results = ((data as Technique[]) || []).map(t => ({
        ...t,
        classificacao: t.classificacao || 'Outros',
        status: t.status || 'aprovado' // Fallback para posições sem status definido
      })).filter(t => {
        if (!statusFilter || statusFilter === 'todos') return true;
        return t.status === statusFilter;
      }).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      // Atualiza o cache
      cache.set(cacheKey, results);
      return results;
    } catch (error: any) {
      // Fallback offline: se falhar a rede, retorna o que tem em cache mesmo expirado
      const staleCached = cache.get<Technique[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando técnicas do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, 'Falha ao carregar técnicas do banco de dados.');
    }
  }

  async createTechnique(technique: Omit<Technique, 'id' | 'created_at'>): Promise<Technique> {
    const payload = {
      ...technique,
      status: technique.status || 'aprovado'
    };

    let data: any = null;
    let error: any = null;

    // Tenta inserção direta
    const res = await supabase
      .from('tecnicas')
      .insert(payload)
      .select()
      .single();

    data = res.data;
    error = res.error;

    // Se falhou porque alguma coluna nova ainda não foi criada no banco do cliente, remove campos novos e tenta novamente
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
      console.warn('[TechniqueRepository] Falha ao inserir técnica com novos campos. Tentando inserção com fallback:', error.message);
      const fallbackPayload: any = {
        titulo: technique.titulo,
        descricao: technique.descricao || '',
        categoria: technique.categoria,
        classificacao: technique.classificacao || 'Outros',
        video_url: technique.video_url || null
      };

      const fallbackRes = await supabase
        .from('tecnicas')
        .insert(fallbackPayload)
        .select()
        .single();

      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar técnica: ${error.message}`);
    }

    // Invalida todos os caches de técnicas
    cache.clearByPrefix('techniques');

    return data as Technique;
  }

  async validateTechnique(
    id: number,
    status: 'aprovado' | 'rejeitado',
    feedback?: string,
    adminName?: string
  ): Promise<Technique> {
    const payload: Partial<Technique> = {
      status,
      feedback_admin: feedback || '',
      validado_por: adminName || 'Administrador',
      validado_em: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tecnicas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao validar técnica: ${error.message}`);
    }

    cache.clearByPrefix('techniques');
    return data as Technique;
  }

  async updateTechnique(id: number, technique: Partial<Technique>): Promise<void> {
    const { id: _, created_at: __, ...payload } = technique as any;

    const { error } = await supabase
      .from('tecnicas')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar técnica: ${error.message}`);
    }

    // Invalida cache
    cache.clearByPrefix('techniques');
  }

  async deleteTechnique(id: number): Promise<void> {
    const { error } = await supabase
      .from('tecnicas')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao remover técnica: ${error.message}`);
    }

    // Invalida cache
    cache.clearByPrefix('techniques');
  }
}

export const techniqueRepository = new TechniqueRepository();
