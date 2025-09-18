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

  // Mobile Filter Component - Moderno
  const MobileFilters = () => (
    <div className="w-full">
      {/* Barra de busca moderna sempre visível */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome, email ou ID..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edp-marine focus:border-edp-marine transition-all duration-200 shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Indicador de resultados */}
      {searchTerm && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {totalResults} {totalResults === 1 ? 'usuário encontrado' : 'usuários encontrados'}
        </div>
      )}
    </div>
  );

  // Desktop Filter Component - Moderno  
  const DesktopFilters = () => (
    <div className="flex items-center gap-4">
      {/* Barra de busca moderna sempre visível */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome, email ou ID..."
          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edp-marine focus:border-edp-marine transition-all duration-200 shadow-sm hover:shadow-md"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Indicador de resultados */}
      {searchTerm && (
        <div className="text-sm text-gray-600 whitespace-nowrap">
          <span className="font-medium">{totalResults}</span> {totalResults === 1 ? 'usuário' : 'usuários'}
        </div>
      )}
    </div>
  );

  return isMobile ? <MobileFilters /> : <DesktopFilters />;
};