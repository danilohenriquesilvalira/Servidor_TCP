import { useState, useEffect, useCallback, useRef } from 'react';
import { PLCData, ConnectionStatus, WriteRequest } from '../types/plc';

interface UseWebSocketReturn {
  data: PLCData | null;
  connectionStatus: ConnectionStatus;
  sendCommand: (command: WriteRequest) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [data, setData] = useState<PLCData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastUpdate: null,
    plc_connections: 0,
    websocket_clients: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket já conectado, ignorando nova tentativa');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket já tentando conectar, aguardando...');
      return;
    }

    try {
      console.log('Iniciando conexão WebSocket para:', url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
        }));
        reconnectAttemptsRef.current = 0;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      // O navegador responde automaticamente a pings do servidor
      // Não precisamos implementar pong manualmente no WebSocket do browser

      ws.onmessage = (event) => {
        try {
          const receivedData: PLCData = JSON.parse(event.data);
          setData(receivedData);
          setConnectionStatus(prev => ({
            ...prev,
            lastUpdate: new Date(),
          }));
        } catch (error) {
          console.error('Erro ao processar dados WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
        }));

        // Tentar reconectar automaticamente
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('Máximo de tentativas de reconexão atingido');
        }
      };

      ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus(prev => ({
      ...prev,
      connected: false,
    }));
  }, []);

  const sendCommand = useCallback((command: WriteRequest) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
      console.log('Comando enviado:', command);
    } else {
      console.error('WebSocket não está conectado');
      
      // Fallback para API HTTP
      fetch('/api/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command)
      })
      .then(response => response.json())
      .then(result => {
        console.log('Comando enviado via API:', result);
      })
      .catch(error => {
        console.error('Erro ao enviar comando:', error);
      });
    }
  }, []);

  // Buscar status do servidor periodicamente
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const status = await response.json();
        setConnectionStatus(prev => ({
          ...prev,
          plc_connections: status.plc_connections || 0,
          websocket_clients: status.websocket_clients || 0,
        }));
      } catch (error) {
        // Silently fail - não loggar erro para não poluir console
      }
    };

    const statusInterval = setInterval(fetchStatus, 2000);
    return () => clearInterval(statusInterval);
  }, []);

  // Auto-connect inteligente - conecta apenas uma vez
  useEffect(() => {
    let isActive = true;
    
    const autoConnect = () => {
      if (isActive && !wsRef.current) {
        console.log('Auto-conectando WebSocket...');
        connect();
      }
    };

    // Conectar após um pequeno delay para evitar conexões simultâneas
    const timer = setTimeout(autoConnect, 100);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [connect]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    data,
    connectionStatus,
    sendCommand,
    connect,
    disconnect,
  };
};