/**
 * Utilitários de Máscaras e Formatação para Formulários Mobile First
 */

export const maskCpf = (val: string): string => {
  let raw = val.replace(/\D/g, '');
  if (raw.length > 11) raw = raw.substring(0, 11);
  if (raw.length > 9) {
    return `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6, 9)}-${raw.substring(9)}`;
  } else if (raw.length > 6) {
    return `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6)}`;
  } else if (raw.length > 3) {
    return `${raw.substring(0, 3)}.${raw.substring(3)}`;
  }
  return raw;
};

export const maskPhone = (val: string): string => {
  let raw = val.replace(/\D/g, '');
  if (raw.length > 11) raw = raw.substring(0, 11);
  if (raw.length > 10) {
    return `(${raw.substring(0, 2)}) ${raw.substring(2, 7)}-${raw.substring(7)}`;
  } else if (raw.length > 6) {
    return `(${raw.substring(0, 2)}) ${raw.substring(2, 6)}-${raw.substring(6)}`;
  } else if (raw.length > 2) {
    return `(${raw.substring(0, 2)}) ${raw.substring(2)}`;
  }
  return raw;
};

export const maskCep = (val: string): string => {
  let raw = val.replace(/\D/g, '');
  if (raw.length > 8) raw = raw.substring(0, 8);
  if (raw.length > 5) {
    return `${raw.substring(0, 5)}-${raw.substring(5)}`;
  }
  return raw;
};

export const validateCpf = (cpf: string): boolean => {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
};
