import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { ITeacherRepository } from '@/domain/repositories/teacherRepository';
import type { Professor } from '@/domain/models/teacher';
import { handleSupabaseError } from './errorHelper';

export class TeacherRepository implements ITeacherRepository {
  async getTeachers(): Promise<Professor[]> {
    const cacheKey = 'teachers';
    const cached = cache.getFresh<Professor[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      const result = data || [];
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Professor[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando professores do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, `Falha ao buscar professores: ${error.message}`);
    }
  }

  async createTeacher(teacherData: Omit<Professor, 'id'>): Promise<Professor> {
    const { data, error } = await supabase
      .from('professores')
      .insert({
        ...teacherData,
        role: 'teacher'
      })
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao cadastrar professor: ${error.message}`);
    }

    cache.clear('teachers');
    return data;
  }

  async updateTeacher(id: number, teacherData: Partial<Professor>): Promise<void> {
    const { id: _, ...payload } = teacherData;

    const { error } = await supabase
      .from('professores')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar professor: ${error.message}`);
    }

    cache.clear('teachers');
  }

  async deleteTeacher(id: number): Promise<void> {
    const { error } = await supabase
      .from('professores')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao deletar professor: ${error.message}`);
    }

    cache.clear('teachers');
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    const { data, error } = await supabase
      .from('professores')
      .select('senha')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Professor não encontrado.');
    }

    if (data.senha !== currentPass) {
      throw new Error('A senha atual fornecida está incorreta.');
    }

    const { error: updateError } = await supabase
      .from('professores')
      .update({ senha: newPass })
      .eq('id', id);

    if (updateError) {
      throw handleSupabaseError(updateError, 'Erro ao atualizar a senha.');
    }

    cache.clear('teachers');
  }
}
