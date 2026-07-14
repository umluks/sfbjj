import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { IClassRepository } from '@/domain/repositories/classRepository';
import type { Aula, Turma } from '@/domain/models/class';
import { handleSupabaseError } from './errorHelper';

export class ClassRepository implements IClassRepository {
  async getClasses(): Promise<Aula[]> {
    const cacheKey = 'classes';
    const cached = cache.getFresh<Aula[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*');

      if (error) {
        throw error;
      }

      const result = data || [];
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Aula[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando aulas do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, `Erro ao carregar aulas do banco: ${error.message}`);
    }
  }

  async createClass(classData: Omit<Aula, 'id'>): Promise<Aula> {
    const { data, error } = await supabase
      .from('aulas')
      .insert(classData)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao cadastrar aula no banco: ${error.message}`);
    }

    cache.clear('classes');
    return data;
  }

  async updateClass(id: number, classData: Partial<Aula>): Promise<void> {
    const { id: _, ...payload } = classData;

    const { error } = await supabase
      .from('aulas')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar aula no banco: ${error.message}`);
    }

    cache.clear('classes');
  }

  async deleteClass(id: number): Promise<void> {
    const { error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao excluir aula do banco: ${error.message}`);
    }

    cache.clear('classes');
  }

  async getTurmas(): Promise<Turma[]> {
    const cacheKey = 'turmas';
    const cached = cache.getFresh<Turma[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      const result = data || [];
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Turma[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando turmas do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, `Erro ao carregar turmas do banco: ${error.message}`);
    }
  }

  async createTurma(turmaData: Omit<Turma, 'id'>): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .insert(turmaData)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao cadastrar turma no banco: ${error.message}`);
    }

    cache.clear('turmas');
    return data;
  }

  async updateTurma(id: number, turmaData: Partial<Turma>): Promise<void> {
    const { id: _, ...payload } = turmaData;

    const { error } = await supabase
      .from('turmas')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar turma no banco: ${error.message}`);
    }

    cache.clear('turmas');
  }

  async deleteTurma(id: number): Promise<void> {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao excluir turma do banco: ${error.message}`);
    }

    cache.clear('turmas');
  }
}
