import React from 'react';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types/auth';

interface GestaoCardsProps {
  users: User[];
  manageableCargos: string[];
}

export const GestaoCards: React.FC<GestaoCardsProps> = ({
  users,
  manageableCargos
}) => {

  const totalSobGestao = manageableCargos.reduce((count, cargo) => 
    count + users.filter(u => u.cargo === cargo).length, 0
  );

  const totalEclusas = Array.from(new Set(users.map(u => u.eclusa))).length;
  
  const cargoMaisFrequente = manageableCargos.reduce((prev, current) => {
    const prevCount = users.filter(u => u.cargo === prev).length;
    const currentCount = users.filter(u => u.cargo === current).length;
    return currentCount > prevCount ? current : prev;
  }, manageableCargos[0]);

  const eclusaMaisFrequente = Array.from(new Set(users.map(u => u.eclusa))).reduce((prev, current) => {
    const prevCount = users.filter(u => u.eclusa === prev).length;
    const currentCount = users.filter(u => u.eclusa === current).length;
    return currentCount > prevCount ? current : prev;
  });

  // Estatísticas adicionais
  const usuariosAtivos = users.filter(u => u.status === 'Ativo').length;
  const usuariosBloqueados = users.filter(u => u.status === 'Bloqueado').length;
  const taxaAtivos = users.length > 0 ? Math.round((usuariosAtivos / users.length) * 100) : 0;

  const cards = [
    {
      title: 'Total sob Gestão',
      value: totalSobGestao,
      description: 'Usuários que você pode gerenciar',
      icon: UserGroupIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    },
    {
      title: 'Cargos Diferentes',
      value: manageableCargos.length,
      description: `Mais comum: ${cargoMaisFrequente}`,
      icon: ChartBarIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    },
    {
      title: 'Eclusas Ativas',
      value: totalEclusas,
      description: `Mais comum: ${eclusaMaisFrequente}`,
      icon: BuildingOfficeIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    },
    {
      title: 'Taxa de Ocupação',
      value: Math.round((totalSobGestao / users.length) * 100),
      suffix: '%',
      description: 'Do total de usuários no sistema',
      icon: UsersIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    },
    {
      title: 'Usuários Ativos',
      value: usuariosAtivos,
      description: `Taxa de ${taxaAtivos}% do total`,
      icon: ShieldCheckIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    },
    {
      title: 'Usuários Bloqueados',
      value: usuariosBloqueados,
      description: `${Math.round((usuariosBloqueados / users.length) * 100)}% do total`,
      icon: ClockIcon,
      color: 'bg-[#7C9599]',
      iconColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-edp font-medium text-edp-neutral-medium truncate">
                  {card.title}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-edp font-bold text-edp-neutral-darkest">
                    {card.value}
                  </span>
                  {card.suffix && (
                    <span className="text-lg font-edp font-semibold text-edp-neutral-medium">
                      {card.suffix}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            
            <p className="text-xs font-edp text-edp-neutral-medium line-clamp-2">
              {card.description}
            </p>
            
            {/* Indicador visual simples */}
            <div className="mt-3 w-full bg-edp-neutral-white-wash rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${card.color} transition-all duration-1000`}
                style={{ 
                  width: `${Math.min(100, (card.value || 0) * (index === 3 ? 1 : 10))}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};