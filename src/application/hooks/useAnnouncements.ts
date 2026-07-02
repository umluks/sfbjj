import { useState, useEffect, useCallback } from 'react';
import type { Aviso } from '@/domain/models/announcement';
import { announcementService } from '@/application/services/announcementService';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Aviso[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar avisos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(async (announcementData: Omit<Aviso, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAnnouncement = await announcementService.createAnnouncement(announcementData);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar aviso.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: number, announcementData: Partial<Aviso>) => {
    setIsLoading(true);
    setError(null);
    try {
      await announcementService.updateAnnouncement(id, announcementData);
      setAnnouncements(prev =>
        prev.map(a => (a.id === id ? { ...a, ...announcementData } : a))
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar aviso.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar aviso.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    refetch: fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    setAnnouncements
  };
}
export default useAnnouncements;
