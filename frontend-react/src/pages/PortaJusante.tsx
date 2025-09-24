import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import ContraPeso60t from '../components/Porta_Jusante/Porta_Jusante_Contrapeso';
import PortaJusanteRegua from '../components/Porta_Jusante/PortaJusanteRegua';
import MotorJusante from '../components/Porta_Jusante/Motor_Jusante';

interface PortaJusanteProps {
  sidebarOpen?: boolean;
}

// 🏗️ CONFIGURAÇÃO DOS CONTRAPESOS E RÉGUA - SEPARADO MOBILE/DESKTOP
const CONTRAPESO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 42.9,    // % da altura total (posição Y)
      horizontalPercent: 67.8,  // % da largura total (posição X)
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    },
    esquerdo: {
      verticalPercent: 42.8,    // % da altura total (posição Y)
      horizontalPercent: 24.2,  // % da largura total (posição X)
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    }
  },
  mobile: {
    direito: {
      verticalPercent: 36.8,    // % da altura total (posição Y) - mesmo que desktop
      horizontalPercent: 85.3,  // % da largura total (posição X) - ajustado para mobile
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    },
    esquerdo: {
      verticalPercent: 36.8,    // % da altura total (posição Y) - mesmo que desktop
      horizontalPercent: 6.8,  // % da largura total (posição X) - ajustado para mobile
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    }
  }
};

// 📏 CONFIGURAÇÃO DA RÉGUA PORTA JUSANTE - SEPARADO MOBILE/DESKTOP
const REGUA_CONFIG = {
  desktop: {
    verticalPercent: 25,      // % da altura total (posição Y)
    horizontalPercent: 32.5,    // % da largura total (posição X)
    widthPercent: 35,         // % da largura total (tamanho) - MAIOR
    heightPercent: 80,        // % da altura total (tamanho) - MAIOR
  },
  mobile: {
    verticalPercent: 25,      // % da altura total (posição Y)
    horizontalPercent: 26,    // % da largura total (posição X) - ajustado para mobile
    widthPercent: 48,         // % da largura total (tamanho) - MAIOR no mobile
    heightPercent: 83,        // % da altura total (tamanho) - MAIOR
  }
};

// ⚙️ CONFIGURAÇÃO DOS MOTORES PORTA JUSANTE - SEPARADO MOBILE/DESKTOP
const MOTOR_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: -1,      // % da altura total (posição Y)
      horizontalPercent: 67.5,    // % da largura total (posição X)
      widthPercent: 7.4,        // % da largura total (tamanho) - 45% menor
      heightPercent: 9.2,       // % da altura total (tamanho) - 45% menor
    },
    esquerdo: {
      verticalPercent: -1,      // % da altura total (posição Y)
      horizontalPercent: 25,    // % da largura total (posição X)
      widthPercent: 7.4,        // % da largura total (tamanho) - 45% menor
      heightPercent: 9.2,       // % da altura total (tamanho) - 45% menor
    }
  },
  mobile: {
    direito: {
      verticalPercent: -4,      // % da altura total (posição Y)
      horizontalPercent: 81.5,    // % da largura total (posição X)
      widthPercent: 13.5,       // % da largura total (tamanho) - 10% menor
      heightPercent: 16.2,      // % da altura total (tamanho) - 10% menor
    },
    esquerdo: {
      verticalPercent: -4,      // % da altura total (posição Y)
      horizontalPercent: 5,    // % da largura total (posição X)
      widthPercent: 13.5,       // % da largura total (tamanho) - 10% menor
      heightPercent: 16.2,      // % da altura total (tamanho) - 10% menor
    }
  }
};


