import type { Belt, Degree } from './student';

export type EligibilityStatus = 'Apto' | 'Em andamento' | 'Requisitos pendentes';

export interface GraduationRequirementStatus {
  id: string;
  label: string;
  cumprido: boolean;
  detalhe: string; // Ex: "12/24 meses cumpridos", "45/50 aulas assistidas", "85%/75% de frequência"
  obrigatorio: boolean;
}

export interface GraduationEligibility {
  alunoId: number;
  status: EligibilityStatus;
  percentualEvolucao: number; // 0 a 100
  dataEstimadaProximaGraduacao: string; // YYYY-MM-DD
  proximaFaixa: Belt;
  proximoGrau: Degree;
  requisitos: GraduationRequirementStatus[];
  motivosPendentes: string[];
  totalTreinos: number;
  frequenciaPercentual: number;
  checkinsMesAtual: number;
  tempoAcademiaMeses: number;
  tempoFaixaAtualMeses: number;
  ultimaPresencaData: string | null;
  competicoesContador: number;
}

export interface GraduationRule {
  faixa: Belt;
  idadeMinimaAnos: number;
  tempoMinimoMeses: number;
  quantidadeMinimaAulas: number;
  frequenciaMinimaPercentual: number;
  maxGraus: number;
  faixasAnterioresPermitidas: Belt[];
}

export interface GraduationHistoryEvent {
  id: number;
  alunoId: number;
  faixa: Belt;
  graus: Degree;
  dataGraduacao: string; // YYYY-MM-DD
  professorId?: number | null;
  professorNome: string;
  observacoes?: string;
  usuarioLancamento: string;
  codigoValidacaoQr?: string;
  created_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
  
  // Métricas agregadas da timeline
  tempoNaFaixaMeses?: number;
  tempoDesdeUltimaGraduacaoFriendly?: string;
  grausAcumulados?: number;
}

export interface GraduationDashboardMetrics {
  totalAlunos: number;
  alunosAptos: number;
  alunosProximos: number; // >= 75% evolução
  alunosComPendencias: number;
  distribuicaoPorFaixa: Record<Belt, number>;
  distribuicaoPorIdade: {
    kidsCount: number; // < 16 anos
    adultoCount: number; // 16-29 anos
    masterCount: number; // >= 30 anos
  };
  distribuicaoPorCategoria: Record<string, number>;
}

export interface AuditLogRecord {
  id?: number;
  entidade: string;
  entidadeId: number;
  acao: 'INSERT' | 'UPDATE' | 'DELETE' | 'PROMOTE';
  usuario: string;
  ip?: string;
  valoresAnteriores?: Record<string, any> | null;
  valoresNovos?: Record<string, any> | null;
  created_at?: string;
}
