// Contexto de Autenticação EDP - Gerenciamento de Estado
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPermissions, AuthContextType } from '@/types/auth';
import { authAPI } from '@/services/api';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialização - verifica se existe token salvo
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('edp_token');
      
      if (savedToken) {
        try {
          setToken(savedToken);
          
          // Verifica se o token ainda é válido obtendo dados do usuário
          const [userData, userPermissions] = await Promise.all([
            authAPI.getCurrentUser(),
            authAPI.getUserPermissions()
          ]);
          
          setUser(userData);
          setPermissions(userPermissions);
        } catch (error) {
          // Token inválido ou expirado, limpa tudo
          console.warn('Token inválido, fazendo logout:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    // Listener para falhas de autenticação (usuário bloqueado, token expirado)
    const handleAuthFailure = () => {
      logout();
    };

    window.addEventListener('auth-failure', handleAuthFailure);
    initializeAuth();

    return () => {
      window.removeEventListener('auth-failure', handleAuthFailure);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login({ username, senha: password });
      
      // Define os dados do usuário autenticado
      setToken(response.token);
      setUser(response.user);
      
      // Busca as permissões do usuário
      const userPermissions = await authAPI.getUserPermissions();
      setPermissions(userPermissions);
      
      // Salva o token no localStorage
      localStorage.setItem('edp_token', response.token);
      
    } catch (error) {
      // Limpa qualquer estado parcial em caso de erro
      logout();
      throw error; // Re-lança o erro para o componente tratar
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Limpa todos os dados de autenticação
    setUser(null);
    setToken(null);
    setPermissions(null);
    
    // Remove token do localStorage
    localStorage.removeItem('edp_token');
    
    // Notifica o serviço de API
    authAPI.logout();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;