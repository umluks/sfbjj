import type { Aviso } from '../models/announcement';

export interface IAnnouncementRepository {
  getAnnouncements(): Promise<Aviso[]>;
  createAnnouncement(announcementData: Omit<Aviso, 'id'>): Promise<Aviso>;
  updateAnnouncement(id: number, announcementData: Partial<Aviso>): Promise<void>;
  deleteAnnouncement(id: number): Promise<void>;
}
