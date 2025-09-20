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
      className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Header azul - igual aos outros cards */}
      <div className={`bg-slate-700 text-white px-4 ${isSmall ? 'py-1.5' : 'py-2'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
            </svg>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium`}>Status da Eclusa</h4>
          </div>
          
          {/* Valores no header - lado direito igual aos outros cards */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-300">Con</div>
              <div className={`font-bold ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus.connected ? 'OK' : 'OFF'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Op</div>
              <div className={`font-bold ${statusOp.color.includes('green') ? 'text-green-400' : statusOp.color.includes('yellow') ? 'text-yellow-400' : 'text-red-400'}`}>
                {statusOp.status === 'Standby' ? 'OK' : statusOp.status === 'Em Operação' ? 'RUN' : 'OFF'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico/conteúdo preenchendo todo o espaço restante como os outros */}
      <div className="flex-1 w-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className={`${isSmall ? 'text-lg' : 'text-2xl'} font-bold text-gray-800 mb-1`}>
            {operadorNome}
          </div>
          <div className="text-xs text-gray-500 mb-3">Operador Ativo</div>
          
          {/* Status simples */}
          <div className="text-xs text-gray-600 mb-2">
            {connectionStatus.connected ? 'Sistema Online' : 'Desconectado'}
          </div>
          
          {/* Indicador visual centralizado */}
          <div className={`mx-auto w-16 bg-gray-300 rounded-full h-2`}>
            <div 
              className={`h-2 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
              style={{
                width: connectionStatus.connected ? '100%' : '20%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EclusaStatusCard;