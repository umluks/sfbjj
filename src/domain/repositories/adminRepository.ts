import type { Administrador } from '../models/admin';

export interface IAdminRepository {
  getAdmins(): Promise<Administrador[]>;
  createAdmin(adminData: Omit<Administrador, 'id'>): Promise<Administrador>;
  updateAdmin(id: number, adminData: Partial<Administrador>): Promise<void>;
  deleteAdmin(id: number): Promise<void>;
  changePassword(id: number, currentPass: string, newPass: string): Promise<void>;
}
