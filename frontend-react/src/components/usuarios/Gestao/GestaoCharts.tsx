import React from 'react';
import { 
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types/auth';

interface GestaoChartsProps {
  users: User[];
  manageableCargos: string[];
}

export const GestaoCharts: React.FC<GestaoChartsProps> = ({
  users,
  manageableCargos
}) => {

  // Dados para os gráficos
  const cargoData = manageableCargos.map(cargo => ({
    cargo,
    count: users.filter(u => u.cargo === cargo).length
  })).filter(item => item.count > 0);

  const eclusaData = Array.from(new Set(users.map(u => u.eclusa))).map(eclusa => ({
    eclusa,
    count: users.filter(u => u.eclusa === eclusa).length
  }));

  const statusData = [
    { status: 'Ativo', count: users.filter(u => u.status === 'Ativo').length },
    { status: 'Bloqueado', count: users.filter(u => u.status === 'Bloqueado').length }
  ];

  const maxCargoCount = Math.max(...cargoData.map(d => d.count));
  const maxEclusaCount = Math.max(...eclusaData.map(d => d.count));

  // Dados para distribuição por cargo e eclusa combinados
  const cargoEclusaData = manageableCargos.map(cargo => {
    const cargoUsers = users.filter(u => u.cargo === cargo);
    const eclusas = Array.from(new Set(cargoUsers.map(u => u.eclusa)));
    return {
      cargo,
      totalUsers: cargoUsers.length,
      eclusas: eclusas.length,
      distribution: eclusas.map(eclusa => ({
        eclusa,
        count: cargoUsers.filter(u => u.eclusa === eclusa).length
      }))
    };
  }).filter(item => item.totalUsers > 0);
  
  // Helper para encontrar o cargo mais frequente
  const cargoMaisFrequente = manageableCargos.reduce((prev, current) => {
    const prevCount = users.filter(u => u.cargo === prev).length;
    const currentCount = users.filter(u => u.cargo === current).length;
    return currentCount > prevCount ? current : prev;
  }, manageableCargos[0]);

  return (
    <div className="space-y-4 w-full">
      
      {/* Primeira linha - Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        
        {/* Gráfico de Cargos */}
        <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#7C9599] rounded-md flex items-center justify-center">
              <ChartBarIcon className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-edp font-semibold text-edp-neutral-darkest">
                Distribuição por Cargo
              </h4>
              <p className="text-xs text-edp-neutral-medium">
                Total: {cargoData.reduce((sum, d) => sum + d.count, 0)} usuários
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {cargoData.map((item, index) => {
              const percentage = maxCargoCount > 0 ? (item.count / maxCargoCount) * 100 : 0;
              const colors = ['bg-[#0EA5E9]', 'bg-[#06B6D4]', 'bg-[#10B981]', 'bg-[#8B5CF6]'];
              
              return (
                <div key={item.cargo} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-edp font-medium text-edp-neutral-darkest">
                      {item.cargo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-edp font-bold text-edp-neutral-darkest">
                        {item.count}
                      </span>
                      <span className="text-xs text-edp-neutral-medium">
                        ({Math.round((item.count / users.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Eclusas */}
        <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#7C9599] rounded-md flex items-center justify-center">
              <ChartPieIcon className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-edp font-semibold text-edp-neutral-darkest">
                Distribuição por Eclusa
              </h4>
              <p className="text-xs text-edp-neutral-medium">
                {eclusaData.length} eclusas diferentes
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {eclusaData.map((item, index) => {
              const percentage = maxEclusaCount > 0 ? (item.count / maxEclusaCount) * 100 : 0;
              const colors = ['bg-[#0EA5E9]', 'bg-[#06B6D4]', 'bg-[#10B981]', 'bg-[#8B5CF6]'];
              
              return (
                <div key={item.eclusa} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-edp font-medium text-edp-neutral-darkest">
                      {item.eclusa}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-edp font-bold text-edp-neutral-darkest">
                        {item.count}
                      </span>
                      <span className="text-xs text-edp-neutral-medium">
                        ({Math.round((item.count / users.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Terceiro Gráfico - Barras Verticais Cargo x Eclusa (apenas em telas muito grandes) */}
        <div className="hidden 2xl:block bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#7C9599] rounded-md flex items-center justify-center">
              <CubeIcon className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-edp font-semibold text-edp-neutral-darkest">
                Distribuição Cargo x Eclusa
              </h4>
              <p className="text-xs text-edp-neutral-medium">
                Gráfico vertical elegante
              </p>
            </div>
          </div>
          
          {/* Vertical Bar Chart */}
          <div className="flex items-end justify-center gap-3 h-40 px-2">
            {cargoEclusaData.slice(0, 4).map((item, cargoIndex) => {
              const maxTotal = Math.max(...cargoEclusaData.map(d => d.totalUsers));
              const cargoHeight = maxTotal > 0 ? (item.totalUsers / maxTotal) * 100 : 0;
              
              return (
                <div key={item.cargo} className="flex flex-col items-center flex-1">
                  {/* Vertical Stacked Bar */}
                  <div className="relative w-full max-w-16 flex flex-col justify-end" style={{ height: '120px' }}>
                    <div 
                      className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-1000"
                      style={{ height: `${cargoHeight}%` }}
                    >
                      {item.distribution.map((dist, index) => {
                        const segmentPercentage = item.totalUsers > 0 ? (dist.count / item.totalUsers) * 100 : 0;
                        const colors = [
                          'bg-gradient-to-t from-[#0EA5E9] to-[#38BDF8]',
                          'bg-gradient-to-t from-[#06B6D4] to-[#22D3EE]', 
                          'bg-gradient-to-t from-[#10B981] to-[#34D399]',
                          'bg-gradient-to-t from-[#8B5CF6] to-[#A78BFA]'
                        ];
                        
                        return dist.count > 0 ? (
                          <div
                            key={dist.eclusa}
                            className={`w-full ${colors[index % colors.length]} transition-all duration-1000 flex items-center justify-center relative group`}
                            style={{ height: `${segmentPercentage}%` }}
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              {dist.eclusa}: {dist.count}
                            </div>
                            {/* Number inside if big enough */}
                            {segmentPercentage > 15 && (
                              <span className="text-xs font-bold text-white">
                                {dist.count}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                    
                    {/* Total number at top */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs font-bold text-edp-neutral-darkest bg-white px-1 rounded">
                        {item.totalUsers}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cargo Label */}
                  <div className="mt-2 text-center">
                    <div className="text-xs font-edp font-medium text-edp-neutral-darkest">
                      {item.cargo}
                    </div>
                    <div className="text-xs text-edp-neutral-medium">
                      {item.eclusas} eclusa{item.eclusas !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-edp-neutral-lighter">
            {Array.from(new Set(cargoEclusaData.flatMap(item => item.distribution.filter(d => d.count > 0).map(d => d.eclusa)))).slice(0, 4).map((eclusa, index) => {
              const colorClasses = [
                'bg-[#0EA5E9]',
                'bg-[#06B6D4]', 
                'bg-[#10B981]',
                'bg-[#8B5CF6]'
              ];
              
              return (
                <div key={eclusa} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-sm ${colorClasses[index % colorClasses.length]}`} />
                  <span className="text-xs text-edp-neutral-medium">
                    {eclusa}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Segunda linha - Gauges Modernos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gauge 1 - Status dos Usuários */}
        <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-6 h-6 bg-[#7C9599] rounded-md flex items-center justify-center">
              <PresentationChartLineIcon className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-edp font-semibold text-edp-neutral-darkest">
                Status dos Usuários
              </h4>
              <p className="text-xs text-edp-neutral-medium">
                Distribuição por status
              </p>
            </div>
          </div>
          
          {/* Gauge Circular para Status */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              {/* SVG Gauge Background */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                {/* Active Users Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${(statusData[0]?.count || 0) / users.length * 283} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl sm:text-2xl font-edp font-bold text-edp-neutral-darkest">
                  {Math.round((statusData[0]?.count || 0) / users.length * 100)}%
                </div>
                <div className="text-xs text-edp-neutral-medium">Ativos</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-4">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-edp text-edp-neutral-darkest">
                Ativo ({statusData[0]?.count || 0})
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-edp text-edp-neutral-darkest">
                Bloqueado ({statusData[1]?.count || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras - Estatísticas Gerais */}
        <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-6 h-6 bg-[#7C9599] rounded-md flex items-center justify-center">
              <ChartBarIcon className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-edp font-semibold text-edp-neutral-darkest">
                Estatísticas Gerais
              </h4>
              <p className="text-xs text-edp-neutral-medium">
                Visão resumida do sistema
              </p>
            </div>
          </div>
          
          {/* Bar Chart Moderno */}
          <div className="space-y-4">
            {/* Cargos Ativos */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-edp text-edp-neutral-darkest">Cargos Ativos</span>
              <span className="text-sm font-edp font-bold text-edp-neutral-darkest">{cargoData.length}</span>
            </div>
            <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (cargoData.length / manageableCargos.length) * 100)}%` }}
              />
            </div>
            
            {/* Eclusas */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-edp text-edp-neutral-darkest">Eclusas Ativas</span>
              <span className="text-sm font-edp font-bold text-edp-neutral-darkest">{eclusaData.length}</span>
            </div>
            <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-[#06B6D4] to-[#10B981] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (eclusaData.length / 10) * 100)}%` }}
              />
            </div>
            
            {/* Taxa de Gestão */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-edp text-edp-neutral-darkest">Taxa de Gestão</span>
              <span className="text-sm font-edp font-bold text-edp-neutral-darkest">
                {Math.round((cargoData.reduce((sum, d) => sum + d.count, 0) / users.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-[#10B981] to-[#8B5CF6] rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((cargoData.reduce((sum, d) => sum + d.count, 0) / users.length) * 100)}%` }}
              />
            </div>
            
            {/* Cargo Dominante */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-edp text-edp-neutral-darkest">{cargoMaisFrequente}</span>
              <span className="text-sm font-edp font-bold text-edp-neutral-darkest">
                {users.filter(u => u.cargo === cargoMaisFrequente).length} usuários
              </span>
            </div>
            <div className="w-full bg-edp-neutral-white-wash rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((users.filter(u => u.cargo === cargoMaisFrequente).length / users.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};