import type { Pagamento } from '../models/payment';

export interface IPaymentRepository {
  registerPaymentWithDate(paymentId: number, dateStr: string, valor: number): Promise<void>;
  registerPaidDirectly(alunoId: number, mesRef: string, valor: number, dateStr: string): Promise<Pagamento>;
  removePayment(paymentId: number): Promise<void>;
  clearPaymentsByYear(year: string): Promise<void>;
  savePaymentsBatch(payments: any[]): Promise<void>;
}
