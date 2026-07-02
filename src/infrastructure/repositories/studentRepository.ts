import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IStudentRepository } from '@/domain/repositories/studentRepository';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import { handleSupabaseError } from './errorHelper';

export class StudentRepository implements IStudentRepository {
  async getStudents(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)');

    if (error) {
      throw handleSupabaseError(error, 'Falha ao carregar alunos do banco de dados.');
    }

    if (!data) return [];

    // Mapeia a estrutura do banco para o tipo do frontend
    const mapped: Aluno[] = data.map((student: any) => ({
      ...student,
      historicoGraduacoes: (student.graduacoes_historico || [])
        .map((g: any) => ({
          id: g.id,
          data: g.data_graduacao,
          faixa: g.faixa,
          graus: g.graus,
          avaliador: g.avaliador
        }))
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
    }));

    return mapped.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async createStudent(studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>): Promise<Aluno> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(studentData)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar aluno: ${error.message}`);
    }
    return data;
  }

  async updateStudent(id: number, studentData: Partial<Aluno>): Promise<void> {
    const { historicoGraduacoes: _hg, pagamentos: _pag, id: _id, ...payload } = studentData as any;

    const { error } = await supabase
      .from('alunos')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar aluno: ${error.message}`);
    }
  }

  async insertGraduationHistory(
    alunoId: number,
    faixa: Belt,
    graus: Degree,
    dataGrad: string,
    avaliador: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('graduacoes_historico')
      .insert({
        aluno_id: alunoId,
        faixa,
        graus,
        data_graduacao: dataGrad,
        avaliador
      })
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao registrar histórico de graduação: ${error.message}`);
    }
    return data;
  }

  async insertGraduationHistories(records: any[]): Promise<any[]> {
    const { data, error } = await supabase
      .from('graduacoes_historico')
      .insert(records)
      .select();

    if (error) {
      throw handleSupabaseError(error, `Erro ao inserir histórico de graduações em lote: ${error.message}`);
    }
    return data || [];
  }

  async insertStudentsBatch(students: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>[]): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(students)
      .select();

    if (error) {
      throw handleSupabaseError(error, `Erro ao inserir alunos em lote: ${error.message}`);
    }
    return data || [];
  }

  async deleteStudent(id: number): Promise<void> {
    // 1. Exclui pagamentos vinculados
    const { error: payError } = await supabase
      .from('pagamentos')
      .delete()
      .eq('alunoId', id);

    if (payError) {
      console.error(`Error deleting payments for student ${id}:`, payError);
    }

    // 2. Exclui registros de histórico de graduação vinculados
    const { error: histError } = await supabase
      .from('graduacoes_historico')
      .delete()
      .eq('aluno_id', id);

    if (histError) {
      console.error(`Error deleting graduation history for student ${id}:`, histError);
    }

    // 3. Exclui da tabela graduacoes
    const { error: gradTableError } = await supabase
      .from('graduacoes')
      .delete()
      .eq('aluno_id', id);

    if (gradTableError) {
      console.error(`Error deleting from graduacoes for student ${id}:`, gradTableError);
    }

    // 4. Exclui o aluno
    const { error: deleteError } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw handleSupabaseError(deleteError, `Erro ao excluir aluno: ${deleteError.message}`);
    }
  }

  async batchDeleteStudents(ids: number[]): Promise<void> {
    // 1. Exclui pagamentos de todos os selecionados
    const { error: payError } = await supabase
      .from('pagamentos')
      .delete()
      .in('alunoId', ids);

    if (payError) {
      console.error('Error deleting batch payments:', payError);
    }

    // 2. Exclui histórico de graduações antiga
    const { error: histError } = await supabase
      .from('graduacoes_historico')
      .delete()
      .in('aluno_id', ids);

    if (histError) {
      console.error('Error deleting batch graduation history:', histError);
    }

    // 3. Exclui da tabela graduacoes
    const { error: gradError } = await supabase
      .from('graduacoes')
      .delete()
      .in('aluno_id', ids);

    if (gradError) {
      console.error('Error deleting batch graduacoes:', gradError);
    }

    // 4. Exclui alunos
    const { error: deleteError } = await supabase
      .from('alunos')
      .delete()
      .in('id', ids);

    if (deleteError) {
      throw handleSupabaseError(deleteError, `Erro ao excluir alunos em lote: ${deleteError.message}`);
    }
  }

  async batchUpdateStatus(ids: number[], status: 'Ativo' | 'Inativo'): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .update({ status })
      .in('id', ids);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar status em lote: ${error.message}`);
    }
  }

  async getStudentById(id: number): Promise<Aluno | null> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw handleSupabaseError(error, `Falha ao carregar aluno: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...data,
      historicoGraduacoes: (data.graduacoes_historico || [])
        .map((g: any) => ({
          id: g.id,
          data: g.data_graduacao,
          faixa: g.faixa,
          graus: g.graus,
          avaliador: g.avaliador
        }))
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
    };
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    const { data, error } = await supabase
      .from('alunos')
      .select('senha')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Aluno não encontrado.');
    }

    const correctPassword = data.senha || '#sfbjj2026';
    if (correctPassword !== currentPass) {
      throw new Error('A senha atual fornecida está incorreta.');
    }

    const { error: updateError } = await supabase
      .from('alunos')
      .update({ senha: newPass })
      .eq('id', id);

    if (updateError) {
      throw handleSupabaseError(updateError, 'Erro ao atualizar a senha.');
    }
  }

  async addGraduation(studentId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string; avaliador: string }): Promise<void> {
    const { error } = await supabase
      .from('graduacoes_historico')
      .insert({
        aluno_id: studentId,
        faixa: data.faixa,
        graus: data.graus,
        data_graduacao: data.data_graduacao,
        avaliador: data.avaliador
      });

    if (error) {
      throw handleSupabaseError(error, 'Erro ao salvar histórico de graduação.');
    }
  }

  async updateGraduation(gradId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string }): Promise<void> {
    const { error } = await supabase
      .from('graduacoes_historico')
      .update({
        faixa: data.faixa,
        graus: data.graus,
        data_graduacao: data.data_graduacao
      })
      .eq('id', gradId);

    if (error) {
      throw handleSupabaseError(error, 'Erro ao atualizar graduação.');
    }
  }

  async deleteGraduation(gradId: number): Promise<void> {
    const { error } = await supabase
      .from('graduacoes_historico')
      .delete()
      .eq('id', gradId);

    if (error) {
      throw handleSupabaseError(error, 'Erro ao deletar graduação do histórico.');
    }
  }
}
