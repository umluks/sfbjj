import { createClient } from '@supabase/supabase-js';
import { tokenService } from '@/infrastructure/auth/tokenService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As credenciais do Supabase não foram encontradas no arquivo .env.');
}

/**
 * Interceptador HTTP Customizado (`customFetch`)
 * 1. Anexa o Access Token (`Authorization: Bearer <token>`) a todas as requisições ativas.
 * 2. Em caso de resposta 401 Unauthorized, renova o token automaticamente e re-executa a chamada original.
 */
const customFetch: typeof fetch = async (input, init) => {
  // Garantir que o objeto RequestInit exista com headers manipulaveis
  const requestHeaders = new Headers(init?.headers);

  // Se nao possuir token de acesso valido mas possuir Refresh Token, tenta renovar proativamente antes da requisicao
  if (!tokenService.isAccessTokenValid() && tokenService.getRefreshToken()) {
    await tokenService.refreshToken();
  }

  const currentToken = tokenService.getAccessToken();
  if (currentToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${currentToken}`);
  }

  const modifiedInit: RequestInit = {
    ...init,
    headers: requestHeaders
  };

  // Executa a requisição HTTP original
  let response = await fetch(input, modifiedInit);

  // Interceptador para tratar respostas 401 Unauthorized
  if (response.status === 401) {
    console.warn('[HTTP Interceptor] Recebido 401 Unauthorized. Iniciando renovação automática de token...');

    const newSession = await tokenService.refreshToken();
    if (newSession && newSession.accessToken) {
      console.log('[HTTP Interceptor] Token renovado com sucesso. Repetindo requisição original...');
      const retriedHeaders = new Headers(init?.headers);
      retriedHeaders.set('Authorization', `Bearer ${newSession.accessToken}`);

      const retriedInit: RequestInit = {
        ...init,
        headers: retriedHeaders
      };

      response = await fetch(input, retriedInit);
    } else {
      console.error('[HTTP Interceptor] Falha ao renovar token. Encerrando sessão do usuário...');
    }
  }

  return response;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});

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
      // Sanitiza dados antes de salvar no cache se forem listas grandes com base64
      let cleanData = data;
      if (Array.isArray(data)) {
        cleanData = data.map((item: Record<string, unknown>) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (typeof copy.fotoPerfil === 'string' && (copy.fotoPerfil.startsWith('data:') || copy.fotoPerfil.length > 500)) {
              delete copy.fotoPerfil;
            }
            if (typeof copy.foto_perfil === 'string' && (copy.foto_perfil.startsWith('data:') || copy.foto_perfil.length > 500)) {
              delete copy.foto_perfil;
            }
            if (typeof copy.assinatura === 'string' && (copy.assinatura.startsWith('data:') || copy.assinatura.length > 500)) {
              delete copy.assinatura;
            }
            return copy;
          }
          return item;
        }) as unknown as T;
      }

      localStorage.setItem(`sfbjj_cache_${key}`, JSON.stringify({
        data: cleanData,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Erro ao salvar no cache local. Limpando caches antigos...', e);
      try {
        cache.clearByPrefix('');
        localStorage.setItem(`sfbjj_cache_${key}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (err2) {
        console.warn('Não foi possível gravar no cache local devido à cota de armazenamento.', err2);
      }
    }
  },
  clear: (key: string): void => {
    try {
      localStorage.removeItem(`sfbjj_cache_${key}`);
    } catch (e) {
      console.warn('Erro ao remover chave do cache:', e);
    }
  },
  clearByPrefix: (prefix: string = ''): void => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (prefix === '' || key.startsWith(`sfbjj_cache_${prefix}`))) {
          if (key.startsWith('sfbjj_cache_')) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Erro ao limpar cache por prefixo:', e);
    }
  }
};

export default supabase;
