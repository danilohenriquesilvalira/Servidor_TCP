import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon 
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
    <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm">
      {/* Compact Mobile Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar usuário..."
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
              className="text-sm"
            />
          </div>
          
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
            className={`flex items-center gap-2 px-3 py-2 ${hasAdvancedFilters ? 'border-[#7C9599] bg-[#7C9599] text-white' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            {hasAdvancedFilters && <span className="w-2 h-2 bg-white rounded-full"></span>}
          </Button>
        </div>
        
        {canCreateUsers && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateUser}
            className="ml-2 flex items-center gap-1.5 px-3 py-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">Novo</span>
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="px-3 pb-3">
        <span className="text-xs text-edp-neutral-medium">
          {totalResults} usuário{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        title="Filtros de Busca"
        size="sm"
      >
        <div className="space-y-6">
          {/* Cargo Filter */}
          <div>
            <div className="text-sm font-medium text-edp-neutral-darkest mb-3">Cargo</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCargoChange('')}
                className={`p-3 text-sm font-medium rounded-lg border transition-all text-center ${
                  !selectedCargo 
                    ? 'bg-[#7C9599] text-white border-[#7C9599]' 
                    : 'bg-white text-edp-neutral-darkest border-edp-neutral-lighter hover:border-[#7C9599]'
                }`}
              >
                Todos
              </button>
              {cargoOptions.map((cargo) => (
                <button
                  key={cargo}
                  onClick={() => onCargoChange(cargo)}
                  className={`p-3 text-sm font-medium rounded-lg border transition-all text-center ${
                    selectedCargo === cargo 
                      ? 'bg-[#7C9599] text-white border-[#7C9599]' 
                      : 'bg-white text-edp-neutral-darkest border-edp-neutral-lighter hover:border-[#7C9599]'
                  }`}
                >
                  {cargo}
                </button>
              ))}
            </div>
          </div>

          {/* Eclusa Filter */}
          <div>
            <div className="text-sm font-medium text-edp-neutral-darkest mb-3">Eclusa</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onEclusaChange('')}
                className={`p-3 text-sm font-medium rounded-lg border transition-all text-left ${
                  !selectedEclusa 
                    ? 'bg-[#7C9599] text-white border-[#7C9599]' 
                    : 'bg-white text-edp-neutral-darkest border-edp-neutral-lighter hover:border-[#7C9599]'
                }`}
              >
                Todas as Eclusas
              </button>
              {eclusaOptions.map((eclusa) => (
                <button
                  key={eclusa}
                  onClick={() => onEclusaChange(eclusa)}
                  className={`p-3 text-sm font-medium rounded-lg border transition-all text-left ${
                    selectedEclusa === eclusa 
                      ? 'bg-[#7C9599] text-white border-[#7C9599]' 
                      : 'bg-white text-edp-neutral-darkest border-edp-neutral-lighter hover:border-[#7C9599]'
                  }`}
                >
                  {eclusa}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-edp-neutral-lighter">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  onClearFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpar
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setShowMobileFilters(false)}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  // Desktop Filter Component  
  const DesktopFilters = () => (
    <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4">
      {/* Linha compacta principal */}
      <div className="flex items-center gap-4">
        {/* Busca compacta */}
        <div className="flex-1 max-w-md">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar usuário..."
            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>

        {/* Indicador de resultados */}
        <div className="text-sm text-edp-neutral-medium whitespace-nowrap">
          {totalResults} resultado{totalResults !== 1 ? 's' : ''}
        </div>

        {/* Botão de filtros avançados */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`relative ${hasAdvancedFilters ? 'border-edp-electric text-edp-electric' : ''}`}
        >
          <FunnelIcon className="w-4 h-4" />
          {hasAdvancedFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-edp-electric rounded-full"></span>
          )}
        </Button>

        {/* Botão Novo Usuário */}
        {canCreateUsers && (
          <Button
            variant="primary"
            onClick={onCreateUser}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Usuário</span>
          </Button>
        )}
      </div>

      {/* Filtros avançados (colapsáveis) */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-edp-neutral-lighter">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cargo */}
            <Select
              label="Cargo"
              value={selectedCargo}
              onChange={onCargoChange}
              options={[
                { value: '', label: 'Todos os cargos' },
                ...cargoOptions.map(cargo => ({ value: cargo, label: cargo }))
              ]}
            />

            {/* Eclusa */}
            <Select
              label="Eclusa"
              value={selectedEclusa}
              onChange={onEclusaChange}
              options={[
                { value: '', label: 'Todas as eclusas' },
                ...eclusaOptions.map(eclusa => ({ value: eclusa, label: eclusa }))
              ]}
            />

            {/* Botão Limpar */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isMobile ? <MobileFilters /> : <DesktopFilters />;
};