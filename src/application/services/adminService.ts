import { AdminRepository } from '@/infrastructure/repositories/adminRepository';
import type { Administrador } from '@/domain/models/admin';

export class AdminService {
  private adminRepo = new AdminRepository();

  async getAdmins(): Promise<Administrador[]> {
    return this.adminRepo.getAdmins();
  }

  async createAdmin(adminData: Omit<Administrador, 'id'>): Promise<Administrador> {
    return this.adminRepo.createAdmin(adminData);
  }

  async updateAdmin(id: number, adminData: Partial<Administrador>): Promise<void> {
    return this.adminRepo.updateAdmin(id, adminData);
  }

  async deleteAdmin(id: number): Promise<void> {
    return this.adminRepo.deleteAdmin(id);
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    return this.adminRepo.changePassword(id, currentPass, newPass);
  }
}

export const adminService = new AdminService();
export default adminService;
