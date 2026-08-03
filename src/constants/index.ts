import type { Belt, GraduacaoHistorico } from '@/domain/models/student';

export const BELT_RANKS: Record<Belt, number> = {
  'Branca': 1,
  // Infantis
  'Cinza e branca': 2,
  'Cinza': 3,
  'Cinza e preta': 4,
  'Amarela e branca': 5,
  'Amarela': 6,
  'Amarela e preta': 7,
  'Laranja e branca': 8,
  'Laranja': 9,
  'Laranja e preta': 10,
  'Verde e branca': 11,
  'Verde': 12,
  'Verde e preta': 13,
  // Adultos
  'Azul': 14,
  'Roxa': 15,
  'Marrom': 16,
  'Preta': 17,
  'Vermelha e preta': 18,
  'Vermelha e branca': 19,
  'Vermelha': 20
};

/**
 * Retorna o nível de hierarquia numérica de uma faixa (1 a 20).
 * Faz busca insensível a maiúsculas/minúsculas.
 */
export const getBeltRank = (faixa?: string): number => {
  if (!faixa) return 0;
  const norm = faixa.trim().toLowerCase();
  for (const [key, val] of Object.entries(BELT_RANKS)) {
    if (key.toLowerCase() === norm) return val;
  }
  return 0;
};

import { parseSafeDate } from '@/utils/formatters';

export const getTimeFromDateStr = (dateStr?: string): number => {
  if (!dateStr) return 0;
  return parseSafeDate(dateStr).getTime();
};

export const getYearMonthFromDateStr = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const d = parseSafeDate(dateStr);
  return d.getFullYear() * 12 + d.getMonth();
};

/**
 * Ordena registros de graduação em ordem DECRESCENTE (mais recente/mais alta primeiro).
 * Critérios de desempate:
 * 1. Ano e Mês da graduação (Mês mais recente primeiro)
 * 2. Hierarquia da Faixa (Maior faixa primeiro)
 * 3. Quantidade de Graus (Maior grau primeiro)
 * 4. Data exata / Timestamp
 * 5. ID do registro (Registro inserido por último primeiro)
 */
export const getEventDateStr = (item: any): string => {
  return item?.dataGraduacao || item?.data || '';
};

/**
 * Ordena registros de graduação em ordem DECRESCENTE (mais recente/mais alta primeiro).
 * Critérios de desempate:
 * 1. Ano e Mês da graduação (Mês mais recente primeiro)
 * 2. Hierarquia da Faixa (Maior faixa primeiro)
 * 3. Quantidade de Graus (Maior grau primeiro)
 * 4. Data exata / Timestamp
 * 5. ID do registro (Registro inserido por último primeiro)
 */
export const sortGraduacoesDesc = (
  a: any,
  b: any
): number => {
  const dateA = getEventDateStr(a);
  const dateB = getEventDateStr(b);

  const ymA = getYearMonthFromDateStr(dateA);
  const ymB = getYearMonthFromDateStr(dateB);
  if (ymA !== ymB) {
    return ymB - ymA;
  }

  const rankA = getBeltRank(a.faixa);
  const rankB = getBeltRank(b.faixa);
  if (rankA !== rankB) {
    return rankB - rankA;
  }

  const grauA = Number(a.graus) || 0;
  const grauB = Number(b.graus) || 0;
  if (grauA !== grauB) {
    return grauB - grauA;
  }

  const timeA = getTimeFromDateStr(dateA);
  const timeB = getTimeFromDateStr(dateB);
  if (timeA !== timeB) {
    return timeB - timeA;
  }

  const idA = typeof a.id === 'number' ? a.id : 0;
  const idB = typeof b.id === 'number' ? b.id : 0;
  return idB - idA;
};

/**
 * Retorna a maior graduação (faixa mais alta e maior grau) conquistada de um histórico.
 */
export const getHighestGraduacao = (
  history?: any[]
): any | null => {
  if (!history || history.length === 0) return null;
  const sorted = [...history].sort(sortGraduacoesDesc);
  return sorted[0];
};

/**
 * Ordena registros de graduação em ordem CRESCENTE (mais antiga/mais baixa primeiro).
 */
export const sortGraduacoesAsc = (
  a: Partial<GraduacaoHistorico>,
  b: Partial<GraduacaoHistorico>
): number => {
  return sortGraduacoesDesc(b, a);
};

export const BAIRROS_DF = [
  'Água Quente',
  'Águas Claras',
  'Arapoanga',
  'Arniqueira',
  'Asa Norte',
  'Asa Sul',
  'Brazlândia',
  'Candangolândia',
  'Ceilândia',
  'Cruzeiro',
  'Fercal',
  'Gama',
  'Guará',
  'Itapoã',
  'Jardim Botânico',
  'Lago Norte',
  'Lago Sul',
  'Núcleo Bandeirante',
  'Paranoá',
  'Park Way',
  'Planaltina',
  'Plano Piloto',
  'Recanto das Emas',
  'Riacho Fundo I',
  'Riacho Fundo II',
  'Samambaia',
  'Santa Maria',
  'São Sebastião',
  'SCIA (Estrutural)',
  'SIA',
  'Sobradinho I',
  'Sobradinho II',
  'Sol Nascente/Pôr do Sol',
  'Sudoeste / Octogonal',
  'Taguatinga',
  'Varjão',
  'Vicente Pires'
];
