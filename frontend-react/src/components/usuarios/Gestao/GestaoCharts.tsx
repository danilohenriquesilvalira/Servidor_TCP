import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  BuildingOfficeIcon
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

  // Sistema de responsividade inteligente
  const [layoutConfig, setLayoutConfig] = useState({
    showResumoExecutivo: true,
    gridCols: 'xl:grid-cols-3',
    cardHeight: 'auto',
    expandedGrid: false,
    fillHeight: 'auto'
  });

  useEffect(() => {
    const calculateLayout = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Altura ocupada: Header (64px) + Layout padding (48px) + Tabs+Filtros (56px) + Margens (32px)
      const fixedHeight = 200;
      const availableHeight = windowHeight - fixedHeight;
      
      // Card básico: ~300px (header + conteúdo + padding)
      const cardMinHeight = 300;
      const resumoHeight = 200; // Card resumo executivo
      
      // Verificar se cabe tudo na tela
      const canFitResumo = availableHeight > (cardMinHeight + resumoHeight + 24); // 24px gap
      
      // Configurar layout baseado na resolução e altura
      let config = {
        showResumoExecutivo: canFitResumo,
        gridCols: windowWidth < 1024 ? 'lg:grid-cols-2' : windowWidth < 1440 ? 'xl:grid-cols-2' : 'xl:grid-cols-3',
        cardHeight: availableHeight < 600 ? 'h-auto' : 'auto',
        expandedGrid: false,
        fillHeight: 'auto'
      };
      
      // Ajuste especial para resoluções como 1912x954
      if (windowWidth > 1440 && windowHeight < 1000) {
        config.showResumoExecutivo = false; // Remove resumo para não cortar
        config.gridCols = 'xl:grid-cols-3'; // Mantém 3 colunas
        config.expandedGrid = true; // Ativa modo expandido
        
        // Calcular altura disponível para os cards quando resumo é removido
        const remainingHeight = availableHeight - 100; // margem de segurança
        config.fillHeight = `${Math.max(320, Math.floor(remainingHeight / 3))}px`; // Divide por 3 cards
      }
      
      // Para outras resoluções que também precisam remover o resumo
      if (!config.showResumoExecutivo && !config.expandedGrid) {
        config.expandedGrid = true;
        
        // Sistema inteligente de preenchimento baseado na altura disponível
        const extraHeight = resumoHeight; // Altura que sobrou do resumo removido
        const baseCardHeight = 300; // Altura base dos cards
        const expandedCardHeight = baseCardHeight + (extraHeight / 3); // Distribui entre os 3 cards
        
        config.fillHeight = `${Math.min(450, expandedCardHeight)}px`; // Máximo de 450px por card
      }
      
      console.log(`🎯 Layout Config: ${windowWidth}x${windowHeight} → Resumo: ${config.showResumoExecutivo}, Grid: ${config.gridCols}, Expanded: ${config.expandedGrid}, Height: ${config.fillHeight}`);
      setLayoutConfig(config);
    };
    
    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

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

  const maxEclusaCount = Math.max(...eclusaData.map(d => d.count), 1);
  const totalUsers = users.length || 1;

  return (
    <div className={`space-y-6 ${layoutConfig.expandedGrid ? 'h-full flex flex-col' : ''}`}>
      
      {/* Layout Responsivo Inteligente - Adapta ao espaço disponível */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${layoutConfig.gridCols} gap-4 sm:gap-6 ${layoutConfig.expandedGrid ? 'flex-1' : 'auto-rows-fr'}`}>
        
        {/* Gráfico 1 - Status dos Usuários (Gauge Circular) */}
        <div 
          className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col"
          style={layoutConfig.expandedGrid ? { minHeight: layoutConfig.fillHeight } : {}}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">Status dos Usuários</h3>
            </div>
            <p className="text-sm text-gray-500">Distribuição atual</p>
          </div>
          
          {/* Gauge Circular Moderno */}
          <div className="flex items-center justify-center mb-6 flex-1">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                {/* Active Users Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#7C9599"
                  strokeWidth="8"
                  strokeDasharray={`${(statusData[0]?.count || 0) / totalUsers * 251} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round((statusData[0]?.count || 0) / totalUsers * 100)}%
                </div>
                <div className="text-xs text-gray-500">Ativos</div>
              </div>
            </div>
          </div>
          
          {/* Status Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#7C9599] rounded-full"></div>
                <span className="text-sm text-gray-600">Usuários Ativos</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{statusData[0]?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Usuários Bloqueados</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{statusData[1]?.count || 0}</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2 - Distribuição por Cargo (Linha Moderna) */}
        <div 
          className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col"
          style={layoutConfig.expandedGrid ? { minHeight: layoutConfig.fillHeight } : {}}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ChartBarIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">Distribuição por Cargo</h3>
            </div>
            <p className="text-sm text-gray-500">{cargoData.length} cargos diferentes • Métrica inteligente</p>
          </div>
          
          {/* Gráfico de Linha Moderno para Cargos */}
          <div 
            className="relative w-full mb-4 flex-1" 
            style={layoutConfig.expandedGrid ? { minHeight: '200px' } : { height: '160px' }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none' }}>
                {/* Grid moderno */}
                <defs>
                  <linearGradient id="cargoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C9599" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#7C9599" stopOpacity="0.05"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Grid de fundo sutil */}
                {[20, 40, 60, 80, 100].map(y => (
                  <line key={y} x1="20" y1={y} x2="280" y2={y} stroke="#F3F4F6" strokeWidth="0.5" opacity="0.7"/>
                ))}
                
                {cargoData.length > 0 && (() => {
                  // Calcular pontos da linha
                  const maxValue = Math.max(...cargoData.map(d => d.count), 1);
                  const points = cargoData.map((item, index) => {
                    const x = 20 + (index / Math.max(cargoData.length - 1, 1)) * 260;
                    const y = 100 - ((item.count / maxValue) * 70);
                    return { x, y, data: item };
                  });
                  
                  // Criar path da linha
                  const pathData = points.map((point, index) => 
                    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                  ).join(' ');
                  
                  // Criar path da área preenchida
                  const areaPath = `${pathData} L ${points[points.length - 1]?.x || 280} 100 L 20 100 Z`;
                  
                  return (
                    <>
                      {/* Área preenchida */}
                      <path d={areaPath} fill="url(#cargoGradient)" />
                      
                      {/* Linha principal mais fina */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#7C9599"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        className="drop-shadow-sm"
                      />
                      
                      {/* Pontos menores e mais bonitos */}
                      {points.map((point, index) => (
                        <g key={index}>
                          {/* Círculo principal menor */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#F9FAFB"
                            stroke="#7C9599"
                            strokeWidth="2"
                            className="drop-shadow-sm"
                          />
                          {/* Área de hover */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill="transparent"
                            className="hover:fill-gray-100 hover:fill-opacity-50 transition-all cursor-pointer"
                          >
                            <title>{point.data.cargo}: {point.data.count} usuários</title>
                          </circle>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
          
          {/* Métricas resumo - responsivas */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-[#7C9599] mb-1">
                {cargoData.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-600 mb-1">
                {cargoData.length > 0 ? Math.round(cargoData.reduce((sum, item) => sum + item.count, 0) / cargoData.length) : 0}
              </div>
              <div className="text-xs text-gray-500">Média por Cargo</div>
            </div>
          </div>
        </div>

        {/* Gráfico 3 - Distribuição por Eclusa */}
        <div 
          className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col"
          style={layoutConfig.expandedGrid ? { minHeight: layoutConfig.fillHeight } : {}}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">Distribuição por Eclusa</h3>
            </div>
            <p className="text-sm text-gray-500">{eclusaData.length} eclusas ativas</p>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {eclusaData.map((item) => {
              const percentage = (item.count / maxEclusaCount) * 100;
              const userPercentage = Math.round((item.count / totalUsers) * 100);
              
              return (
                <div key={item.eclusa}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-800">{item.eclusa}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                      <span className="text-xs text-gray-500">({userPercentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-[#212E3E] transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Gráfico 4 - Resumo Executivo (Condicional baseado na altura) */}
      {layoutConfig.showResumoExecutivo && (
        <div className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <ChartPieIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-800">Resumo Executivo</h3>
            </div>
            <p className="text-sm text-gray-500">Indicadores principais de gestão</p>
          </div>
          
          {/* Grid responsivo para métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Métrica 1 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#7C9599] mb-1">
                {cargoData.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Usuários sob Gestão</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-[#7C9599] transition-all duration-1000"
                  style={{ width: `${Math.min(100, (cargoData.reduce((sum, item) => sum + item.count, 0) / totalUsers) * 100)}%` }}
                />
              </div>
            </div>

            {/* Métrica 2 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-[#212E3E] mb-1">
                {statusData[0]?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-[#212E3E] transition-all duration-1000"
                  style={{ width: `${((statusData[0]?.count || 0) / totalUsers) * 100}%` }}
                />
              </div>
            </div>

            {/* Métrica 3 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {cargoData.length}
              </div>
              <div className="text-sm text-gray-600">Cargos Ativos</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-gray-600 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (cargoData.length / manageableCargos.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Métrica 4 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-500 mb-1">
                {eclusaData.length}
              </div>
              <div className="text-sm text-gray-600">Eclusas em Uso</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div 
                  className="h-1 rounded-full bg-gray-2000 transition-all duration-1000"
                  style={{ width: `${Math.min(100, (eclusaData.length / 10) * 100)}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};