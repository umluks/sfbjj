import { useState, useEffect, useCallback } from 'react';
import type { Aula, Turma } from '@/domain/models/class';
import { classService } from '@/application/services/classService';

export function useClasses() {
  const [classes, setClasses] = useState<Aula[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar aulas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTurmas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await classService.getTurmas();
      setTurmas(data);
    } catch (err: any) {
      // Se a tabela 'turmas' não existir no Supabase, mantemos turmas locais sem estourar erro fatal na UI
      console.warn('Erro ao buscar turmas no banco (verifique se a tabela turmas existe):', err);
      // Fallback para evitar que a aplicação quebre se a tabela ainda não foi criada no Supabase
      setTurmas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClass = useCallback(async (classData: Omit<Aula, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newClass = await classService.createClass(classData);
      setClasses(prev => [...prev, newClass]);
      return newClass;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar aula.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClass = useCallback(async (id: number, classData: Partial<Aula>) => {
    setIsLoading(true);
    setError(null);
    try {
      await classService.updateClass(id, classData);
      setClasses(prev =>
        prev.map(c => (c.id === id ? { ...c, ...classData } : c))
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar aula.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteClass = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await classService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar aula.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Turmas
  const createTurma = useCallback(async (turmaData: Omit<Turma, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTurma = await classService.createTurma(turmaData);
      setTurmas(prev => [...prev, newTurma]);
      return newTurma;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar turma.');
      // Fallback local se der erro no Supabase (ex: tabela inexistente)
      const fallbackTurma: Turma = { id: Date.now(), ...turmaData };
      setTurmas(prev => [...prev, fallbackTurma]);
      return fallbackTurma;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTurma = useCallback(async (id: number, turmaData: Partial<Turma>) => {
    setIsLoading(true);
    setError(null);
    try {
      await classService.updateTurma(id, turmaData);
      setTurmas(prev =>
        prev.map(t => (t.id === id ? { ...t, ...turmaData } : t))
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar turma.');
      // Fallback local
      setTurmas(prev =>
        prev.map(t => (t.id === id ? { ...t, ...turmaData } : t))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTurma = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await classService.deleteTurma(id);
      setTurmas(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar turma.');
      // Fallback local
      setTurmas(prev => prev.filter(t => t.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchTurmas();
  }, [fetchClasses, fetchTurmas]);

  return {
    classes,
    turmas,
    isLoading,
    error,
    refetch: () => {
      fetchClasses();
      fetchTurmas();
    },
    createClass,
    updateClass,
    deleteClass,
    createTurma,
    updateTurma,
    deleteTurma,
    setTurmas,
    setClasses
  };
}
export default useClasses;
