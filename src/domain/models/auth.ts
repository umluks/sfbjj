export interface LoggedUser {
  role: 'admin' | 'student' | 'teacher';
  alunoId?: number;
  professorId?: number;
  adminId?: number;
  nome: string;
  email?: string;
  telefone?: string;
  foto_perfil?: string;
  assinatura?: string;
}