const PortaJusante: React.FC<PortaJusanteProps> = ({ sidebarOpen = true }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth - 32, 1920);
      return { width, height: width / 5.7 };
    }
    return { width: 0, height: 0 };
  });
  const [windowDimensions, setWindowDimensions] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 0, height: 0 };
  });

  React.useEffect(() => {
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
    
    const timeoutId = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Detectar se é mobile
  const isMobile = windowDimensions.width < 1024;

  // 🎯 SISTEMA IDÊNTICO AO ECLUSA_REGUA - SEM ESCALA RESPONSIVA
  const portaJusanteAspectRatio = 1075 / 1098; // Baseado no SVG real: width="1075" height="1098"
  
  // 📐 EXATAMENTE IGUAL ECLUSA_REGUA - maxWidth direto
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  
  // 🎯 PORTA JUSANTE: maxWidth direto igual caldeira na Eclusa_Regua  
  const portaScale = isMobile ? 90 : 50; // 90% mobile, 50% desktop
  const basePortaWidth = (maxWidth * portaScale) / 100;
  const basePortaHeight = basePortaWidth / portaJusanteAspectRatio;
  
  // 🎯 ALTURA TOTAL FIXA - igual sistema Eclusa_Regua
  const alturaTotal = basePortaHeight;
  
  // 📡 USAR O SISTEMA PLC EXISTENTE (sem criar nova conexão!)
  const { data: plcData } = usePLC();
  
  // Extrair dados dos contrapesos, régua e motores do PLC
  const contrapesoDirecto = plcData?.ints?.[40] || 0;   // Contrapeso direito (índice 40)
  const contrapesoEsquerdo = plcData?.ints?.[41] || 0;  // Contrapeso esquerdo (índice 41)
  const reguaPortaJusante = plcData?.ints?.[39] || 0;   // Régua porta jusante (índice 39)
  const motorDireito = plcData?.ints?.[28] || 0;        // Motor direito (índice 28)
  const motorEsquerdo = plcData?.ints?.[29] || 0;       // Motor esquerdo (índice 29)
  
  // Configuração responsiva dos contrapesos, régua e motores
  const configAtual = isMobile ? CONTRAPESO_CONFIG.mobile : CONTRAPESO_CONFIG.desktop;
  const contrapesoDireitoConfig = configAtual.direito;
  const contrapesoEsquerdoConfig = configAtual.esquerdo;
  
  const reguaConfigAtual = isMobile ? REGUA_CONFIG.mobile : REGUA_CONFIG.desktop;
  
  const motorConfigAtual = isMobile ? MOTOR_CONFIG.mobile : MOTOR_CONFIG.desktop;
  const motorDireitoConfig = motorConfigAtual.direito;
  const motorEsquerdoConfig = motorConfigAtual.esquerdo;
  
  // Debug das dimensões
  console.log('🔍 PortaJusante - Sistema com Configuração Responsiva:', {
    tela: { width: windowDimensions.width, height: windowDimensions.height },
    container: { width: containerDimensions.width, height: containerDimensions.height },
    maxWidth: maxWidth,
    config_usada: isMobile ? 'mobile' : 'desktop',
    porta: { width: basePortaWidth, height: basePortaHeight },
    altura_total: alturaTotal,
    portaScale: portaScale,
    aspectRatio: portaJusanteAspectRatio,
    contrapesos: { 
      direito: { valor: contrapesoDirecto, config: contrapesoDireitoConfig },
      esquerdo: { valor: contrapesoEsquerdo, config: contrapesoEsquerdoConfig }
    },
    regua: { valor: reguaPortaJusante, config: reguaConfigAtual },
    isMobile
  });

  return (
    <div className="w-full h-auto flex flex-col items-center">

      {/* Container do SVG - SISTEMA IDÊNTICO AO ECLUSA_REGUA */}
      <div 
        ref={containerRef}
        className="w-full max-w-[1920px] flex flex-col items-center relative"
        style={{
          height: 'auto',
          minHeight: '50vh',
          overflow: 'visible'
        }}
      >

        {containerDimensions.width > 100 && windowDimensions.width > 0 ? (
          <div 
            className="relative w-full flex flex-col items-center justify-center"
            style={{
              maxWidth: `${maxWidth}px`,
              height: `${alturaTotal}px`,
              minHeight: `${alturaTotal}px`
            }}
          >
            {/* SVG Base Porta Jusante - CENTRALIZADO */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${basePortaWidth}px`,
                height: `${basePortaHeight}px`,
                zIndex: 1
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 1075 1098"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full drop-shadow-sm"
              >
                <image
                  href="/PortaJusante/Base_PortaJusante.svg"
                  width="1075"
                  height="1098"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>

            {/* 🎯 CONTRAPESO DIREITO - EXATAMENTE COMO ECLUSA_REGUA */}
            <div 
              className="absolute transition-all duration-200 ease-in-out"
              style={{
                // 📐 SISTEMA IDÊNTICO ECLUSA_REGUA: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * contrapesoDireitoConfig.verticalPercent) / 100}px`,
                left: `${(maxWidth * contrapesoDireitoConfig.horizontalPercent) / 100}px`,
                width: `${(maxWidth * contrapesoDireitoConfig.widthPercent) / 100}px`,
                height: `${(alturaTotal * contrapesoDireitoConfig.heightPercent) / 100}px`,
                zIndex: 10
              }}
            >
              <ContraPeso60t 
                websocketValue={contrapesoDirecto}
                editMode={false}
              />
            </div>

            {/* 🎯 CONTRAPESO ESQUERDO - EXATAMENTE COMO ECLUSA_REGUA */}
            <div 
              className="absolute transition-all duration-200 ease-in-out"
              style={{
                // 📐 SISTEMA IDÊNTICO ECLUSA_REGUA: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * contrapesoEsquerdoConfig.verticalPercent) / 100}px`,
                left: `${(maxWidth * contrapesoEsquerdoConfig.horizontalPercent) / 100}px`,
                width: `${(maxWidth * contrapesoEsquerdoConfig.widthPercent) / 100}px`,
                height: `${(alturaTotal * contrapesoEsquerdoConfig.heightPercent) / 100}px`,
                zIndex: 10
              }}
            >
              <ContraPeso60t 
                websocketValue={contrapesoEsquerdo}
                editMode={false}
              />
            </div>

            {/* 📏 RÉGUA PORTA JUSANTE - WEBSOCKET ÍNDICE 39 */}
            <div 
              className="absolute transition-all duration-200 ease-in-out"
              style={{
                // 📐 SISTEMA IDÊNTICO ECLUSA_REGUA: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * reguaConfigAtual.verticalPercent) / 100}px`,
                left: `${(maxWidth * reguaConfigAtual.horizontalPercent) / 100}px`,
                width: `${(maxWidth * reguaConfigAtual.widthPercent) / 100}px`,
                height: `${(alturaTotal * reguaConfigAtual.heightPercent) / 100}px`,
                zIndex: 5
              }}
            >
              <PortaJusanteRegua 
                websocketValue={reguaPortaJusante}
                editMode={false}
              />
            </div>

            {/* ⚙️ MOTOR DIREITO - WEBSOCKET ÍNDICE 28 */}
            <div 
              className="absolute transition-all duration-200 ease-in-out"
              style={{
                // 📐 SISTEMA IDÊNTICO ECLUSA_REGUA: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * motorDireitoConfig.verticalPercent) / 100}px`,
                left: `${(maxWidth * motorDireitoConfig.horizontalPercent) / 100}px`,
                width: `${(maxWidth * motorDireitoConfig.widthPercent) / 100}px`,
                height: `${(alturaTotal * motorDireitoConfig.heightPercent) / 100}px`,
                zIndex: 15
              }}
            >
              <MotorJusante 
                websocketValue={motorDireito}
                editMode={false}
                direction="left"
              />
            </div>

            {/* ⚙️ MOTOR ESQUERDO - WEBSOCKET ÍNDICE 29 - ESPELHADO */}
            <div 
              className="absolute transition-all duration-200 ease-in-out"
              style={{
                // 📐 SISTEMA IDÊNTICO ECLUSA_REGUA: maxWidth horizontal + alturaTotal vertical
                top: `${(alturaTotal * motorEsquerdoConfig.verticalPercent) / 100}px`,
                left: `${(maxWidth * motorEsquerdoConfig.horizontalPercent) / 100}px`,
                width: `${(maxWidth * motorEsquerdoConfig.widthPercent) / 100}px`,
                height: `${(alturaTotal * motorEsquerdoConfig.heightPercent) / 100}px`,
                zIndex: 15
              }}
            >
              <MotorJusante 
                websocketValue={motorEsquerdo}
                editMode={false}
                direction="right"
              />
            </div>


          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <div 
              className="w-full bg-gray-100 rounded-lg animate-pulse"
              style={{ 
                height: isMobile ? '200px' : '300px',
                maxWidth: '800px'
              }}
            />
          </div>
        )}

      </div>

    </div>
  );
};

export default PortaJusante;