import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IClassRepository } from '@/domain/repositories/classRepository';
import type { Aula, Turma } from '@/domain/models/class';
import { handleSupabaseError } from './errorHelper';

export class ClassRepository implements IClassRepository {
  async getClasses(): Promise<Aula[]> {
    const { data, error } = await supabase
      .from('aulas')
      .select('*');

    if (error) {
      throw handleSupabaseError(error, `Erro ao carregar aulas do banco: ${error.message}`);
    }

    return data || [];
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
  }

  async deleteClass(id: number): Promise<void> {
    const { error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao excluir aula do banco: ${error.message}`);
    }
  }

  async getTurmas(): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .order('nome');

    if (error) {
      throw handleSupabaseError(error, `Erro ao carregar turmas do banco: ${error.message}`);
    }

    return data || [];
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
  }

  async deleteTurma(id: number): Promise<void> {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao excluir turma do banco: ${error.message}`);
    }
  }
}
