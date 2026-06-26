/**
 * Formata uma string de CPF para o padrão 000.000.000-00.
 */
export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '') // Remove caracteres não numéricos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

/**
 * Formata uma string de telefone para os padrões (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.
 */
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

/**
 * Converte uma data de YYYY-MM-DD para DD/MM/YYYY.
 * Se já contiver barra ou for inválida, retorna o valor original.
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

/**
 * Formata data para exibir apenas mês/ano (MM/AAAA).
 */
export const formatMonthYear = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  if (dateStr.includes('/')) {
    const p = dateStr.split('/');
    if (p.length >= 2) return `${p[1]}/${p[p.length - 1]}`;
  }
  return dateStr;
};
