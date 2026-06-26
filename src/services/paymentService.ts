import { supabase } from '../lib/supabase';
import type { PaymentStatus } from '../types';

export const paymentService = {
  /**
   * Registra a quitação de uma fatura existente com data e valor específicos.
   */
  async registerPaymentWithDate(
    paymentId: number,
    dateStr: string,
    valor: number
  ): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .update({
        valor,
        status: 'Pago',
        dataPagamento: dateStr
      })
      .eq('id', paymentId);

    if (error) {
      console.error(`Error registering payment ${paymentId}:`, error);
      throw new Error(`Erro ao registrar quitação no banco: ${error.message}`);
    }
  },

  /**
   * Cria um novo registro de pagamento já marcado como "Pago" diretamente.
   */
  async registerPaidDirectly(
    alunoId: number,
    mesRef: string,
    valor: number,
    dateStr: string
  ): Promise<any> {
    const newPayment = {
      alunoId,
      mesRef,
      valor,
      status: 'Pago' as PaymentStatus,
      dataVencimento: dateStr,
      dataPagamento: dateStr
    };

    const { data, error } = await supabase
      .from('pagamentos')
      .insert(newPayment)
      .select()
      .single();

    if (error) {
      console.error('Error creating paid payment:', error);
      throw new Error(`Erro ao criar pagamento direto no banco: ${error.message}`);
    }
    return data;
  },

  /**
   * Remove/estorna um pagamento.
   */
  async removePayment(paymentId: number): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw new Error(`Erro ao remover pagamento do banco: ${error.message}`);
    }
  },

  /**
   * Zera todos os pagamentos vinculados a um determinado ano de referência.
   * Usado como preparação para importação limpa de CSV.
   */
  async clearPaymentsByYear(year: string): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .like('mesRef', `%/${year}`);

    if (error) {
      console.error(`Error clearing payments for year ${year}:`, error);
      throw new Error(`Erro ao limpar pagamentos do ano ${year} no banco: ${error.message}`);
    }
  },

  /**
   * Faz a persistência de múltiplos pagamentos de uma vez (upsert/insert lote).
   */
  async savePaymentsBatch(payments: any[]): Promise<void> {
    const { error } = await supabase
      .from('pagamentos')
      .upsert(payments);

    if (error) {
      console.error('Error batch saving payments:', error);
      throw new Error(`Erro ao salvar pagamentos em lote no banco: ${error.message}`);
    }
  }
};
