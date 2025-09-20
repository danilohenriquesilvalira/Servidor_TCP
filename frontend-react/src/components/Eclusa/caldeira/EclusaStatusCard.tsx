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
      className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ height: `${height}px` }}
    >
      {/* Header azul - Retângulo para ícone e título */}
      <div className="bg-slate-700 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
            </svg>
            <h4 className="text-sm font-medium">Status da Eclusa</h4>
          </div>
          
          {/* Status no header - lado direito */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-300">Status</div>
              <div className={`font-bold ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus.connected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo na área cinza */}
      <div className={`bg-gray-200 flex-1 flex flex-col ${isSmall ? 'p-2' : 'p-3'}`}>
        {/* Nome do operador */}
        <div className={isSmall ? 'mb-1' : 'mb-2'}>
          <div className={`${isSmall ? 'text-sm' : 'text-base'} font-bold text-gray-800 truncate`}>
            {operadorNome}
          </div>
        </div>
        
        {/* Grid de informações compacto */}
        <div className="flex-1 grid grid-cols-2 gap-1 items-center">
          {/* Status de Conexão */}
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">Conexão</div>
              <div className={`text-xs font-semibold ${connectionStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
                {connectionStatus.connected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          {/* Status Operacional */}
          <div className="flex items-center gap-1">
            <svg className={`w-3 h-3 ${statusOp.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">Operação</div>
              <div className={`text-xs font-semibold ${statusOp.color}`}>
                {statusOp.status}
              </div>
            </div>
          </div>

          {/* Eclusa Ativa */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">Eclusa</div>
              <div className="text-xs font-semibold text-blue-700">
                Principal
              </div>
            </div>
          </div>

          {/* Tempo Online */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">Sessão</div>
              <div className="text-xs font-semibold text-gray-700">
                2h 15m
              </div>
            </div>
          </div>
        </div>
        
        {/* Indicador visual na parte inferior */}
        <div className={`${isSmall ? 'mt-1' : 'mt-2'} w-full bg-gray-300 rounded-full h-1`}>
          <div 
            className={`h-1 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
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