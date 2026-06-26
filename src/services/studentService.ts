import { supabase } from '../lib/supabase';
import type { Aluno, Belt, Degree } from '../types';

export const studentService = {
  /**
   * Busca todos os alunos do Supabase mapeando o histórico de graduações
   * e ordenando-os alfabeticamente.
   */
  async getStudents(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)');

    if (error) {
      console.error('Error fetching students:', error);
      throw new Error('Falha ao carregar alunos do banco de dados.');
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
        // Ordena do mais antigo para o mais recente
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
    }));

    // Ordena alfabeticamente por nome
    return mapped.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  },

  /**
   * Insere um novo aluno na tabela alunos.
   */
  async createStudent(studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>): Promise<any> {
    const { data, error } = await supabase
      .from('alunos')
      .insert(studentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      throw new Error(`Erro ao criar aluno: ${error.message}`);
    }
    return data;
  },

  /**
   * Atualiza um aluno existente no Supabase.
   */
  async updateStudent(id: number, studentData: Partial<Aluno>): Promise<void> {
    // Remove propriedades computadas que não existem na tabela
    const { historicoGraduacoes: _hg, pagamentos: _pag, id: _id, ...payload } = studentData as any;

    const { error } = await supabase
      .from('alunos')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error(`Error updating student ${id}:`, error);
      throw new Error(`Erro ao atualizar aluno: ${error.message}`);
    }
  },

  /**
   * Insere um registro na tabela graduacoes_historico.
   */
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
      console.error('Error inserting graduation record:', error);
      throw new Error(`Erro ao registrar histórico de graduação: ${error.message}`);
    }
    return data;
  },

  /**
   * Exclui o aluno do banco de dados, limpando pagamentos e histórico de graduações associados.
   */
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
      console.error(`Error deleting student ${id}:`, deleteError);
      throw new Error(`Erro ao excluir aluno: ${deleteError.message}`);
    }
  },

  /**
   * Exclui múltiplos alunos em lote.
   */
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
      console.error('Error deleting batch students:', deleteError);
      throw new Error(`Erro ao excluir alunos em lote: ${deleteError.message}`);
    }
  },

  /**
   * Atualiza o status em lote de múltiplos alunos.
   */
  async batchUpdateStatus(ids: number[], status: 'Ativo' | 'Inativo'): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .update({ status })
      .in('id', ids);

    if (error) {
      console.error('Error updating batch status:', error);
      throw new Error(`Erro ao atualizar status em lote: ${error.message}`);
    }
  },

  /**
   * Importa múltiplos alunos e cria seu histórico de graduação inicial no Supabase.
   */
  async importStudents(
    students: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>[],
    avaliador: string
  ): Promise<{ insertedStudents: any[]; insertedHistory: any[] }> {
    // 1. Insere todos os alunos
    const { data: insertedAlunos, error: insertError } = await supabase
      .from('alunos')
      .insert(students)
      .select();

    if (insertError) {
      console.error('Error importing students to Supabase:', insertError);
      throw new Error(`Erro ao inserir alunos importados: ${insertError.message}`);
    }

    let insertedGrads: any[] = [];
    if (insertedAlunos && insertedAlunos.length > 0) {
      // 2. Prepara histórico de graduação inicial para cada aluno inserido
      const graducoesToInsert = insertedAlunos.map(aluno => ({
        aluno_id: aluno.id,
        faixa: aluno.faixa,
        graus: aluno.graus,
        data_graduacao: aluno.dataUltimaGraduacao || aluno.dataMatricula,
        avaliador
      }));

      const { data, error: gradsError } = await supabase
        .from('graduacoes_historico')
        .insert(graducoesToInsert)
        .select();

      if (gradsError) {
        console.error('Error inserting graduation records for imported students:', gradsError);
      } else if (data) {
        insertedGrads = data;
      }
    }

    return {
      insertedStudents: insertedAlunos || [],
      insertedHistory: insertedGrads
    };
  }
};
