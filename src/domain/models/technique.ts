export interface Technique {
  id: number;
  titulo: string;
  descricao: string;
  categoria: 'Kids' | 'Adulto' | 'Geral';
  classificacao: 'Guarda' | 'Passagem' | 'Raspagem' | 'Finalização' | 'Queda' | 'Defesa' | 'Outros';
  video_url?: string;
  created_at?: string;
}
