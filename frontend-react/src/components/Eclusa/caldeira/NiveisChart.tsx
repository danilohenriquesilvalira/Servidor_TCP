import React from 'react';
import { usePLC } from '../../../contexts/PLCContext';

interface NiveisChartProps {
  height?: number;
}

const NiveisChart: React.FC<NiveisChartProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();
  
  // Valores dos níveis com fallback
  const caldeira = Number(plcData?.reals?.[108]) || 45;
  const montante = Number(plcData?.reals?.[109]) || 60; 
  const jusante = Number(plcData?.reals?.[107]) || 35;

  // Responsividade baseada na altura
  const isSmall = height < 160;

  return (
    <div 
      className={`bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
        isSmall ? 'p-3' : 'p-6'
      }`}
      style={{ height: `${height}px` }}
    >
      <div className="h-full flex flex-col">
        
        <div className={isSmall ? 'mb-1' : 'mb-2'}>
          <div className="flex items-center gap-2">
            <svg className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>
              {isSmall ? 'Níveis' : 'Níveis da Eclusa'}
            </h4>
          </div>
        </div>
        
        <div className={`flex-1 flex flex-col justify-center ${isSmall ? 'space-y-2' : 'space-y-3'}`}>
          
          {/* Caldeira */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Caldeira</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{caldeira.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(caldeira, 100)}%` }}
              />
            </div>
          </div>

          {/* Montante */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Montante</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{montante.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(montante, 100)}%` }}
              />
            </div>
          </div>

          {/* Jusante */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Jusante</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-semibold text-gray-800`}>{jusante.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(jusante, 100)}%` }}
              />
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default NiveisChart;