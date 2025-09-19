import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { PLCData, ConnectionStatus, WriteRequest } from '../types/plc';

interface PLCContextType {
  data: PLCData | null;
  connectionStatus: ConnectionStatus;
  sendCommand: (command: WriteRequest) => void;
  connect: () => void;
  disconnect: () => void;
}

const PLCContext = createContext<PLCContextType | undefined>(undefined);

interface PLCProviderProps {
  children: ReactNode;
  websocketUrl?: string;
}

export const PLCProvider: React.FC<PLCProviderProps> = ({ 
  children, 
  websocketUrl 
}) => {
  // URL dinâmica baseada no host atual
  const dynamicUrl = websocketUrl || `ws://${window.location.hostname}:8081/ws`;
  const websocket = useWebSocket(dynamicUrl);

  return (
    <PLCContext.Provider value={websocket}>
      {children}
    </PLCContext.Provider>
  );
};

export const usePLC = (): PLCContextType => {
  const context = useContext(PLCContext);
  if (context === undefined) {
    throw new Error('usePLC deve ser usado dentro de um PLCProvider');
  }
  return context;
};