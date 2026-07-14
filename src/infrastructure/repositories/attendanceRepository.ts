import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
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
    const cacheKey = `attendance_student_${studentId}`;
    const cached = cache.getFresh<Frequencia[]>(cacheKey);
    if (cached) return cached;

    try {
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
        throw error;
      }

      const result = (data || []).map(item => this.mapDbToModel(item));
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Frequencia[]>(cacheKey);
      if (staleCached) {
        console.warn(`Operando offline: retornando frequências do aluno ${studentId} do cache local.`);
        return staleCached;
      }
      throw handleSupabaseError(error, `Erro ao carregar frequências do aluno: ${error.message}`);
    }
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

    cache.clearByPrefix('attendance');
    // Como a frequência altera a visualização do perfil/histórico do aluno, limpamos também o cache do aluno
    cache.clear('students');
    cache.clear(`student_${alunoId}`);

    return this.mapDbToModel(data);
  }

  async searchAttendance(filters: {
    startDate?: string;
    endDate?: string;
    categoria?: string;
    alunoId?: number;
  }): Promise<Frequencia[]> {
    const cacheKey = `attendance_search_${JSON.stringify(filters)}`;
    const cached = cache.getFresh<Frequencia[]>(cacheKey);
    if (cached) return cached;

    try {
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
        throw error;
      }

      const result = (data || []).map(item => this.mapDbToModel(item));
      cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      const staleCached = cache.get<Frequencia[]>(cacheKey);
      if (staleCached) {
        console.warn('Operando offline: retornando busca de frequências do cache local.');
        return staleCached;
      }
      throw handleSupabaseError(error, `Erro ao filtrar frequências: ${error.message}`);
    }
  }

  async deleteAttendance(attendanceId: number): Promise<void> {
    // Para limpar o cache do aluno envolvido antes ou depois, precisamos buscar o aluno_id
    const { data: attRecord } = await supabase
      .from('frequencias')
      .select('aluno_id')
      .eq('id', attendanceId)
      .maybeSingle();

    const { error } = await supabase
      .from('frequencias')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      throw handleSupabaseError(error, `Erro ao desmarcar presença: ${error.message}`);
    }

    cache.clearByPrefix('attendance');
    cache.clear('students');
    if (attRecord) {
      cache.clear(`student_${attRecord.aluno_id}`);
    }
  }
}
