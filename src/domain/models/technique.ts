export interface Technique {
  id: number;
  titulo: string;
  descricao: string;
  categoria: 'Kids' | 'Adulto' | 'Geral';
  classificacao: 'Guarda' | 'Passagem' | 'Raspagem' | 'Finalização' | 'Queda' | 'Defesa' | 'Outros';
  video_url?: string;
  status?: 'aprovado' | 'pendente' | 'rejeitado';
  aluno_id?: number;
  aluno_nome?: string;
  feedback_admin?: string;
  validado_por?: string;
  validado_em?: string;
  created_at?: string;
}
