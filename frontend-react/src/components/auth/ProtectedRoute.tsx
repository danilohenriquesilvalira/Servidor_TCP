// Componente de Rota Protegida EDP - Controle de Acesso
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Cargo } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRole?: Cargo;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user, permissions } = useAuth();
  const location = useLocation();

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-edp-marine flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edp-electric"></div>
          <div className="text-white font-edp">Verificando acesso...</div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se um papel específico for requerido, verifica se o usuário tem esse papel
  if (requiredRole && user?.cargo !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen bg-edp-marine flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-edp-semantic-red text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-edp-neutral-light mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-edp-neutral-medium">
            Cargo necessário: <span className="font-bold text-edp-electric">{requiredRole}</span><br />
            Seu cargo: <span className="font-bold text-edp-ice">{user?.cargo}</span>
          </p>
        </div>
      </div>
    );
  }

  // Se permissões específicas forem requeridas, verifica se o usuário as possui
  if (requiredPermissions.length > 0 && permissions) {
    const hasAllPermissions = requiredPermissions.every(permission => {
      return (permissions as any)[permission] === true;
    });

    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="min-h-screen bg-edp-marine flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="text-edp-semantic-yellow text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Permissão Insuficiente</h1>
            <p className="text-edp-neutral-light mb-4">
              Você não tem as permissões necessárias para acessar esta funcionalidade.
            </p>
            <div className="text-sm text-edp-neutral-medium">
              <p className="mb-2">Permissões necessárias:</p>
              <ul className="list-disc list-inside text-left">
                {requiredPermissions.map(permission => (
                  <li key={permission} className="text-edp-electric">
                    {permission.replace('can_', '').replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
  }

  // Se passou por todas as verificações, renderiza o componente filho
  return <>{children}</>;
};

export default ProtectedRoute;