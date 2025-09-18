import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal'; // Add this line

interface UsersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCargo: string;
  onCargoChange: (value: string) => void;
  selectedEclusa: string;
  onEclusaChange: (value: string) => void;
  cargoOptions: string[];
  eclusaOptions: string[];
  onClearFilters: () => void;
  onCreateUser?: () => void;
  canCreateUsers?: boolean;
  totalResults: number;
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCargo,
  onCargoChange,
  selectedEclusa,
  onEclusaChange,
  cargoOptions,
  eclusaOptions,
  onClearFilters,
  onCreateUser,
  canCreateUsers,
  totalResults
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const hasActiveFilters = searchTerm || selectedCargo || selectedEclusa;
  const hasAdvancedFilters = selectedCargo || selectedEclusa;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Mobile Filter Component  
  const MobileFilters = () => (
    <div className="flex items-center gap-2">
      {/* Input de busca fixo móvel */}
      {showAdvanced ? (
        <div className="flex items-center flex-1 gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar usuário..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9599] focus:border-[#7C9599]"
            autoFocus
          />
          <button
            onClick={() => {
              if (searchTerm) {
                onSearchChange('');
              }
              setShowAdvanced(false);
            }}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500 flex items-center justify-center transition-all"
            title="Fechar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* Lupa */}
          <button
            onClick={() => setShowAdvanced(true)}
            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              searchTerm
                ? 'border-[#7C9599] bg-[#7C9599]/10 text-[#7C9599]' 
                : 'border-gray-300 text-gray-500 hover:border-[#7C9599] hover:text-[#7C9599]'
            }`}
            title="Buscar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#7C9599] rounded-full"></span>
            )}
          </button>

          {/* Botão Novo Usuário */}
          {canCreateUsers && (
            <Button
              variant="primary"
              onClick={onCreateUser}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-3 py-2 text-sm flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo</span>
            </Button>
          )}
        </>
      )}
    </div>
  );

  // Desktop Filter Component  
  const DesktopFilters = () => (
    <div className="flex items-center gap-3">
      {/* Input de busca expansível */}
      <div className="relative flex items-center">
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showAdvanced ? 'w-64' : 'w-10'
        }`}>
          <div className="flex items-center">
            {/* Lupa */}
            <button
              onClick={() => {
                if (showAdvanced && searchTerm) {
                  // Se está aberto e tem texto, limpa e fecha
                  onSearchChange('');
                  setShowAdvanced(false);
                } else if (showAdvanced) {
                  // Se está aberto mas vazio, só fecha
                  setShowAdvanced(false);
                } else {
                  // Se está fechado, abre
                  setShowAdvanced(true);
                }
              }}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                showAdvanced || searchTerm
                  ? 'border-[#7C9599] bg-[#7C9599]/10 text-[#7C9599]' 
                  : 'border-gray-300 text-gray-500 hover:border-[#7C9599] hover:text-[#7C9599]'
              }`}
              title={searchTerm ? "Limpar busca" : "Buscar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#7C9599] rounded-full"></span>
              )}
            </button>

            {/* Input que expande */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar usuário..."
              className={`ml-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9599] focus:border-[#7C9599] transition-all duration-300 ${
                showAdvanced ? 'w-52 opacity-100' : 'w-0 opacity-0 border-0 px-0'
              }`}
              onBlur={() => !searchTerm && setShowAdvanced(false)}
              autoFocus={showAdvanced}
            />
          </div>
        </div>
      </div>

      {/* Botão Novo Usuário */}
      {canCreateUsers && (
        <Button
          variant="primary"
          onClick={onCreateUser}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 px-4 py-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Usuário</span>
        </Button>
      )}
    </div>
  );

  return isMobile ? <MobileFilters /> : <DesktopFilters />;
};