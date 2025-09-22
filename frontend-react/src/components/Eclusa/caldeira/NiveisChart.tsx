import React from 'react';
import { usePLC } from '../../../contexts/PLCContext';

interface NiveisChartProps {
  height?: number;
}

interface GaugeProps {
  value: number;
  label: string;
  color: string;
  maxValue?: number;
}

const ModernGauge: React.FC<GaugeProps> = ({ value, label, color, maxValue = 100 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDasharray = `${percentage * 2.83} 283`; // 283 é aproximadamente a circunferência do círculo
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        {/* Círculo de fundo */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(124, 149, 153, 0.2)"
            strokeWidth="8"
            fill="none"
            className="drop-shadow-sm"
          />
          {/* Círculo do progresso */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out drop-shadow-md"
            style={{
              filter: `drop-shadow(0 0 4px ${color}40)`
            }}
          />
        </svg>
        
        {/* Valor no centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-lg font-bold leading-none"
            style={{ color: color }}
          >
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 leading-none">m</span>
        </div>
      </div>
      
      {/* Label */}
      <span className="text-xs font-medium text-gray-600 mt-2">{label}</span>
    </div>
  );
};

const NiveisChart: React.FC<NiveisChartProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();

  // Valores dos níveis (0-100% ou metros) - APENAS VALORES REAIS DO PLC
  const caldeira = Number(plcData?.reals?.[108]) || 0;
  const montante = Number(plcData?.reals?.[109]) || 0;
  const jusante = Number(plcData?.reals?.[107]) || 0;

  // Responsividade baseada na altura
  const isSmall = height < 160;

  return (
    <div
      className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Header azul - Retângulo para ícone e título */}
      <div className={`bg-slate-700 text-white px-4 ${isSmall ? 'py-1.5' : 'py-2'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-edp-electric rounded px-1.5 py-1 flex items-center justify-center">
              <svg className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-edp-marine`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium`}>Níveis</h4>
          </div>
          
          {/* Valores no header - lado direito */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-300">Jus</div>
              <div className="font-bold text-green-400">{jusante.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Mon</div>
              <div className="font-bold text-green-400">{montante.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Cal</div>
              <div className="font-bold text-green-400">{caldeira.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges preenchendo todo o espaço abaixo do header */}
      <div className="flex-1 flex items-center justify-evenly px-4 py-2">
        <ModernGauge 
          value={jusante} 
          label="Jusante" 
          color="#143F47"
        />
        <ModernGauge 
          value={montante} 
          label="Montante" 
          color="#225E66"
        />
        <ModernGauge 
          value={caldeira} 
          label="Caldeira" 
          color="#7C9599"
        />
      </div>
    </div>
  );
};

export default NiveisChart;