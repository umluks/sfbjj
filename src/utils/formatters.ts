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

/**
 * Faz o parsing de string de data em diversos formatos para objeto Date.
 */
export const parseSafeDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, 15);
  }
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  return new Date(dateStr);
};

/**
 * Retorna uma string descritiva amigável do intervalo entre duas datas de graduação.
 */
export const getDurationFriendly = (startDateStr: string, endDateStr: string): string => {
  const start = parseSafeDate(startDateStr);
  const end = parseSafeDate(endDateStr);
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  const days = end.getDate() - start.getDate();
  
  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  if (years < 0 || (years === 0 && months === 0)) {
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return 'Menos de 1 mês';
    return '1 mês';
  }
  
  const parts: string[] = [];
  if (years > 0) {
    parts.push(years === 1 ? '1 ano' : `${years} anos`);
  }
  if (months > 0) {
    parts.push(months === 1 ? '1 mês' : `${months} meses`);
  }
  
  return parts.join(' e ');
};

