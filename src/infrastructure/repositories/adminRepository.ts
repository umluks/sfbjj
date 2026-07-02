import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IAdminRepository } from '@/domain/repositories/adminRepository';
import type { Administrador } from '@/domain/models/admin';
import { handleSupabaseError } from './errorHelper';

export class AdminRepository implements IAdminRepository {
  async getAdmins(): Promise<Administrador[]> {
    const { data, error } = await supabase
      .from('administradores')
      .select('*')
      .order('nome');

    if (error) {
      throw handleSupabaseError(error, `Falha ao buscar administradores: ${error.message}`);
    }

    return data || [];
  }

  async createAdmin(adminData: Omit<Administrador, 'id'>): Promise<Administrador> {
    const { data, error } = await supabase
      .from('administradores')
      .insert(adminData)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao cadastrar administrador: ${error.message}`);
    }

    return data;
  }

  async updateAdmin(id: number, adminData: Partial<Administrador>): Promise<void> {
    const { id: _, ...payload } = adminData;

    const { error } = await supabase
      .from('administradores')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao atualizar administrador: ${error.message}`);
    }
  }

  async deleteAdmin(id: number): Promise<void> {
    const { error } = await supabase
      .from('administradores')
      .delete()
      .eq('id', id);

    if (error) {
      throw handleSupabaseError(error, `Erro ao deletar administrador: ${error.message}`);
    }
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    const { data, error } = await supabase
      .from('administradores')
      .select('senha')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Administrador não encontrado.');
    }

    if (data.senha !== currentPass) {
      throw new Error('A senha atual fornecida está incorreta.');
    }

    const { error: updateError } = await supabase
      .from('administradores')
      .update({ senha: newPass })
      .eq('id', id);

    if (updateError) {
      throw handleSupabaseError(updateError, 'Erro ao atualizar a senha.');
    }
  }
}
