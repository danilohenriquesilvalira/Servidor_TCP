import React from 'react';
import { usePLC } from '../../../contexts/PLCContext';
import { useAuth } from '../../../contexts/AuthContext';

interface EclusaStatusCardProps {
  height?: number;
}

const EclusaStatusCard: React.FC<EclusaStatusCardProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();
  const { user } = useAuth();

  // Dados do operador
  const operadorNome = user?.nome || 'N/A';

  // Status da operação baseado nos dados PLC
  const portaJusante = plcData?.ints?.[42] || 0;
  const portaMontante = plcData?.ints?.[59] || 0;

  // Determinar status operacional
  const getStatusOperacao = () => {
    if (!connectionStatus.connected) return { status: 'Desconectado', color: 'text-red-600' };
    if (portaJusante > 0 || portaMontante > 0) return { status: 'Em Operação', color: 'text-yellow-600' };
    return { status: 'Standby', color: 'text-green-600' };
  };

  const statusOp = getStatusOperacao();

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
        <div className={isSmall ? 'mb-2' : 'mb-4'}>
          <div className={`flex items-center gap-2 ${isSmall ? 'mb-2' : 'mb-3'}`}>
            <svg className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>
              {isSmall ? 'Operador' : 'Operador Ativo'}
            </h4>
          </div>
          <div className={`${isSmall ? 'text-lg' : 'text-3xl'} font-bold text-gray-800 mb-1 truncate`}>
            {operadorNome}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <p className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-600`}>
            Status: <span className={`font-medium ${statusOp.color}`}>{statusOp.status}</span>
          </p>
        </div>
        
        {/* Indicador visual simples */}
        <div className={`${isSmall ? 'mt-2' : 'mt-4'} w-full bg-gray-300 rounded-full h-1`}>
          <div 
            className={`h-1 rounded-full ${connectionStatus.connected ? 'bg-gray-600' : 'bg-gray-400'} transition-all duration-1000 ease-out`}
            style={{
              width: connectionStatus.connected ? '100%' : '20%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EclusaStatusCard;