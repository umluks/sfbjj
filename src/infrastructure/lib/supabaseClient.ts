import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As credenciais do Supabase não foram encontradas no arquivo .env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mecanismo de Cache Local Simples para suporte Offline e Performance
export const cache = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`sfbjj_cache_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      // Expira cache se tiver mais de 5 minutos (300000 ms) para consultas normais
      if (Date.now() - parsed.timestamp > 300000) {
        return parsed.data as T; // Retorna mesmo expirado se necessário, mas idealmente revalida
      }
      return parsed.data as T;
    } catch {
      return null;
    }
  },
  getFresh: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`sfbjj_cache_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > 300000) {
        return null; // Expirado para dados estritamente frescos
      }
      return parsed.data as T;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(`sfbjj_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Erro ao salvar no cache local:', e);
    }
  },
  clear: (key: string): void => {
    localStorage.removeItem(`sfbjj_cache_${key}`);
  },
  clearByPrefix: (prefix: string): void => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`sfbjj_cache_${prefix}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Erro ao limpar cache por prefixo:', e);
    }
  }
};

export default supabase;
