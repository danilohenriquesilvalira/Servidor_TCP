import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notificationCount] = useState(3);
  const [backendStatus] = useState<'active' | 'inactive' | 'failure'>('active');

  // Função para obter o nome da página atual
  const getPageTitle = () => {
    const pathname = location.pathname;
    
    if (pathname.includes('dashboard') || pathname === '/') {
      return 'Dashboard';
    } else if (pathname.includes('eclusa') || pathname.includes('caldeira-eclusa')) {
      return 'Eclusa';
    } else if (pathname.includes('porta_jusante')) {
      return 'Porta Jusante';
    } else if (pathname.includes('porta_montante')) {
      return 'Porta Montante';
    } else if (pathname.includes('enchimento')) {
      return 'Enchimento';
    } else if (pathname.includes('usuarios')) {
      return 'Usuários';
    } else {
      return 'Dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBackendStatusColor = () => {
    switch (backendStatus) {
      case 'active':
        return '#28FF52';
      case 'inactive':
        return '#90A5A8';
      case 'failure':
        return '#E32C2C';
      default:
        return '#90A5A8';
    }
  };

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'active':
        return 'Sistema Online';
      case 'inactive':
        return 'Sistema Inativo';
      case 'failure':
        return 'Falha de Conexão';
      default:
        return 'Status Desconhecido';
    }
  };

  return (
    <header className="h-16 bg-edp-neutral-white-wash border-b border-edp-neutral-lighter px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-20">
      
      {/* Nome da Página */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-edp font-bold text-edp-neutral-darkest">
        {getPageTitle()}
      </h1>

      {/* Actions Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Connection Status Icon */}
        <button
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-edp-neutral-dark hover:text-edp-electric hover:bg-edp-electric/10 rounded-lg transition-colors duration-200"
          aria-label="Status da Conexão"
          title={getBackendStatusText()}
        >
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {backendStatus === 'active' ? (
              // Ícone de WiFi conectado
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            ) : backendStatus === 'inactive' ? (
              // Ícone de WiFi desconectado
              <g>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01"
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="m3 3 18 18"
                />
              </g>
            ) : (
              // Ícone de erro de conexão
              <g>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </g>
            )}
          </svg>
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-edp-neutral-dark hover:text-edp-electric hover:bg-edp-electric/10 rounded-lg transition-colors duration-200"
            aria-label="Notificações"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-edp-semantic-red text-white text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative group">
          <button 
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-edp-neutral-dark hover:text-edp-electric hover:bg-edp-electric/10 rounded-lg transition-colors duration-200"
            aria-label={`Menu do usuário - ${user?.nome || 'Usuário'}`}
            title={`${user?.nome || 'Usuário'} (${user?.cargo || 'Sem cargo'})`}
          >
            {user?.url_avatar ? (
              <img 
                src={user.url_avatar} 
                alt={user.nome}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            )}
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-edp-neutral-lighter rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {/* Informações do Usuário */}
            {user && (
              <div className="px-3 sm:px-4 py-3 border-b border-edp-neutral-lighter">
                <div className="font-edp">
                  <div className="font-semibold text-sm sm:text-base text-edp-neutral-darkest truncate">{user.nome}</div>
                  <div className="text-xs sm:text-sm text-edp-neutral-dark truncate">{user.email}</div>
                  <div className="text-xs text-edp-neutral-medium mt-1 flex flex-wrap gap-1 sm:gap-2">
                    <span className="bg-edp-electric/20 text-edp-marine px-2 py-0.5 rounded text-xs">
                      {user.cargo}
                    </span>
                    {user.eclusa && (
                      <span className="bg-edp-ice/20 text-edp-marine px-2 py-0.5 rounded text-xs">
                        {user.eclusa}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Botão de Logout */}
            <button 
              onClick={handleLogout}
              className="w-full px-3 sm:px-4 py-3 text-left font-edp text-sm sm:text-base text-edp-neutral-darkest hover:bg-edp-semantic-red hover:text-white transition-colors flex items-center gap-2 sm:gap-3"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};