/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { LoggedUser } from '@/domain/models/auth';
import { authService } from '@/application/services/authService';
import { tokenService } from '@/infrastructure/auth/tokenService';

interface AuthContextType {
  loggedUser: LoggedUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (identifier: string, passwordString: string) => Promise<LoggedUser>;
  logout: () => void;
  setLoggedUser: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
  updateLoggedUser: (user: LoggedUser | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    authService.logout();
    setLoggedUser(null);
    setError(null);
  }, []);

  // 1. Restauração inicial da sessão ao carregar o aplicativo (F5 / PWA Boot)
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const restoredUser = await authService.restoreSession();
        if (isMounted) {
          setLoggedUser(restoredUser);
        }
      } catch (err) {
        console.warn('[AuthContext] Falha ao restaurar sessão inicial:', err);
        if (isMounted) {
          setLoggedUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }
    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Escuta notificação de expiração forçada da sessão via interceptador HTTP 401
  useEffect(() => {
    const unsubscribe = tokenService.onSessionExpired(() => {
      console.warn('[AuthContext] Sessão encerrada forçadamente devido à expiração do Refresh Token.');
      logout();
    });
    return () => {
      unsubscribe();
    };
  }, [logout]);

  const login = useCallback(async (identifier: string, passwordString: string): Promise<LoggedUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(identifier, passwordString);
      setLoggedUser(user);
      return user;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao autenticar.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLoggedUser = useCallback((user: LoggedUser | null) => {
    if (user) {
      tokenService.saveSession(user);
    } else {
      tokenService.clearSession();
    }
    setLoggedUser(user);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Valida se o aluno logado permanece ativo no banco de dados
  useEffect(() => {
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
        isInitializing,
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
