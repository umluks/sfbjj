import type { LoggedUser } from '@/domain/models/auth';

const REFRESH_TOKEN_COOKIE_KEY = 'sfbjj_refresh_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sfbjj_refresh_token_data';
const USER_CACHE_STORAGE_KEY = 'sfbjj_logged_user';

// Duracoes padrao
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos (Access Token)
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 dias (Refresh Token)

export interface TokenSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  user: LoggedUser;
}

interface StoredRefreshTokenData {
  refreshToken: string;
  expiresAt: number;
  user: LoggedUser;
}

// Armazenamento em memoria para o Access Token (Pratica recomendada de seguranca)
let currentAccessToken: string | null = null;
let accessTokenExpiresAt: number = 0;
let currentUserPayload: LoggedUser | null = null;

// Controle de concorrencia (Mutex Lock / Request Queue) para renovacao de token
let isRefreshing = false;
let refreshPromise: Promise<TokenSession | null> | null = null;
let sessionExpiredCallbacks: Array<() => void> = [];

/**
 * Utilitarios de manipulação de Cookies de forma segura.
 */
const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  try {
    const isSecure = window.location.protocol === 'https:';
    const sameSite = 'SameSite=Strict';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; ${sameSite}${secureFlag}`;
  } catch (e) {
    console.warn('Falha ao gravar cookie seguro:', e);
  }
};

const getCookie = (name: string): string | null => {
  try {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  } catch (e) {
    console.warn('Falha ao ler cookie:', e);
  }
  return null;
};

const eraseCookie = (name: string) => {
  try {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
  } catch (e) {
    console.warn('Falha ao remover cookie:', e);
  }
};

/**
 * Remove dados sensíveis ou pesados (como base64 Data URLs) do objeto de usuário antes da persistência.
 */
export const sanitizeUserForStorage = (user: LoggedUser): LoggedUser => {
  const sanitized = { ...user };
  if (sanitized.foto_perfil && (sanitized.foto_perfil.startsWith('data:') || sanitized.foto_perfil.length > 500)) {
    delete sanitized.foto_perfil;
  }
  if (sanitized.assinatura && (sanitized.assinatura.startsWith('data:') || sanitized.assinatura.length > 500)) {
    delete sanitized.assinatura;
  }
  return sanitized;
};

/**
 * Gera um token sintético seguro (base64url + timestamp + UUID random).
 */
const generateSecureToken = (prefix: string): string => {
  const randomBytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${Date.now()}_${hex}`;
};

