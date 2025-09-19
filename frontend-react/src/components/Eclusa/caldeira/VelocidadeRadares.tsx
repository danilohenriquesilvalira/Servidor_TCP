import React from 'react';
import { usePLC } from '../../../contexts/PLCContext';

interface VelocidadeRadaresProps {
  height?: number;
}

const VelocidadeRadares: React.FC<VelocidadeRadaresProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();
  
  // Valores dos radares de velocidade em m/s
  const jusante = Number(plcData?.reals?.[116]) || 0;   // Radar Jusante
  const montante = Number(plcData?.reals?.[117]) || 0;  // Radar Montante  
  const caldeira = Number(plcData?.reals?.[118]) || 0;  // Radar Caldeira

  // Responsividade baseada na altura
  const isSmall = height < 160;

  // Velocidade máxima para escala (ajustar conforme necessário)
  const maxVelocidade = 10; // 10 m/s como máximo para a barra

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>
              Radares
            </h4>
          </div>
        </div>
        
        <div className={`flex-1 flex flex-col justify-center ${isSmall ? 'space-y-1' : 'space-y-2'}`}>
          
          {/* Radar Jusante */}
          <div>
            <div className={`flex justify-between items-center ${isSmall ? 'mb-0' : 'mb-1'}`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Jusante</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`} style={isSmall ? { fontSize: '10px' } : {}}>{isSmall ? `${jusante.toFixed(1)}` : `${jusante.toFixed(1)} m/s`}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((jusante / maxVelocidade) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Radar Montante */}
          <div>
            <div className={`flex justify-between items-center ${isSmall ? 'mb-0' : 'mb-1'}`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Montante</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`} style={isSmall ? { fontSize: '10px' } : {}}>{isSmall ? `${montante.toFixed(1)}` : `${montante.toFixed(1)} m/s`}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((montante / maxVelocidade) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Radar Caldeira */}
          <div>
            <div className={`flex justify-between items-center ${isSmall ? 'mb-0' : 'mb-1'}`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>Caldeira</span>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-800`} style={isSmall ? { fontSize: '10px' } : {}}>{isSmall ? `${caldeira.toFixed(1)}` : `${caldeira.toFixed(1)} m/s`}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-gray-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((caldeira / maxVelocidade) * 100, 100)}%` }}
              />
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default VelocidadeRadares;