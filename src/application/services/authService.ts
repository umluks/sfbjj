import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { LoggedUser } from '@/domain/models/auth';

export class AuthService {
  /**
   * Realiza a autenticação de forma cascateada nas tabelas do sistema.
   * Verifica Administradores, Professores e Alunos (por e-mail ou CPF).
   */
  async login(identifier: string, passwordString: string): Promise<LoggedUser> {
    const username = identifier.trim().toLowerCase();
    const cleanedCpfInput = username.replace(/\D/g, '');

    // 1. Login via e-mail
    if (username.includes('@')) {
      // 1.1 Administradores
      const { data: adminData, error: adminError } = await supabase
        .from('administradores')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (adminError) {
        throw new Error(`Erro ao verificar administrador: ${adminError.message}`);
      }

      if (adminData) {
        if (adminData.senha === passwordString) {
          return {
            role: 'admin',
            adminId: adminData.id,
            nome: adminData.nome,
            foto_perfil: adminData.foto_perfil
          };
        } else {
          throw new Error('Senha incorreta para o administrador.');
        }
      }

      // 1.2 Professores
      const { data: profData, error: profError } = await supabase
        .from('professores')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (profError) {
        throw new Error(`Erro ao verificar professor: ${profError.message}`);
      }

      if (profData) {
        if (profData.senha === passwordString) {
          return {
            role: 'teacher',
            professorId: profData.id,
            nome: profData.nome,
            email: profData.email,
            telefone: profData.telefone,
            foto_perfil: profData.foto_perfil,
            assinatura: profData.assinatura
          };
        } else {
          throw new Error('Senha incorreta para o professor.');
        }
      }

      // 1.3 Alunos por E-mail
      const { data: studentByEmail, error: studError } = await supabase
        .from('alunos')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (studError) {
        throw new Error(`Erro ao verificar aluno: ${studError.message}`);
      }

      if (studentByEmail) {
        const studentPassword = studentByEmail.senha || '#sfbjj2026';
        if (passwordString === studentPassword) {
          if (studentByEmail.status === 'Inativo') {
            throw new Error('Sua conta ainda não foi ativada. Aguarde a validação de um professor ou da administração para acessar o sistema.');
          }
          return {
            role: studentByEmail.role || 'student',
            alunoId: studentByEmail.id,
            nome: studentByEmail.nome,
            foto_perfil: studentByEmail.fotoPerfil
          };
        } else {
          throw new Error('Senha incorreta.');
        }
      }

      throw new Error('Usuário não encontrado com este e-mail.');
    }

    // 2. Login via CPF (apenas para alunos)
    if (cleanedCpfInput.length > 0) {
      const { data: student, error: dbError } = await supabase
        .from('alunos')
        .select('*')
        .or(`cpf.eq."${username}",cpf.eq."${cleanedCpfInput}"`)
        .maybeSingle();

      if (dbError) {
        throw new Error(`Erro ao buscar aluno por CPF: ${dbError.message}`);
      }

      if (student) {
        const studentPassword = student.senha || '#sfbjj2026';
        if (passwordString === studentPassword) {
          if (student.status === 'Inativo') {
            throw new Error('Sua conta ainda não foi ativada. Aguarde a validação de um professor ou da administração para acessar o sistema.');
          }
          return {
            role: student.role || 'student',
            alunoId: student.id,
            nome: student.nome,
            foto_perfil: student.fotoPerfil
          };
        } else {
          throw new Error('Senha incorreta.');
        }
      }

      throw new Error('Nenhum aluno encontrado com este CPF.');
    }

    throw new Error('Por favor, informe um e-mail ou CPF válido.');
  }

  /**
   * Realiza o auto-cadastro de um novo aluno no sistema.
   * Sempre atribui o perfil 'student' e status 'Inativo' (aguardando validação por professor/admin).
   */
  async registerStudent(studentData: any): Promise<any> {
    const cleanEmail = studentData.email?.trim().toLowerCase();
    const cleanCpf = studentData.cpf?.replace(/\D/g, '');

    // Verifica se já existe aluno cadastrado com o mesmo e-mail
    if (cleanEmail) {
      const { data: existingEmail } = await supabase
        .from('alunos')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Já existe um aluno cadastrado com este e-mail.');
      }
    }

    // Verifica se já existe aluno cadastrado com o mesmo CPF
    if (cleanCpf) {
      const { data: existingCpf } = await supabase
        .from('alunos')
        .select('id')
        .or(`cpf.eq."${studentData.cpf}",cpf.eq."${cleanCpf}"`)
        .maybeSingle();

      if (existingCpf) {
        throw new Error('Já existe um aluno cadastrado com este CPF.');
      }
    }

    // Garante obrigatoriamente a role 'student' e status 'Inativo' (aguardando aprovação)
    const payload = {
      ...studentData,
      role: 'student',
      status: 'Inativo'
    };

    const { data, error } = await supabase
      .from('alunos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao realizar cadastro de aluno: ${error.message}`);
    }

    return data;
  }

  /**
   * Verifica se um aluno possui cadastro ativo no banco de dados.
   * Retorna true se estiver ativo, false se inativo ou inexistente.
   */
  async checkStudentActive(alunoId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('status')
        .eq('id', alunoId)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      return data.status === 'Ativo';
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
