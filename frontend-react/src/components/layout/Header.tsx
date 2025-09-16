import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignalIcon, BellIcon, UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header = ({ 
  onLogout,
  onToggleMobileMenu
}: HeaderProps) => {
  const navigate = useNavigate();
  const [notificationCount] = useState(3);
  const [backendStatus, setBackendStatus] = useState<'active' | 'inactive' | 'failure'>('active');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  const getBackendStatusColor = () => {
    switch (backendStatus) {
      case 'active':
        return 'bg-edp-green';
      case 'inactive':
        return 'bg-edp-neutral-400';
      case 'failure':
        return 'bg-edp-red';
      default:
        return 'bg-edp-neutral-400';
    }
  };

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'active':
        return 'Status: Conectado ao Backend';
      case 'inactive':
        return 'Status: Backend Inativo';
      case 'failure':
        return 'Status: Falha de Conexão com Backend';
      default:
        return 'Status: Desconhecido';
    }
  };

  return (
    <header className="h-20 bg-edp-marine border-b-2 border-edp-neutral-600 px-4 lg:px-6 flex items-center justify-between relative z-20">
      
      {/* Logo Area & Backend Status */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-4">
          <img
            src="/LOGO_EDP_2025.svg"
            alt="EDP Logo"
            className="h-12 w-auto"
          />
          {/* Indicador de Status do Backend */}
          <div className="relative flex items-center" title={getBackendStatusText()}>
            <span className={`block w-3 h-3 rounded-full ${getBackendStatusColor()}`}></span>
            {backendStatus === 'active' && (
              <span className="absolute top-0 left-0 w-full h-full rounded-full opacity-75 animate-ping bg-edp-green"></span>
            )}
          </div>
        </div>
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-4 flex-shrink-0">
        
        {/* Ícone de Conexão */}
        <button
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-white bg-edp-neutral-600 rounded-full hover:bg-edp-electric hover:text-black transition-all duration-200"
          aria-label="Status da Conexão"
          title={getBackendStatusText()}
        >
          <SignalIcon className="w-6 h-6" />
        </button>

        {/* Notificações */}
        <div className="relative">
          <button 
            className="w-12 h-12 flex items-center justify-center text-white bg-edp-neutral-600 rounded-full hover:bg-edp-electric hover:text-black transition-all duration-200"
            aria-label="Notificações"
          >
            <BellIcon className="w-6 h-6" />
          </button>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-edp-electric text-black text-xs font-bold w-6 h-6 flex items-center justify-center text-[11px] rounded-full">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="relative group">
          <button 
            className="w-12 h-12 flex items-center justify-center text-white bg-edp-neutral-600 rounded-full hover:bg-edp-electric hover:text-black transition-all duration-200"
            aria-label="Menu do usuário"
          >
            <UserIcon className="w-6 h-6" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-edp-neutral-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left font-edp text-edp-neutral-900 hover:bg-edp-electric hover:text-black transition-colors flex items-center gap-3 border-2 border-transparent hover:border-edp-electric"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 text-red-600" />
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};