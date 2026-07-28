export interface AppNotification {
  id: number;
  aluno_id: number;
  titulo: string;
  mensagem: string;
  tipo: 'posicao_aprovada' | 'posicao_rejeitada' | 'info';
  lida: boolean;
  tecnica_id?: number;
  created_at?: string;
}