export class TokenService {
  /**
   * Registra um callback para ser notificado quando a sessão for forçadamente encerrada (ex: refresh token expirado).
   */
  onSessionExpired(callback: () => void): () => void {
    sessionExpiredCallbacks.push(callback);
    return () => {
      sessionExpiredCallbacks = sessionExpiredCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifySessionExpired() {
    sessionExpiredCallbacks.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Erro ao executar callback de sessao expirada:', err);
      }
    });
  }

  /**
   * Obtem o Access Token atual se ainda estiver valido.
   */
  getAccessToken(): string | null {
    if (currentAccessToken && Date.now() < accessTokenExpiresAt) {
      return currentAccessToken;
    }
    return null;
  }

  /**
   * Retorna os dados do usuario ativo em memoria.
   */
  getCurrentUser(): LoggedUser | null {
    return currentUserPayload;
  }

  /**
   * Verifica se o Access Token esta valido.
   */
  isAccessTokenValid(): boolean {
    return !!currentAccessToken && Date.now() < accessTokenExpiresAt;
  }

  /**
   * Recupera o Refresh Token armazenado em Cookie ou localStorage.
   */
  getRefreshToken(): string | null {
    // 1. Tenta buscar do cookie
    const tokenFromCookie = getCookie(REFRESH_TOKEN_COOKIE_KEY);
    if (tokenFromCookie) return tokenFromCookie;

    // 2. Fallback para localStorage
    try {
      const storedStr = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (storedStr) {
        const parsed: StoredRefreshTokenData = JSON.parse(storedStr);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed.refreshToken;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler Refresh Token do armazenamento local:', e);
    }

    return null;
  }

  /**
   * Cria e armazena uma nova sessao com Access Token (memoria) e Refresh Token (Cookie + Storage).
   */
  saveSession(user: LoggedUser): TokenSession {
    const now = Date.now();
    const sanitized = sanitizeUserForStorage(user);

    const accessToken = generateSecureToken('at');
    const refreshToken = generateSecureToken('rt');
    const atExpiresAt = now + ACCESS_TOKEN_TTL_MS;
    const rtExpiresAt = now + REFRESH_TOKEN_TTL_MS;

    currentAccessToken = accessToken;
    accessTokenExpiresAt = atExpiresAt;
    currentUserPayload = sanitized;

    // 1. Salvar Refresh Token em Cookie seguro
    const maxAgeSec = Math.floor(REFRESH_TOKEN_TTL_MS / 1000);
    setCookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, maxAgeSec);

    // 2. Salvar backup no localStorage
    const storedData: StoredRefreshTokenData = {
      refreshToken,
      expiresAt: rtExpiresAt,
      user: sanitized
    };

    try {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, JSON.stringify(storedData));
      localStorage.setItem(USER_CACHE_STORAGE_KEY, JSON.stringify({ user: sanitized, expiresAt: rtExpiresAt }));
    } catch (e) {
      console.warn('Falha ao salvar Refresh Token no localStorage. Tentando sessionStorage...', e);
      try {
        sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, JSON.stringify(storedData));
        sessionStorage.setItem(USER_CACHE_STORAGE_KEY, JSON.stringify({ user: sanitized, expiresAt: rtExpiresAt }));
      } catch (err2) {
        console.error('Nao foi possivel armazenar a sessao no navegador:', err2);
      }
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: atExpiresAt,
      refreshTokenExpiresAt: rtExpiresAt,
      user: sanitized
    };
  }

  /**
   * Renova o Access Token utilizando o Refresh Token com protecao de concorrencia (Mutex Lock).
   * Se multiplas chamadas invocarem refreshToken() simultaneamente, todas aguardarao a mesma Promise.
   */
  async refreshToken(): Promise<TokenSession | null> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async (): Promise<TokenSession | null> => {
      try {
        const existingRt = this.getRefreshToken();
        if (!existingRt) {
          console.warn('[TokenService] Nao ha Refresh Token valido disponivel.');
          this.clearSession();
          this.notifySessionExpired();
          return null;
        }

        // Tenta recuperar o usuario associado ao token do armazenamento local
        let userToRestore = currentUserPayload;
        if (!userToRestore) {
          try {
            const storedStr = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
            if (storedStr) {
              const parsed: StoredRefreshTokenData = JSON.parse(storedStr);
              if (parsed.user) {
                userToRestore = parsed.user;
              }
            }
          } catch (e) {
            console.warn('Erro ao ler usuario para restaurar token:', e);
          }
        }

        if (!userToRestore) {
          console.warn('[TokenService] Impossivel restaurar usuario durante renovacao de token.');
          this.clearSession();
          this.notifySessionExpired();
          return null;
        }

        // Gera novo par de tokens (Rotacao transparente de token)
        const newSession = this.saveSession(userToRestore);
        return newSession;
      } catch (err) {
        console.error('[TokenService] Erro ao renovar token de acesso:', err);
        this.clearSession();
        this.notifySessionExpired();
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * Restaura a sessao na inicialização da aplicação (F5 / PWA Boot).
   * Retorna o usuario logado se a sessao for valida ou puder ser renovada.
   */
  async restoreSession(): Promise<LoggedUser | null> {
    // 1. Se o Access Token ja esta valido em memoria
    if (this.isAccessTokenValid() && currentUserPayload) {
      return currentUserPayload;
    }

    // 2. Se ha um Refresh Token valido, realiza a renovacao transparente
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      const session = await this.refreshToken();
      if (session) {
        return session.user;
      }
    }

    // 3. Nao foi possivel restaurar
    this.clearSession();
    return null;
  }

  /**
   * Realiza o encerramento seguro da sessão (Logout).
   * Limpa cookies, memoria e armazenamentos locais.
   */
  clearSession(): void {
    currentAccessToken = null;
    accessTokenExpiresAt = 0;
    currentUserPayload = null;

    eraseCookie(REFRESH_TOKEN_COOKIE_KEY);

    try {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_CACHE_STORAGE_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_CACHE_STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao remover dados de sessao da storage:', e);
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;
