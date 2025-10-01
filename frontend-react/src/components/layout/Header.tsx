import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePLC } from '@/contexts/PLCContext';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { FaultIcon } from '@/components/Falhas/FaultIcon';
import { EQUIPMENT_CATEGORIES } from '@/types/faults';
import { useFaultDetector } from '@/hooks/useFaultDetector';
import { WifiIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { connectionStatus, data: plcData } = usePLC();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFaultDropdownOpen, setIsFaultDropdownOpen] = useState(false);
  const faultDropdownRef = useRef<HTMLDivElement>(null);

  // Sistema de detecção de falhas
  const {
    activeFaults,
    faultCount,
    criticalFaults
  } = useFaultDetector({ plcData });

  // Hover dropdown - não precisa mais de click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (faultDropdownRef.current && !faultDropdownRef.current.contains(event.target as Node)) {
        setIsFaultDropdownOpen(false);
      }
    };

    if (isFaultDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFaultDropdownOpen]);

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
    } else if (pathname.includes('falhas')) {
      return 'Falhas';
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
        
        {/* Sistema de Falhas - Sino */}
        <div className="relative group" ref={faultDropdownRef} onMouseEnter={() => setIsFaultDropdownOpen(true)} onMouseLeave={() => setIsFaultDropdownOpen(false)}>
          <button 
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200 ${
              faultCount > 0 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-edp-neutral-dark hover:text-edp-electric'
            }`}
            aria-label="Sistema de Falhas"
            title={faultCount > 0 ? `${faultCount} falhas ativas` : 'Nenhuma falha ativa'}
          >
            <svg 
              className={`w-5 h-5 sm:w-6 sm:h-6 ${faultCount > 0 ? 'animate-bounce' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          {faultCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full animate-pulse">
              {faultCount > 9 ? '9+' : faultCount}
            </span>
          )}
          
          {/* Dropdown Ultra Moderno */}
          {isFaultDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-[420px] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              {/* Header Simples */}
              <div className="px-6 py-4 bg-edp-neutral-darkest">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-edp font-bold text-white text-sm tracking-wide">
                        Sistema de Monitoramento
                      </h3>
                      <p className="font-edp text-xs text-white/80">
                        {faultCount} {faultCount === 1 ? 'ocorrência ativa' : 'ocorrências ativas'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
                    <span className="font-edp text-xs font-medium text-white/90 bg-white/10 px-3 py-1 rounded-full">
                      ATIVO
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Lista Ultra Moderna */}
              <div className="h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {activeFaults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-edp font-semibold text-gray-600 text-sm">Sistema Operacional</p>
                    <p className="font-edp text-xs text-gray-400 mt-1">Nenhuma ocorrência detectada</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {activeFaults.map((fault, index) => {
                      const category = EQUIPMENT_CATEGORIES[fault.equipment];
                      const isAlarm = fault.type === 'AL';
                      return (
                        <div 
                          key={`${fault.wordIndex}_${fault.bitIndex}_${index}`}
                          className={`p-4 mx-2 mb-2 rounded-xl border shadow-lg backdrop-blur-sm ${
                            isAlarm 
                              ? 'border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50/30 hover:shadow-red-200/50' 
                              : 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 hover:shadow-yellow-200/50'
                          } transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full shadow-md ${
                              isAlarm 
                                ? 'bg-gradient-to-br from-red-100 to-red-200 ring-2 ring-red-300/50' 
                                : 'bg-gradient-to-br from-yellow-100 to-yellow-200 ring-2 ring-yellow-300/50'
                            }`}>
                              {isAlarm ? (
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-700" />
                              ) : (
                                <InformationCircleIcon className="w-4 h-4 text-yellow-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="text-sm font-edp font-bold text-edp-neutral-darkest mb-1 truncate">
                                    {category?.name || fault.equipment}
                                  </h4>
                                  <p className="text-xs font-edp text-gray-600 leading-tight line-clamp-2">
                                    {fault.description}
                                  </p>
                                </div>
                                <div className={`text-xs font-edp font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                                  isAlarm 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}>
                                  {new Date(fault.timestamp).toLocaleTimeString('pt-PT', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative group" onMouseEnter={() => setIsFaultDropdownOpen(false)} onClick={() => setIsFaultDropdownOpen(false)}>
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