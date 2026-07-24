import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LoggedUser } from '@/domain/models/auth';
import { authService } from '@/application/services/authService';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => {
    const saved = sessionStorage.getItem('sfbjj_logged_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (identifier: string, passwordString: string): Promise<LoggedUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(identifier, passwordString);
      sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(user));
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
    sessionStorage.removeItem('sfbjj_logged_user');
    setLoggedUser(null);
    setError(null);
  }, []);

  const updateLoggedUser = useCallback((user: LoggedUser | null) => {
    if (user) {
      sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('sfbjj_logged_user');
    }
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
