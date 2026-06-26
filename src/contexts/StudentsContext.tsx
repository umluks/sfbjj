import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Aluno, Belt, Degree, LoggedUser } from '../types';
import { studentService } from '../services/studentService';

interface StudentsContextType {
  students: Aluno[];
  isLoading: boolean;
  error: string | null;
  loadStudents: () => Promise<void>;
  clearStudents: () => void;
  createStudent: (
    studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>,
    loggedUser: LoggedUser | null
  ) => Promise<Aluno>;
  updateStudent: (id: number, studentData: Partial<Aluno>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  batchUpdateStatus: (ids: number[], status: 'Ativo' | 'Inativo') => Promise<void>;
  batchDeleteStudents: (ids: number[]) => Promise<void>;
  importStudents: (
    rows: any[],
    loggedUser: LoggedUser | null
  ) => Promise<void>;
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca e carrega todos os alunos e seus históricos/pagamentos.
   * Deve ser disparado apenas por usuários autorizados (admin/teacher) pós-login.
   */
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar alunos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Limpa a lista de alunos (por exemplo, ao fazer logout).
   */
  const clearStudents = useCallback(() => {
    setStudents([]);
    setError(null);
  }, []);

  /**
   * Cria um novo aluno no banco e insere seu histórico inicial de graduação.
   */
  const createStudent = useCallback(
    async (
      studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>,
      loggedUser: LoggedUser | null
    ): Promise<Aluno> => {
      setIsLoading(true);
      try {
        const newStudentData = await studentService.createStudent(studentData);
        let initialHistory: any[] = [];

        if (newStudentData) {
          // Cria o histórico de graduação inicial com base na faixa de cadastro
          const dbUltimaGrad = studentData.dataUltimaGraduacao || new Date().toISOString().split('T')[0];
          const newGradDataDb = await studentService.insertGraduationHistory(
            newStudentData.id,
            studentData.faixa,
            studentData.graus,
            dbUltimaGrad,
            loggedUser?.nome || 'Professor'
          );

          if (newGradDataDb) {
            initialHistory = [{
              id: newGradDataDb.id,
              faixa: newGradDataDb.faixa,
              graus: newGradDataDb.graus,
              data: newGradDataDb.data_graduacao,
              avaliador: newGradDataDb.avaliador
            }];
          }
        }

        const newStudent: Aluno = {
          ...newStudentData,
          historicoGraduacoes: initialHistory,
          pagamentos: []
        };

        setStudents(prev => [newStudent, ...prev].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
        return newStudent;
      } catch (err: any) {
        console.error(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Atualiza os dados cadastrais de um aluno.
   */
  const updateStudent = useCallback(async (id: number, studentData: Partial<Aluno>): Promise<void> => {
    setIsLoading(true);
    try {
      await studentService.updateStudent(id, studentData);

      setStudents(prev =>
        prev.map(s => {
          if (s.id === id) {
            return {
              ...s,
              ...studentData
            };
          }
          return s;
        }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      );
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deleta um aluno do sistema, limpando faturas e histórico de graduações.
   */
  const deleteStudent = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Altera status (Ativo/Inativo) em lote de múltiplos alunos.
   */
  const batchUpdateStatus = useCallback(async (ids: number[], status: 'Ativo' | 'Inativo'): Promise<void> => {
    setIsLoading(true);
    try {
      await studentService.batchUpdateStatus(ids, status);
      setStudents(prev =>
        prev.map(s => (ids.includes(s.id) ? { ...s, status } : s))
      );
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Exclui múltiplos alunos em lote.
   */
  const batchDeleteStudents = useCallback(async (ids: number[]): Promise<void> => {
    setIsLoading(true);
    try {
      await studentService.batchDeleteStudents(ids);
      setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Importa múltiplos alunos de uma planilha via CSV/XLS.
   */
  const importStudents = useCallback(
    async (rows: any[], loggedUser: LoggedUser | null): Promise<void> => {
      setIsLoading(true);
      try {
        const avaliador = loggedUser?.nome || 'Professor';
        const { insertedStudents, insertedHistory } = await studentService.importStudents(rows, avaliador);

        // Associa os históricos gerados aos respectivos alunos importados
        const newStudentsWithHistory: Aluno[] = insertedStudents.map(aluno => {
          const studentGrads = insertedHistory.filter(g => g.aluno_id === aluno.id);
          return {
            ...aluno,
            historicoGraduacoes: studentGrads
              .map(g => ({
                id: g.id,
                data: g.data_graduacao,
                faixa: g.faixa as Belt,
                graus: g.graus as Degree,
                avaliador: g.avaliador
              }))
              .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
            pagamentos: []
          };
        });

        setStudents(prev => {
          const merged = [...newStudentsWithHistory, ...prev];
          return merged.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        });
      } catch (err: any) {
        console.error(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <StudentsContext.Provider
      value={{
        students,
        isLoading,
        error,
        loadStudents,
        clearStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        batchUpdateStatus,
        batchDeleteStudents,
        importStudents,
        setStudents
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};
