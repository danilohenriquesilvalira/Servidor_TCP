import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import BasePistaoEnchimento from '../components/Enchimento/BasePistaoEnchimento';
import PistaoEnchimento from '../components/Enchimento/PistaoEnchimento';
import CilindroEnchimento from '../components/Enchimento/CilindroEnchimento';

interface EnchimentoProps {
  sidebarOpen?: boolean;
}

// Configuração responsiva da BASE dos pistões
const BASE_PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 110,
      horizontalPercent: 65,
      widthPercent: 26.96,
      heightPercent: 71.888,
    },
    esquerdo: {
      verticalPercent: 110,
      horizontalPercent: 5,
      widthPercent: 26.96,
      heightPercent: 71.888,
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 31.2,
      heightPercent: 62.4,
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 31.2,
      heightPercent: 62.4,
    }
  }
};

// Configuração responsiva do PISTÃO MÓVEL
const PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 68.9,
      horizontalPercent: 56.8,
      widthPercent: 43.32,
      heightPercent: 108.3,
    },
    esquerdo: {
      verticalPercent: 68.9,
      horizontalPercent: -3.2,
      widthPercent: 43.32,
      heightPercent: 108.3,
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 50.54,
      heightPercent: 86.64,
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 50.54,
      heightPercent: 86.64,
    }
  }
};

// Configuração responsiva dos CILINDROS
const CILINDRO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 16,
      horizontalPercent: 71,
      widthPercent: 14.92992,
      heightPercent: 74.6496,
    },
    esquerdo: {
      verticalPercent: 16,
      horizontalPercent: 11,
      widthPercent: 14.92992,
      heightPercent: 74.6496,
    }
  },
  mobile: {
    direito: {
      verticalPercent: 20,
      horizontalPercent: 75,
      widthPercent: 22.39488,
      heightPercent: 65.3184,
    },
    esquerdo: {
      verticalPercent: 20,
      horizontalPercent: 8,
      widthPercent: 22.39488,
      heightPercent: 65.3184,
    }
  }
};

