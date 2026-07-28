import { notificationRepository } from '@/infrastructure/repositories/notificationRepository';
import type { AppNotification } from '@/domain/models/notification';

export class NotificationService {
  async getNotificationsByStudent(alunoId: number): Promise<AppNotification[]> {
    return notificationRepository.getNotificationsByStudent(alunoId);
  }

  async createNotification(notification: Omit<AppNotification, 'id' | 'created_at' | 'lida'>): Promise<AppNotification> {
    return notificationRepository.createNotification(notification);
  }

  async markAsRead(id: number, alunoId: number): Promise<void> {
    return notificationRepository.markAsRead(id, alunoId);
  }

  async markAllAsRead(alunoId: number): Promise<void> {
    return notificationRepository.markAllAsRead(alunoId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
