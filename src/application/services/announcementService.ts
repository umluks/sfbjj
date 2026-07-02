import { AnnouncementRepository } from '@/infrastructure/repositories/announcementRepository';
import type { Aviso } from '@/domain/models/announcement';

export class AnnouncementService {
  private announcementRepo = new AnnouncementRepository();

  async getAnnouncements(): Promise<Aviso[]> {
    return this.announcementRepo.getAnnouncements();
  }

  async createAnnouncement(announcementData: Omit<Aviso, 'id'>): Promise<Aviso> {
    return this.announcementRepo.createAnnouncement(announcementData);
  }

  async updateAnnouncement(id: number, announcementData: Partial<Aviso>): Promise<void> {
    return this.announcementRepo.updateAnnouncement(id, announcementData);
  }

  async deleteAnnouncement(id: number): Promise<void> {
    return this.announcementRepo.deleteAnnouncement(id);
  }
}

export const announcementService = new AnnouncementService();
export default announcementService;