const Enchimento: React.FC<EnchimentoProps> = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [windowDimensions, setWindowDimensions] = React.useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = React.useState(false);

  // UseLayoutEffect para calcular dimensões ANTES da renderização visual
  React.useLayoutEffect(() => {
    const initializeDimensions = () => {
      if (typeof window !== 'undefined') {
        const newWindowDimensions = { width: window.innerWidth, height: window.innerHeight };
        setWindowDimensions(newWindowDimensions);
        
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        } else {
          // Fallback: calcular dimensões baseado na janela
          const width = Math.min(newWindowDimensions.width - 32, 1920);
          setContainerDimensions({ width, height: 600 });
        }
        
        setIsInitialized(true);
      }
    };
    
    // Executar imediatamente (sem timeout)
    initializeDimensions();
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };
        
        setContainerDimensions(prev => {
          if (Math.abs(prev.width - newDimensions.width) > 10 || 
              Math.abs(prev.height - newDimensions.height) > 10) {
            return newDimensions;
          }
          return prev;
        });
      }
      
      const newWindowDimensions = { width: window.innerWidth, height: window.innerHeight };
      setWindowDimensions(prev => {
        if (Math.abs(prev.width - newWindowDimensions.width) > 10 || 
            Math.abs(prev.height - newWindowDimensions.height) > 10) {
          return newWindowDimensions;
        }
        return prev;
      });
    };
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Detectar se é mobile
  const isMobile = React.useMemo(() => windowDimensions.width < 1024, [windowDimensions.width]);

  // Sistema de dimensionamento responsivo
  const maxWidth = Math.min(containerDimensions.width - 32, 1920);
  
  // 📡 USAR O SISTEMA PLC EXISTENTE
  const { data: plcData } = usePLC();
  
  // Extrair dados dos pistões do PLC - SISTEMA ENCHIMENTO
  const pistaoDireito = plcData?.ints?.[0] || 0;   // Pistão direito (índice 0)
  const pistaoEsquerdo = plcData?.ints?.[1] || 0;  // Pistão esquerdo (índice 1)
  
  // Extrair bits dos cilindros do PLC - STATUS BITS 
  // Bit 29: Word 1, Bit 13 (29 = 1*16 + 13)
  // Bit 30: Word 1, Bit 14 (30 = 1*16 + 14)
  const cilindroDireito = plcData?.bit_data?.status_bits?.[1]?.[13] || 0;  // Cilindro direito (bit 29)
  const cilindroEsquerdo = plcData?.bit_data?.status_bits?.[1]?.[14] || 0; // Cilindro esquerdo (bit 30)
  
  // Configuração responsiva BASE
  const baseConfigAtual = isMobile ? BASE_PISTAO_CONFIG.mobile : BASE_PISTAO_CONFIG.desktop;
  const basePistaoDireitoConfig = baseConfigAtual.direito;
  const basePistaoEsquerdoConfig = baseConfigAtual.esquerdo;

  // Configuração responsiva PISTÃO MÓVEL
  const pistaoConfigAtual = isMobile ? PISTAO_CONFIG.mobile : PISTAO_CONFIG.desktop;
  const pistaoDireitoConfig = pistaoConfigAtual.direito;
  const pistaoEsquerdoConfig = pistaoConfigAtual.esquerdo;

  // Configuração responsiva CILINDROS
  const cilindroConfigAtual = isMobile ? CILINDRO_CONFIG.mobile : CILINDRO_CONFIG.desktop;
  const cilindroDireitoConfig = cilindroConfigAtual.direito;
  const cilindroEsquerdoConfig = cilindroConfigAtual.esquerdo;

  return (
    <div className="w-full h-auto flex flex-col items-center relative">
      {/* Container do Sistema de Enchimento */}
      <div 
        ref={containerRef}
        className="w-full max-w-[1920px] flex flex-col items-center relative z-10"
        style={{
          height: 'auto',
          minHeight: '60vh',
          overflow: 'visible'
        }}
      >
        {isInitialized && containerDimensions.width > 100 && windowDimensions.width > 0 ? (
          <div 
            className="relative w-full flex items-center justify-center"
            style={{
              width: '100%',
              height: '600px',
              minHeight: '600px'
            }}
          >
            {/* BASE PISTÃO ESQUERDO */}
          <div 
            className="absolute"
            style={{
              top: `${(600 * basePistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(600 * basePistaoEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <BasePistaoEnchimento 
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* BASE PISTÃO DIREITO */}
          <div 
            className="absolute"
            style={{
              top: `${(600 * basePistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(600 * basePistaoDireitoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <BasePistaoEnchimento 
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🎯 PISTÃO ESQUERDO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 1 */}
          <div 
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              top: `${(600 * pistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(600 * pistaoEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 10
            }}
          >
            <PistaoEnchimento 
              websocketValue={pistaoEsquerdo}
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* 🎯 PISTÃO DIREITO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 0 */}
          <div 
            className="absolute transition-all duration-200 ease-in-out"
            style={{
              top: `${(600 * pistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(600 * pistaoDireitoConfig.heightPercent) / 100}px`,
              zIndex: 10
            }}
          >
            <PistaoEnchimento 
              websocketValue={pistaoDireito}
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🔧 CILINDRO ESQUERDO - STATUS WORD BIT ÍNDICE 30 */}
          <div 
            className="absolute"
            style={{
              top: `${(600 * cilindroEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(600 * cilindroEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <CilindroEnchimento 
              websocketBit={cilindroEsquerdo}
              side="esquerdo"
              editMode={false}
            />
          </div>

          {/* 🔧 CILINDRO DIREITO - STATUS WORD BIT ÍNDICE 29 */}
          <div 
            className="absolute"
            style={{
              top: `${(600 * cilindroDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroDireitoConfig.widthPercent) / 100}px`,
              height: `${(600 * cilindroDireitoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <CilindroEnchimento 
              websocketBit={cilindroDireito}
              side="direito"
              editMode={false}
            />
          </div>
        </div>
        ) : (
          /* Loading otimizado - mantém proporções corretas */
          <div className="w-full flex items-center justify-center">
            <div 
              className="w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-pulse"
              style={{ 
                height: '600px',
                maxWidth: '800px',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }}
            >
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enchimento;