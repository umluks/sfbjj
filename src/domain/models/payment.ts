export type PaymentStatus = 'Pago' | 'Pendente' | 'Atrasado';

export interface Pagamento {
  id: number;
  alunoId?: number;
  mesRef: string; // ex: "Maio/2026"
  valor: number;
  status: PaymentStatus;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento: string | null; // YYYY-MM-DD
}
