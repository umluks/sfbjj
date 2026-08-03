import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { LoggedUser } from '@/domain/models/auth';
import { tokenService } from '@/infrastructure/auth/tokenService';

export class AuthService {
  /**
   * Realiza a autenticação de forma cascateada nas tabelas do sistema.
   * Verifica Administradores, Professores e Alunos (por e-mail ou CPF).
   */
  async login(identifier: string, passwordString: string): Promise<LoggedUser> {
    const username = identifier.trim().toLowerCase();
    const cleanedCpfInput = username.replace(/\D/g, '');

    let authenticatedUser: LoggedUser | null = null;

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
          authenticatedUser = {
            role: 'admin',
            adminId: adminData.id,
            nome: adminData.nome,
            foto_perfil: adminData.foto_perfil
          };
        } else {
          throw new Error('Senha incorreta para o administrador.');
        }
      }

      if (!authenticatedUser) {
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
            authenticatedUser = {
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
      }

      if (!authenticatedUser) {
        // Apenas Administradores e Professores acessam por E-mail
        throw new Error('Apenas Administradores e Professores podem acessar via e-mail. Alunos devem entrar utilizando o CPF.');
      }
    } else if (cleanedCpfInput.length > 0) {
      // 2. Login via CPF (apenas para alunos)
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
          if (student.status === 'Pendente' || student.status === 'Aguardando' || student.status === 'Aguardando Aprovação') {
            throw new Error('Sua conta está pendente de aprovação. Aguarde a validação de um professor ou da administração para acessar o sistema.');
          }
          if (student.status === 'Inativo') {
            throw new Error('Sua conta está inativa. Entre em contato com a administração para reativar seu acesso.');
          }
          authenticatedUser = {
            role: student.role || 'student',
            alunoId: student.id,
            nome: student.nome,
            foto_perfil: student.fotoPerfil
          };
        } else {
          throw new Error('Senha incorreta.');
        }
      } else {
        throw new Error('Nenhum aluno encontrado com este CPF.');
      }
    } else {
      throw new Error('Por favor, informe um e-mail (Admin/Professor) ou CPF (Aluno) válido.');
    }

    if (authenticatedUser) {
      // Salva o par Access Token + Refresh Token de forma segura
      tokenService.saveSession(authenticatedUser);
      return authenticatedUser;
    }

    throw new Error('Falha ao autenticar usuário.');
  }

  /**
   * Restaura a sessão do usuário utilizando o Refresh Token / Access Token.
   */
  async restoreSession(): Promise<LoggedUser | null> {
    try {
      const user = await tokenService.restoreSession();
      if (!user) return null;

      // Validação de aluno ativo ao restaurar sessão
      if (user.role === 'student' && user.alunoId) {
        const isActive = await this.checkStudentActive(user.alunoId);
        if (!isActive) {
          tokenService.clearSession();
          return null;
        }
      }

      return user;
    } catch (err) {
      console.warn('Erro ao restaurar sessao:', err);
      tokenService.clearSession();
      return null;
    }
  }

  /**
   * Efetua o logout do usuário revogando os tokens.
   */
  logout(): void {
    tokenService.clearSession();
  }

  /**
   * Realiza o auto-cadastro de um novo aluno no sistema.
   * Atribui perfil 'student' e status 'Pendente' (aguardando aprovação).
   * Apenas o CPF é único no cadastro de alunos.
   */
  async registerStudent(studentData: Record<string, unknown>): Promise<unknown> {
    const cleanCpf = (studentData.cpf as string | undefined)?.replace(/\D/g, '');

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

    // Garante obrigatoriamente a role 'student' e status 'Pendente' (aguardando aprovação)
    const payload = {
      ...studentData,
      role: 'student',
      status: 'Pendente'
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

  /**
   * Realiza a redefinição de senha com validação de identidade (CPF/E-mail + Dado de confirmação).
   */
  async resetPassword(params: {
    identifier: string;
    confirmationData: string;
    newPasswordString: string;
  }): Promise<{ message: string }> {
    const username = params.identifier.trim().toLowerCase();
    const cleanedCpfInput = username.replace(/\D/g, '');
    const confirmVal = params.confirmationData.trim().toLowerCase();
    const cleanConfirmDigits = confirmVal.replace(/\D/g, '');

    if (!params.newPasswordString || params.newPasswordString.length < 6) {
      throw new Error('A nova senha deve possuir no mínimo 6 caracteres.');
    }

    // 1. Tenta buscar em Alunos por CPF ou E-mail
    const { data: student } = await supabase
      .from('alunos')
      .select('*')
      .or(
        username.includes('@')
          ? `email.eq."${username}"`
          : `cpf.eq."${username}",cpf.eq."${cleanedCpfInput}"`
      )
      .maybeSingle();

    if (student) {
      const studentEmail = (student.email || '').trim().toLowerCase();
      const studentPhoneDigits = (student.telefone || '').replace(/\D/g, '');
      const studentCpfDigits = (student.cpf || '').replace(/\D/g, '');

      // Confirma se e-mail ou telefone informado bate com o aluno
      const matchesEmail = studentEmail && studentEmail === confirmVal;
      const matchesPhone = studentPhoneDigits && cleanConfirmDigits && studentPhoneDigits.endsWith(cleanConfirmDigits);
      const matchesCpf = studentCpfDigits && cleanConfirmDigits && studentCpfDigits === cleanConfirmDigits;

      if (!matchesEmail && !matchesPhone && !matchesCpf) {
        throw new Error('Os dados de confirmação (e-mail ou telefone) não conferem com o cadastro deste aluno.');
      }

      const { error: updateErr } = await supabase
        .from('alunos')
        .update({ senha: params.newPasswordString })
        .eq('id', student.id);

      if (updateErr) {
        throw new Error(`Erro ao redefinir senha do aluno: ${updateErr.message}`);
      }

      return { message: 'Senha do aluno redefinida com sucesso!' };
    }

    // 2. Tenta buscar em Professores por E-mail
    if (username.includes('@')) {
      const { data: prof } = await supabase
        .from('professores')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (prof) {
        const profEmail = (prof.email || '').trim().toLowerCase();
        const profPhoneDigits = (prof.telefone || '').replace(/\D/g, '');

        const matchesEmail = profEmail && profEmail === confirmVal;
        const matchesPhone = profPhoneDigits && cleanConfirmDigits && profPhoneDigits.endsWith(cleanConfirmDigits);

        if (!matchesEmail && !matchesPhone) {
          throw new Error('Os dados de confirmação não conferem com o cadastro deste professor.');
        }

        const { error: updateErr } = await supabase
          .from('professores')
          .update({ senha: params.newPasswordString })
          .eq('id', prof.id);

        if (updateErr) {
          throw new Error(`Erro ao redefinir senha do professor: ${updateErr.message}`);
        }

        return { message: 'Senha do professor redefinida com sucesso!' };
      }

      // 3. Tenta buscar em Administradores por E-mail
      const { data: admin } = await supabase
        .from('administradores')
        .select('*')
        .eq('email', username)
        .maybeSingle();

      if (admin) {
        const adminEmail = (admin.email || '').trim().toLowerCase();
        if (adminEmail !== confirmVal) {
          throw new Error('O e-mail de confirmação não confere com o administrador.');
        }

        const { error: updateErr } = await supabase
          .from('administradores')
          .update({ senha: params.newPasswordString })
          .eq('id', admin.id);

        if (updateErr) {
          throw new Error(`Erro ao redefinir senha do administrador: ${updateErr.message}`);
        }

        return { message: 'Senha de administrador redefinida com sucesso!' };
      }
    }

    throw new Error('Usuário não encontrado. Verifique o CPF ou E-mail informado.');
  }
}

export const authService = new AuthService();
export default authService;
