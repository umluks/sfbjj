import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { IPaymentRepository } from '@/domain/repositories/paymentRepository';
import type { Pagamento } from '@/domain/models/payment';
import { handleSupabaseError } from './errorHelper';

export class PaymentRepository implements IPaymentRepository {
  private clearCache(studentId?: number): void {
    cache.clear('students');
    if (studentId) {
      cache.clear(`student_${studentId}`);
    } else {
      cache.clearByPrefix('student_');
    }
  }

  async registerPaymentWithDate(paymentId: number, dateStr: string, valor: number): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .update({
        valor,
        status: 'Pago',
        dataPagamento: dateStr
      })
      .eq('id', paymentId);

    if (error) {
      throw handleSupabaseError(error, `Erro ao registrar quitação no banco: ${error.message}`);
    }
    this.clearCache();
  }

  async registerPaidDirectly(alunoId: number, mesRef: string, valor: number, dateStr: string): Promise<Pagamento> {
    const newPayment = {
      alunoId,
      mesRef,
      valor,
      status: 'Pago',
      dataVencimento: dateStr,
      dataPagamento: dateStr
    };

    const { data, error } = await supabase
      .from('pagamentos')
      .insert(newPayment)
      .select()
      .single();

    if (error) {
      throw handleSupabaseError(error, `Erro ao criar pagamento direto no banco: ${error.message}`);
    }
    this.clearCache(alunoId);
    return data;
  }

  async removePayment(paymentId: number): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('id', paymentId);

    if (error) {
      throw handleSupabaseError(error, `Erro ao remover pagamento do banco: ${error.message}`);
    }
    this.clearCache();
  }

  async clearPaymentsByYear(year: string): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .like('mesRef', `%/${year}`);

    if (error) {
      throw handleSupabaseError(error, `Erro ao limpar pagamentos do ano ${year} no banco: ${error.message}`);
    }
    this.clearCache();
  }

  async savePaymentsBatch(payments: any[]): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .upsert(payments);

    if (error) {
      throw handleSupabaseError(error, `Erro ao salvar pagamentos em lote no banco: ${error.message}`);
    }
    this.clearCache();
  }
}
