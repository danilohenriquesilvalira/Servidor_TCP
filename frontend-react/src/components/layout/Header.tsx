import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePLC } from '@/contexts/PLCContext';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { WifiIcon } from '@heroicons/react/24/outline';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { connectionStatus } = usePLC();
  const [notificationCount] = useState(3);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Função para obter o nome da página atual
  const getPageTitle = () => {
    const pathname = location.pathname;
    
    if (pathname.includes('dashboard') || pathname === '/') {
      return 'Dashboard';
    } else if (pathname.includes('eclusa-regua')) {
      return 'Eclusa Régua';
    } else if (pathname.includes('porta-jusante')) {
      return 'Porta Jusante';
    } else if (pathname.includes('porta-montante')) {
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

  const getConnectionStatusText = () => {
    return connectionStatus.connected ? 'WebSocket Conectado' : 'WebSocket Desconectado';
  };

  const getConnectionStatusColor = () => {
    return connectionStatus.connected ? 'text-green-500' : 'text-red-500';
  };

  return (
    <header className="h-16 bg-edp-neutral-white-wash border-b border-edp-neutral-lighter px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-20">
      
      {/* Nome da Página */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-edp font-bold text-edp-neutral-darkest">
        {getPageTitle()}
      </h1>

      {/* Actions Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* WebSocket Connection Status Icon */}
        <button
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center ${getConnectionStatusColor()} hover:text-edp-electric hover:bg-edp-electric/10 rounded-lg transition-colors duration-200`}
          aria-label="Status da Conexão WebSocket"
          title={getConnectionStatusText()}
        >
          <WifiIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
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
          
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-edp-neutral-lighter rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
            {/* Header do Card */}
            {user && (
              <div className="px-4 py-4 bg-edp-neutral-white-wash border-b border-edp-neutral-lighter">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-edp-slate flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.url_avatar ? (
                      <img 
                        src={user.url_avatar} 
                        alt={user.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* Info do Usuário */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-edp-neutral-darkest font-edp truncate">
                      {user.nome}
                    </div>
                    <div className="text-sm text-edp-neutral-medium font-edp truncate">
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-edp-neutral-darkest rounded font-medium">
                        {user.cargo}
                      </span>
                      {user.eclusa && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-edp-neutral-darkest rounded font-medium">
                          {user.eclusa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Menu de Ações */}
            <div className="py-2">
              {/* Ir para Perfil */}
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full px-4 py-3 text-left font-edp text-edp-neutral-darkest hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-edp-marine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <div>
                  <div className="font-medium text-sm">Meu Perfil</div>
                  <div className="text-xs text-edp-neutral-medium">Gerencie suas informações</div>
                </div>
              </button>
              
              {/* Configurações */}
              <button 
                className="w-full px-4 py-3 text-left font-edp text-edp-neutral-darkest hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-edp-marine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <div className="font-medium text-sm">Configurações</div>
                  <div className="text-xs text-edp-neutral-medium">Preferências do sistema</div>
                </div>
              </button>
            </div>
            
            {/* Separador */}
            <div className="border-t border-edp-neutral-lighter"></div>
            
            {/* Logout */}
            <div className="py-2">
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left font-edp text-edp-neutral-darkest hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-edp-marine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <div>
                  <div className="font-medium text-sm">Sair do Sistema</div>
                  <div className="text-xs text-edp-neutral-medium">Encerrar sessão atual</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
};