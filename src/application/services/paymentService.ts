import { PaymentRepository } from '@/infrastructure/repositories/paymentRepository';
import type { Pagamento } from '@/domain/models/payment';

export class PaymentService {
  private paymentRepo = new PaymentRepository();

  async registerPaymentWithDate(paymentId: number, dateStr: string, valor: number): Promise<void> {
    return this.paymentRepo.registerPaymentWithDate(paymentId, dateStr, valor);
  }

  async registerPaidDirectly(alunoId: number, mesRef: string, valor: number, dateStr: string): Promise<Pagamento> {
    return this.paymentRepo.registerPaidDirectly(alunoId, mesRef, valor, dateStr);
  }

  async removePayment(paymentId: number): Promise<void> {
    return this.paymentRepo.removePayment(paymentId);
  }

  async clearPaymentsByYear(year: string): Promise<void> {
    return this.paymentRepo.clearPaymentsByYear(year);
  }

  async savePaymentsBatch(payments: any[]): Promise<void> {
    return this.paymentRepo.savePaymentsBatch(payments);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
