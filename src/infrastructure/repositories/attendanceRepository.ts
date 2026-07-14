import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IAttendanceRepository } from '@/domain/repositories/attendanceRepository';
import type { Frequencia } from '@/domain/models/attendance';
import { handleSupabaseError } from './errorHelper';

export class AttendanceRepository implements IAttendanceRepository {
  private mapDbToModel(dbItem: any): Frequencia {
    return {
      id: dbItem.id,
      alunoId: dbItem.aluno_id,
      aulaId: dbItem.aula_id,
      turmaId: dbItem.turma_id || undefined,
      data: dbItem.data,
      horario: dbItem.horario,
      createdAt: dbItem.created_at,
      alunoNome: dbItem.alunos?.nome || dbItem.aluno?.nome || 'Desconhecido',
      turmaNome: dbItem.turmas?.nome || dbItem.turma?.nome || '',
      aulaHora: dbItem.aulas?.hora || dbItem.aula?.hora || '',
      aulaCategoria: dbItem.aulas?.categoria || dbItem.aula?.categoria || '',
      professorNome: dbItem.aulas?.professor || dbItem.aula?.professor || ''
    };
  }

  async getAttendanceByStudent(studentId: number): Promise<Frequencia[]> {
    const { data, error } = await supabase
      .from('frequencias')
      .select(`
        id,
        aluno_id,
        aula_id,
        turma_id,
        data,
        horario,
        created_at,
        alunos (nome),
        aulas (hora, professor, categoria),
        turmas (nome)
      `)
      .eq('aluno_id', studentId)
      .order('data', { ascending: false })
      .order('horario', { ascending: false });

    if (error) {
      throw handleSupabaseError(error, `Erro ao carregar frequências do aluno: ${error.message}`);
    }

    return (data || []).map(item => this.mapDbToModel(item));
  }

  async checkIn(alunoId: number, aulaId: number, turmaId?: number, dateStr?: string): Promise<Frequencia> {
    const payload: any = {
      aluno_id: alunoId,
      aula_id: aulaId
    };

    if (turmaId) {
      payload.turma_id = turmaId;
    }

    if (dateStr) {
      payload.data = dateStr;
    }

    const { data, error } = await supabase
      .from('frequencias')
      .insert(payload)
      .select(`
        id,
        aluno_id,
        aula_id,
        turma_id,
        data,
        horario,
        created_at,
        alunos (nome),
        aulas (hora, professor, categoria),
        turmas (nome)
      `)
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao realizar check-in: ${error.message}`);
    }

    return this.mapDbToModel(data);
  }

  async searchAttendance(filters: {
    startDate?: string;
    endDate?: string;
    categoria?: string;
    alunoId?: number;
  }): Promise<Frequencia[]> {
    let query = supabase
      .from('frequencias')
      .select(`
        id,
        aluno_id,
        aula_id,
        turma_id,
        data,
        horario,
        created_at,
        alunos (nome),
        aulas!inner (hora, professor, categoria),
        turmas (nome)
      `);

    if (filters.startDate) {
      query = query.gte('data', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('data', filters.endDate);
    }
    if (filters.categoria) {
      query = query.eq('aulas.categoria', filters.categoria);
    }
    if (filters.alunoId) {
      query = query.eq('aluno_id', filters.alunoId);
    }

    const { data, error } = await query
      .order('data', { ascending: false })
      .order('horario', { ascending: false });

    if (error) {
      throw handleSupabaseError(error, `Erro ao filtrar frequências: ${error.message}`);
    }

    return (data || []).map(item => this.mapDbToModel(item));
  }

  async deleteAttendance(attendanceId: number): Promise<void> {
    const { error } = await supabase
      .from('frequencias')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      throw handleSupabaseError(error, `Erro ao desmarcar presença: ${error.message}`);
    }
  }
}
