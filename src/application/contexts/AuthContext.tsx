import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LoggedUser } from '@/domain/models/auth';
import { authService } from '@/application/services/authService';
import { cache } from '@/infrastructure/lib/supabaseClient';

interface AuthContextType {
  loggedUser: LoggedUser | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, passwordString: string) => Promise<LoggedUser>;
  logout: () => void;
  setLoggedUser: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
  updateLoggedUser: (user: LoggedUser | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 Horas de inatividade/validade da sessão

interface StoredSession {
  user: LoggedUser;
  expiresAt: number;
}

/**
 * Remove dados pesados (como base64 Data URLs) do objeto de usuário antes de salvar na storage.
 */
const sanitizeUserForStorage = (user: LoggedUser): LoggedUser => {
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
 * Salva o usuário logado no localStorage de forma persistente com tempo de expiração de 8h.
 */
const safeSaveUserToStorage = (user: LoggedUser | null) => {
  if (!user) {
    try {
      localStorage.removeItem('sfbjj_logged_user');
      sessionStorage.removeItem('sfbjj_logged_user');
    } catch (e) {
      console.warn('Erro ao remover sfbjj_logged_user da storage:', e);
    }
    return;
  }

  const storableUser = sanitizeUserForStorage(user);
  const storedSession: StoredSession = {
    user: storableUser,
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  const serialized = JSON.stringify(storedSession);

  try {
    localStorage.setItem('sfbjj_logged_user', serialized);
  } catch (err) {
    console.warn('Falha ao salvar no localStorage. Limpando caches locais e tentando novamente...', err);
    try {
      cache.clearByPrefix('');
      localStorage.setItem('sfbjj_logged_user', serialized);
    } catch (err2) {
      console.warn('Falha no localStorage. Tentando sessionStorage...', err2);
      try {
        sessionStorage.setItem('sfbjj_logged_user', serialized);
      } catch (err3) {
        console.error('Não foi possível persistir a sessão na storage do navegador (o login continuará ativo em memória):', err3);
      }
    }
  }
};

/**
 * Recupera e valida a sessão do usuário salva no armazenamento.
 * Se a sessão tiver expirado (>8 horas), limpa o armazenamento e retorna null.
 */
const getValidUserFromStorage = (): LoggedUser | null => {
  try {
    const savedStr = localStorage.getItem('sfbjj_logged_user') || sessionStorage.getItem('sfbjj_logged_user');
    if (!savedStr) return null;

    const parsed = JSON.parse(savedStr);

    if (parsed && typeof parsed === 'object') {
      if ('user' in parsed && 'expiresAt' in parsed) {
        if (typeof parsed.expiresAt === 'number' && Date.now() > parsed.expiresAt) {
          console.warn('Sessão de usuário expirada. Efetuando logout automático.');
          localStorage.removeItem('sfbjj_logged_user');
          sessionStorage.removeItem('sfbjj_logged_user');
          return null;
        }
        return parsed.user as LoggedUser;
      }
      return parsed as LoggedUser;
    }
    return null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => getValidUserFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (identifier: string, passwordString: string): Promise<LoggedUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(identifier, passwordString);
      safeSaveUserToStorage(user);
      setLoggedUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    safeSaveUserToStorage(null);
    setLoggedUser(null);
    setError(null);
  }, []);

  const updateLoggedUser = useCallback((user: LoggedUser | null) => {
    safeSaveUserToStorage(user);
    setLoggedUser(user);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Valida se o aluno logado permanece ativo no banco de dados
  React.useEffect(() => {
    if (loggedUser && loggedUser.role === 'student' && loggedUser.alunoId) {
      authService.checkStudentActive(loggedUser.alunoId).then((isActive) => {
        if (!isActive) {
          logout();
          alert('Sua matrícula está inativa. O acesso ao sistema foi encerrado. Entre em contato com a administração.');
        }
      });
    }
  }, [loggedUser, logout]);

  return (
    <AuthContext.Provider
      value={{
        loggedUser,
        isLoading,
        error,
        login,
        logout,
        setLoggedUser,
        updateLoggedUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
export default AuthContext;
