import React from 'react';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldCheckIcon
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
    
  const usuariosAtivos = users.filter(u => u.status === 'Ativo').length;
  const taxaAtivos = users.length > 0 ? Math.round((usuariosAtivos / users.length) * 100) : 0;

  const cards = [
    {
      title: 'Total sob Gestão',
      value: totalSobGestao,
      description: 'Usuários que você pode gerenciar',
      icon: UserGroupIcon,
      status: 'info' as const
    },
    {
      title: 'Usuários Ativos',
      value: usuariosAtivos,
      description: `Taxa de ${taxaAtivos}% do total`,
      icon: ShieldCheckIcon,
      status: 'success' as const
    },
    {
      title: 'Cargos Diferentes',
      value: manageableCargos.length,
      description: 'Níveis de hierarquia',
      icon: ChartBarIcon,
      status: 'info' as const
    },
    {
      title: 'Eclusas Ativas',
      value: totalEclusas,
      description: 'Localizações em operação',
      icon: BuildingOfficeIcon,
      status: 'warning' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-600">
                  {card.title}
                </h4>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {card.value}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {card.description}
            </p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${card.status === 'success' ? 'bg-green-600' : card.status === 'warning' ? 'bg-yellow-600' : 'bg-gray-600'} transition-all duration-1000 ease-out`}
                style={{
                  width: `${Math.min(100, (card.value || 0) * (index === 2 || index === 3 ? 10 : 5))}%`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};