import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import BasePistaoEnchimento from '../components/Enchimento/BasePistaoEnchimento';
import PistaoEnchimento from '../components/Enchimento/PistaoEnchimento';
import CilindroEnchimento from '../components/Enchimento/CilindroEnchimento';
import PipeSystem from '../components/Enchimento/PipeSystem';

interface EnchimentoProps {
  sidebarOpen?: boolean;
}

// Configuração responsiva da BASE dos pistões - REDUZIDO 30%
const BASE_PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 84.9,
      horizontalPercent: 74.2,
      widthPercent: 18.872, // 26.96 * 0.7 (redução de 30%)
      heightPercent: 50.3216, // 71.888 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 84.9,
      horizontalPercent: 0.9,
      widthPercent: 18.872, // 26.96 * 0.7 (redução de 30%)
      heightPercent: 50.3216, // 71.888 * 0.7 (redução de 30%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 21.84, // 31.2 * 0.7 (redução de 30%)
      heightPercent: 43.68, // 62.4 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 21.84, // 31.2 * 0.7 (redução de 30%)
      heightPercent: 43.68, // 62.4 * 0.7 (redução de 30%)
    }
  }
};

// Configuração responsiva do PISTÃO MÓVEL - REDUZIDO 30%
const PISTAO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 56,
      horizontalPercent: 68.5,
      widthPercent: 30.324, // 43.32 * 0.7 (redução de 30%)
      heightPercent: 75.81, // 108.3 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 56,
      horizontalPercent: -4.8,
      widthPercent: 30.324, // 43.32 * 0.7 (redução de 30%)
      heightPercent: 75.81, // 108.3 * 0.7 (redução de 30%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 50,
      horizontalPercent: 70,
      widthPercent: 35.378, // 50.54 * 0.7 (redução de 30%)
      heightPercent: 60.648, // 86.64 * 0.7 (redução de 30%)
    },
    esquerdo: {
      verticalPercent: 50,
      horizontalPercent: 5,
      widthPercent: 35.378, // 50.54 * 0.7 (redução de 30%)
      heightPercent: 60.648, // 86.64 * 0.7 (redução de 30%)
    }
  }
};

// Configuração responsiva dos CILINDROS - REDUZIDO MAIS 2%
const CILINDRO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 14.5,
      horizontalPercent: 77.8,
      widthPercent: 11.675794, // 11.914076 * 0.98 (redução adicional de 2%)
      heightPercent: 58.37899,  // 59.57040 * 0.98 (redução adicional de 2%)
    },
    esquerdo: {
      verticalPercent: 14.5,
      horizontalPercent: 4.5,
      widthPercent: 11.675794, // 11.914076 * 0.98 (redução adicional de 2%)
      heightPercent: 58.37899,  // 59.57040 * 0.98 (redução adicional de 2%)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 20,
      horizontalPercent: 75,
      widthPercent: 21.892115, // 22.338893 * 0.98 (redução adicional de 2%)
      heightPercent: 63.85199,  // 65.15509 * 0.98 (redução adicional de 2%)
    },
    esquerdo: {
      verticalPercent: 20,
      horizontalPercent: 8,
      widthPercent: 21.892115, // 22.338893 * 0.98 (redução adicional de 2%)
      heightPercent: 63.85199,  // 65.15509 * 0.98 (redução adicional de 2%)
    }
  }
};

// Configuração responsiva do PIPE SYSTEM - para ajustes de posição e altura
const PIPE_SYSTEM_CONFIG = {
  desktop: {
    verticalPercent: -2,      // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,    // % da largura total (posição X) - ajustável  
    widthPercent: 94,       // % da largura total (tamanho) - ajustável
    heightPercent: 94,      // % da altura total (tamanho) - ajustável
  },
  mobile: {
    verticalPercent: 0,      // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,    // % da largura total (posição X) - ajustável
    widthPercent: 100,       // % da largura total (tamanho) - ajustável
    heightPercent: 100,      // % da altura total (tamanho) - ajustável
  }
};

// Configuração responsiva do SUPORTE PISTA - SVG - DOIS ELEMENTOS (ESQUERDO/DIREITO)
const SUPORTE_PISTA_CONFIG = {
  desktop: {
    esquerdo: {
      verticalPercent: 59.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: -7.1,    // % da largura total (posição X) - ajustável
      widthPercent: 35,         // % da largura total (tamanho) - ajustável
      heightPercent: 23,        // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 59.7,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 66.0,    // % da largura total (posição X) - ajustável
      widthPercent: 35,         // % da largura total (tamanho) - ajustável
      heightPercent: 23,        // % da altura total (tamanho) - ajustável
    }
  },
  mobile: {
    esquerdo: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 5,     // % da largura total (posição X) - ajustável
      widthPercent: 50,         // % da largura total (tamanho) - ajustável
      heightPercent: 30,        // % da altura total (tamanho) - ajustável
    },
    direito: {
      verticalPercent: 75,      // % da altura total (posição Y) - ajustável
      horizontalPercent: 45,    // % da largura total (posição X) - ajustável
      widthPercent: 50,         // % da largura total (tamanho) - ajustável
      heightPercent: 30,        // % da altura total (tamanho) - ajustável
    }
  }
};

