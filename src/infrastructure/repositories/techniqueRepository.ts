import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { Technique } from '@/domain/models/technique';
import { handleSupabaseError } from './errorHelper';

export class TechniqueRepository {
  async getTechniques(): Promise<Technique[]> {
    const cacheKey = 'techniques';
    
    // Tenta obter do cache fresco
    const cached = cache.getFresh<Technique[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('tecnicas')
        .select('*');

      if (error) {
        throw error;
      }

      const results = (data as Technique[] || []).sort(
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
    const { data, error } = await supabase
      .from('tecnicas')
      .insert(technique)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar técnica: ${error.message}`);
    }

    // Invalida cache
    cache.clear('techniques');

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
    cache.clear('techniques');
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
    cache.clear('techniques');
  }
}