// Configuração responsiva do BASE FUNDO ENCHIMENTO - SVG DE FUNDO
const BASE_FUNDO_ENCHIMENTO_CONFIG = {
  desktop: {
    verticalPercent: 24,       // % da altura total (posição Y) - ajustável
    horizontalPercent: -12,     // % da largura total (posição X) - ajustável
    widthPercent: 120,        // % da largura total (tamanho) - ajustável
    heightPercent: 120,       // % da altura total (tamanho) - ajustável
  },
  mobile: {
    verticalPercent: 0,       // % da altura total (posição Y) - ajustável
    horizontalPercent: 0,     // % da largura total (posição X) - ajustável
    widthPercent: 100,        // % da largura total (tamanho) - ajustável
    heightPercent: 100,       // % da altura total (tamanho) - ajustável
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

  // 🎯 SISTEMA IDÊNTICO AO PORTA JUSANTE/MONTANTE
  const enchimentoAspectRatio = 1348 / 600; // Baseado no container: width="1348" height="600"
  
  // 📐 EXATAMENTE IGUAL PORTA JUSANTE - maxWidth direto
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  
  // 🎯 ENCHIMENTO: sistema de escala igual PortaJusante
  const enchimentoScale = isMobile ? 90 : 100; // 90% mobile, 100% desktop
  const baseEnchimentoWidth = (maxWidth * enchimentoScale) / 100;
  const baseEnchimentoHeight = baseEnchimentoWidth / enchimentoAspectRatio;
  
  // 🎯 ALTURA TOTAL DINÂMICA - igual sistema PortaJusante
  const alturaTotal = baseEnchimentoHeight;
  
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

  // Extrair bits para tubulações do PipeSystem (converter para number se for boolean)
  const bit9 = Number(plcData?.bit_data?.status_bits?.[0]?.[9] || 0);
  const bit11 = Number(plcData?.bit_data?.status_bits?.[0]?.[11] || 0);
  const bit12 = Number(plcData?.bit_data?.status_bits?.[0]?.[12] || 0);
  const bit13 = Number(plcData?.bit_data?.status_bits?.[0]?.[13] || 0);
  const bit16 = Number(plcData?.bit_data?.status_bits?.[1]?.[0] || 0);
  const bit17 = Number(plcData?.bit_data?.status_bits?.[1]?.[1] || 0);
  const bit18 = Number(plcData?.bit_data?.status_bits?.[1]?.[2] || 0);
  const bit19 = Number(plcData?.bit_data?.status_bits?.[1]?.[3] || 0);
  const bit20 = Number(plcData?.bit_data?.status_bits?.[1]?.[4] || 0);
  const bit21 = Number(plcData?.bit_data?.status_bits?.[1]?.[5] || 0);
  const bit23 = Number(plcData?.bit_data?.status_bits?.[1]?.[7] || 0);
  const bit24 = Number(plcData?.bit_data?.status_bits?.[1]?.[8] || 0);
  const bit25 = Number(plcData?.bit_data?.status_bits?.[1]?.[9] || 0);
  const bit26 = Number(plcData?.bit_data?.status_bits?.[1]?.[10] || 0);
  const bit30 = Number(plcData?.bit_data?.status_bits?.[1]?.[14] || 0);
  const bit31 = Number(plcData?.bit_data?.status_bits?.[1]?.[15] || 0);
  const bit33 = Number(plcData?.bit_data?.status_bits?.[2]?.[1] || 0);
  const bit34 = Number(plcData?.bit_data?.status_bits?.[2]?.[2] || 0);
  const bit36 = Number(plcData?.bit_data?.status_bits?.[2]?.[4] || 0);
  
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

  // Configuração responsiva PIPE SYSTEM
  const pipeSystemConfigAtual = isMobile ? PIPE_SYSTEM_CONFIG.mobile : PIPE_SYSTEM_CONFIG.desktop;

  // Configuração responsiva SUPORTE PISTA
  const suportePistaConfigAtual = isMobile ? SUPORTE_PISTA_CONFIG.mobile : SUPORTE_PISTA_CONFIG.desktop;
  const suportePistaEsquerdoConfig = suportePistaConfigAtual.esquerdo;
  const suportePistaDireitoConfig = suportePistaConfigAtual.direito;

  // Configuração responsiva BASE FUNDO ENCHIMENTO
  const baseFundoEnchimentoConfigAtual = isMobile ? BASE_FUNDO_ENCHIMENTO_CONFIG.mobile : BASE_FUNDO_ENCHIMENTO_CONFIG.desktop;

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
              maxWidth: `${maxWidth}px`,
              height: `${alturaTotal}px`,
              minHeight: `${alturaTotal}px`
            }}
          >
            {/* SISTEMA DE TUBULAÇÕES - BACKGROUND - CONFIGURAÇÃO RESPONSIVA AJUSTÁVEL */}
            <div 
              className="absolute"
              style={{
                // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * pipeSystemConfigAtual.verticalPercent) / 100}px`,
                left: `${(maxWidth * pipeSystemConfigAtual.horizontalPercent) / 100}px`,
                width: `${(maxWidth * pipeSystemConfigAtual.widthPercent) / 100}px`,
                height: `${(alturaTotal * pipeSystemConfigAtual.heightPercent) / 100}px`,
                zIndex: 1
              }}
            >
              <PipeSystem 
                bit9={bit9}
                bit11={bit11}
                bit12={bit12}
                bit13={bit13}
                bit16={bit16}
                bit17={bit17}
                bit18={bit18}
                bit19={bit19}
                bit20={bit20}
                bit21={bit21}
                bit23={bit23}
                bit24={bit24}
                bit25={bit25}
                bit26={bit26}
                bit30={bit30}
                bit31={bit31}
                bit33={bit33}
                bit34={bit34}
                bit36={bit36}
                editMode={false}
              />
            </div>

            {/* 🏗️ BASE FUNDO ENCHIMENTO - SVG DE FUNDO - ATRÁS DOS PISTÕES MAS NA FRENTE DA BASE */}
            <div 
              className="absolute"
              style={{
                // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * baseFundoEnchimentoConfigAtual.verticalPercent) / 100}px`,
                left: `${(maxWidth * baseFundoEnchimentoConfigAtual.horizontalPercent) / 100}px`,
                width: `${(maxWidth * baseFundoEnchimentoConfigAtual.widthPercent) / 100}px`,
                height: `${(alturaTotal * baseFundoEnchimentoConfigAtual.heightPercent) / 100}px`,
                zIndex: 8
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1348 600"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
              >
                <image
                  href="/Enchimento/Base_Fundo_Enchimento.svg"
                  width="1348"
                  height="600"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>

            {/* BASE PISTÃO ESQUERDO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * basePistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * basePistaoEsquerdoConfig.heightPercent) / 100}px`,
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
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * basePistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * basePistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * basePistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * basePistaoDireitoConfig.heightPercent) / 100}px`,
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
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * pistaoEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * pistaoEsquerdoConfig.heightPercent) / 100}px`,
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
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * pistaoDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * pistaoDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * pistaoDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * pistaoDireitoConfig.heightPercent) / 100}px`,
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
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * cilindroEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * cilindroEsquerdoConfig.heightPercent) / 100}px`,
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
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * cilindroDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * cilindroDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * cilindroDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * cilindroDireitoConfig.heightPercent) / 100}px`,
              zIndex: 5
            }}
          >
            <CilindroEnchimento 
              websocketBit={cilindroDireito}
              side="direito"
              editMode={false}
            />
          </div>

          {/* 🏗️ SUPORTE PISTA ESQUERDO - SVG ESTÁTICO - Z-INDEX MAIS ALTO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * suportePistaEsquerdoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * suportePistaEsquerdoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * suportePistaEsquerdoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * suportePistaEsquerdoConfig.heightPercent) / 100}px`,
              zIndex: 15
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <image
                href="/Enchimento/SuportePista.svg"
                width="400"
                height="200"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
          </div>

          {/* 🏗️ SUPORTE PISTA DIREITO - SVG ESTÁTICO - Z-INDEX MAIS ALTO */}
          <div 
            className="absolute"
            style={{
              // 📐 SISTEMA IDÊNTICO PORTA JUSANTE: maxWidth horizontal + alturaTotal vertical
              top: `${(alturaTotal * suportePistaDireitoConfig.verticalPercent) / 100}px`,
              left: `${(maxWidth * suportePistaDireitoConfig.horizontalPercent) / 100}px`,
              width: `${(maxWidth * suportePistaDireitoConfig.widthPercent) / 100}px`,
              height: `${(alturaTotal * suportePistaDireitoConfig.heightPercent) / 100}px`,
              zIndex: 15
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 200"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <image
                href="/Enchimento/SuportePista.svg"
                width="400"
                height="200"
                preserveAspectRatio="xMidYMid meet"
              />
            </svg>
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