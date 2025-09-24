import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import ContraPeso60t from '../components/Porta_Jusante/Porta_Jusante_Contrapeso';
import PortaJusanteRegua from '../components/Porta_Jusante/PortaJusanteRegua';
import MotorJusante from '../components/Porta_Jusante/Motor_Jusante';
import { Card } from '../components/ui/Card';
import { 
  CogIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlayIcon,
  StopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';


interface PortaJusanteProps {
  sidebarOpen?: boolean;
}

// 🏗️ CONFIGURAÇÃO DOS CONTRAPESOS E RÉGUA - SEPARADO MOBILE/DESKTOP
const CONTRAPESO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 42.7,    // % da altura total (posição Y)
      horizontalPercent: 70,  // % da largura total (posição X)
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    },
    esquerdo: {
      verticalPercent: 42.7,    // % da altura total (posição Y)
      horizontalPercent: 22,  // % da largura total (posição X)
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
    verticalPercent: 46,      // % da altura total (posição Y)
    horizontalPercent: 29,    // % da largura total (posição X) - VOLTA POSIÇÃO ORIGINAL
    widthPercent: 42,         // % da largura total (tamanho) - 2% MENOR
    heightPercent: 52,        // % da altura total (tamanho) - 2% MENOR
  },
  mobile: {
    verticalPercent: 46,      // % da altura total (posição Y)
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
      horizontalPercent: 70,    // % da largura total (posição X)
      widthPercent: 7.4,        // % da largura total (tamanho) - 45% menor
      heightPercent: 9.2,       // % da altura total (tamanho) - 45% menor
    },
    esquerdo: {
      verticalPercent: -1,      // % da altura total (posição Y)
      horizontalPercent: 22.6,    // % da largura total (posição X)
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
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [windowDimensions, setWindowDimensions] = React.useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [menuParametrosOpen, setMenuParametrosOpen] = React.useState(false);

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
          setContainerDimensions({ width, height: width / 5.7 });
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
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Detectar se é mobile - otimizado para evitar recálculos
  const isMobile = React.useMemo(() => windowDimensions.width < 1024, [windowDimensions.width]);

  // 🎯 SISTEMA IDÊNTICO AO ECLUSA_REGUA - SEM ESCALA RESPONSIVA
  const portaJusanteAspectRatio = 1075 / 1098; // Baseado no SVG real: width="1075" height="1098"
  
  // 📐 EXATAMENTE IGUAL ECLUSA_REGUA - maxWidth direto
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  
  // 🎯 PORTA JUSANTE: maxWidth direto igual caldeira na Eclusa_Regua  
  const portaScale = isMobile ? 90 : 55; // 90% mobile, 100% desktop
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
  
  // Configuração responsiva SIMPLES - igual outros componentes
  const configAtual = isMobile ? CONTRAPESO_CONFIG.mobile : CONTRAPESO_CONFIG.desktop;
  const contrapesoDireitoConfig = configAtual.direito;
  const contrapesoEsquerdoConfig = configAtual.esquerdo;
  
  const reguaConfigAtual = isMobile ? REGUA_CONFIG.mobile : REGUA_CONFIG.desktop;
  
  const motorConfigAtual = isMobile ? MOTOR_CONFIG.mobile : MOTOR_CONFIG.desktop;
  const motorDireitoConfig = motorConfigAtual.direito;
  const motorEsquerdoConfig = motorConfigAtual.esquerdo;
  
  // CÁLCULO DO ESPAÇO DISPONÍVEL REAL
  const espacoTotalLateral = windowDimensions.width > maxWidth ? 
    (windowDimensions.width - maxWidth) / 2 : 0;
  
  const espacoDisponivelEsquerda = Math.max(0, espacoTotalLateral - 20); // -20px margem
  const espacoDisponivelDireita = Math.max(0, espacoTotalLateral - 20); // -20px margem

  // Debug completo do espaço disponível
  console.log('📐 ESPAÇO DISPONÍVEL REAL:', {
    tela_largura: windowDimensions.width,
    componentes_largura_maxima: maxWidth,
    componentes_largura_real: basePortaWidth,
    espaco_total_lateral: espacoTotalLateral,
    espaco_disponivel_esquerda: espacoDisponivelEsquerda,
    espaco_disponivel_direita: espacoDisponivelDireita,
    altura_total_componentes: alturaTotal,
    pode_usar_laterais: espacoDisponivelEsquerda > 200,
    condicao_esquerda: espacoDisponivelEsquerda > 200,
    condicao_direita: espacoDisponivelDireita > 200 && windowDimensions.width >= 1800,
    config_usada: isMobile ? 'mobile' : 'desktop',
    isMobile: isMobile
  });

  return (
    <div className="w-full h-auto flex flex-col items-center relative">

      {/* PAINEL INDUSTRIAL ISA-104 - ESQUERDA */}
      {!isMobile && espacoDisponivelEsquerda > 100 && (
        <div 
          className="absolute top-16 z-0 flex flex-col gap-3"
          style={{ 
            left: '20px',
            width: `${Math.max(250, Math.min(espacoDisponivelEsquerda - 30, windowDimensions.width <= 1536 ? 300 : 400))}px`,
            maxHeight: 'calc(100vh - 200px)'
          }}
        >
          {/* DADOS OPERACIONAIS - RETÂNGULO ÚNICO MODERNO */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="text-sm font-bold text-[#00A3E0] uppercase tracking-wide mb-4 border-b border-slate-600 pb-2">
              DADOS OPERACIONAIS
            </div>
            
            {/* POSIÇÃO */}
            <div className="mb-3">
              <div className="text-xs font-medium text-green-400 uppercase tracking-wide mb-1">POSIÇÃO PORTA</div>
              <div className="text-2xl font-mono font-bold text-white">
                {(reguaPortaJusante * 12.5 / 100).toFixed(2)} <span className="text-sm text-slate-400">m</span>
              </div>
              <div className="text-xs text-slate-400">Abertura: {reguaPortaJusante}%</div>
            </div>

            {/* DIFERENÇA */}
            <div className="mb-3">
              <div className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-1">DIFERENÇA E/D</div>
              <div className="text-xl font-mono font-bold text-white">
                {Math.abs(contrapesoEsquerdo - contrapesoDirecto).toFixed(1)} <span className="text-sm text-slate-400">mm</span>
              </div>
              <div className="text-xs text-slate-400">E:{contrapesoEsquerdo}% D:{contrapesoDirecto}%</div>
            </div>

            {/* VELOCIDADE */}
            <div>
              <div className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">VELOCIDADE</div>
              <div className="text-xl font-mono font-bold text-white">
                {(Math.random() * 0.5 + 0.1).toFixed(2)} <span className="text-sm text-slate-400">m/s</span>
              </div>
              <div className="text-xs text-slate-400">Nominal: 0.25 m/s</div>
            </div>
          </div>

          {/* STATUS OPERACIONAIS - 3 RETÂNGULOS EDP */}
          <div className="flex flex-col gap-2">
            {/* COMANDO AUTOMÁTICO - AZUL EDP */}
            <div className="bg-[#00A3E0] border border-blue-500 rounded-md p-3">
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wide">
                  COMANDO EM AUTOMÁTICO
                </div>
              </div>
            </div>

            {/* IGUALDADE NÍVEIS PRESENTE - VERDE */}
            <div className="bg-green-600 border border-green-500 rounded-md p-3">
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wide">
                  IGUALDADE DE NÍVEIS PRESENTE
                </div>
              </div>
            </div>

            {/* FALTA IGUALDADE NÍVEIS - VERMELHO */}
            <div className="bg-red-600 border border-red-500 rounded-md p-3">
              <div className="text-center">
                <div className="text-xs font-bold text-white uppercase tracking-wide">
                  FALTA IGUALDADE DE NÍVEIS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL INDUSTRIAL ISA-104 - DIREITA */}
      {!isMobile && espacoDisponivelDireita > 100 && windowDimensions.width >= 1500 && (
        <div 
          className="absolute top-16 z-0 flex flex-col gap-3"
          style={{ 
            right: '20px',
            width: `${Math.max(250, Math.min(espacoDisponivelDireita - 30, windowDimensions.width <= 1536 ? 300 : 400))}px`,
            maxHeight: 'calc(100vh - 200px)'
          }}
        >
          {/* MOTORES - RETÂNGULO ÚNICO MODERNO */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="text-sm font-bold text-[#00A3E0] uppercase tracking-wide mb-4 border-b border-slate-600 pb-2">
              MOTORES
            </div>
            
            {/* MOTOR DIREITO */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-green-400 uppercase tracking-wide">MOTOR DIREITO</div>
                <div className={`w-3 h-3 rounded-full ${motorDireito === 1 ? 'bg-green-500' : motorDireito === 2 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-mono font-bold text-white">
                  {Math.round(1450 + Math.random() * 100)} <span className="text-xs text-slate-400">RPM</span>
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  {(12.5 + Math.random() * 2).toFixed(1)} <span className="text-xs text-slate-400">A</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-600 my-3"></div>

            {/* MOTOR ESQUERDO */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-green-400 uppercase tracking-wide">MOTOR ESQUERDO</div>
                <div className={`w-3 h-3 rounded-full ${motorEsquerdo === 1 ? 'bg-green-500' : motorEsquerdo === 2 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-mono font-bold text-white">
                  {Math.round(1450 + Math.random() * 100)} <span className="text-xs text-slate-400">RPM</span>
                </div>
                <div className="text-lg font-mono font-bold text-white">
                  {(12.5 + Math.random() * 2).toFixed(1)} <span className="text-xs text-slate-400">A</span>
                </div>
              </div>
            </div>
          </div>

          {/* SISTEMA STATUS - RETÂNGULO ÚNICO MODERNO */}
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="text-sm font-bold text-[#00A3E0] uppercase tracking-wide mb-4 border-b border-slate-600 pb-2">
              SISTEMA
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pressão:</span>
                <span className="text-white font-mono font-bold">2.4 bar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Temperatura:</span>
                <span className="text-white font-mono font-bold">24.5°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Vibração:</span>
                <span className="text-green-400 font-mono font-bold">NORMAL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status Geral:</span>
                <span className="text-green-400 font-mono font-bold">OPERACIONAL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO MENU PARÂMETROS - FLUTUANTE */}
      {!isMobile && (
        <button
          onClick={() => setMenuParametrosOpen(!menuParametrosOpen)}
          className={`fixed top-20 right-6 z-30 w-12 h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            menuParametrosOpen 
              ? 'bg-[#00A3E0] text-white shadow-xl scale-110' 
              : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl'
          }`}
          title="Menu Parâmetros da Porta"
        >
          <CogIcon className={`w-6 h-6 transition-transform duration-300 ${menuParametrosOpen ? 'rotate-90' : ''}`} />
        </button>
      )}

      {/* DIALOG PARÂMETROS - FLUTUANTE E MODERNO */}
      {menuParametrosOpen && (
        <div 
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          onClick={() => setMenuParametrosOpen(false)}
        >
          {/* Dialog Container */}
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header azul escuro EDP */}
            <div className="bg-[#212E3E] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CogIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">PARÂMETROS DA PORTA</h2>
                    <p className="text-gray-300 text-sm">Configurações e Monitoramento Industrial</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuParametrosOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo com scroll */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* PROGRAMA ABERTURA AUTOMÁTICA */}
                <Card 
                  title="PROGRAMA ABERTURA" 
                  icon={<ArrowUpIcon className="w-5 h-5" />}
                  variant="default"
                  className="h-fit"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Posição Alvo:</span>
                      <span className="text-xl font-mono font-bold text-gray-900">8.50 m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">RPM Configurado:</span>
                      <div className="flex items-center gap-2">
                        <ArrowUpIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-lg font-mono font-bold text-gray-900">1450 RPM</span>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                        <PlayIcon className="w-4 h-4" />
                        INICIAR
                      </button>
                      <button className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                        <StopIcon className="w-4 h-4" />
                        PARAR
                      </button>
                    </div>
                  </div>
                </Card>

                {/* PROGRAMA FECHAMENTO AUTOMÁTICO */}
                <Card 
                  title="PROGRAMA FECHAMENTO" 
                  icon={<ArrowDownIcon className="w-5 h-5" />}
                  variant="default"
                  className="h-fit"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Posição Alvo:</span>
                      <span className="text-xl font-mono font-bold text-gray-900">0.00 m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">RPM Configurado:</span>
                      <div className="flex items-center gap-2">
                        <ArrowDownIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-lg font-mono font-bold text-gray-900">1200 RPM</span>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                        <PlayIcon className="w-4 h-4" />
                        INICIAR
                      </button>
                      <button className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                        <StopIcon className="w-4 h-4" />
                        PARAR
                      </button>
                    </div>
                  </div>
                </Card>

                {/* PARÂMETROS LASER JUSANTE */}
                <Card 
                  title="LASER JUSANTE" 
                  icon={<EyeIcon className="w-5 h-5" />}
                  variant="default"
                  className="h-fit"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Área Protegida:</span>
                      <span className="text-lg font-mono font-bold text-slate-700">LIVRE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Leitura Cota:</span>
                      <span className="text-lg font-mono font-bold text-gray-900">
                        {(reguaPortaJusante * 12.5 / 100 + 125.5).toFixed(2)} m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="text-lg font-mono font-bold text-slate-700">OPERACIONAL</span>
                    </div>
                  </div>
                </Card>

                {/* LIMITES E ALARMES */}
                <Card 
                  title="LIMITES & ALARMES" 
                  icon={<ShieldCheckIcon className="w-5 h-5" />}
                  variant="default"
                  className="h-fit"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Limite Abertura:</span>
                          <span className="text-gray-900 font-mono font-bold">12.50 m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Limite Fecho:</span>
                          <span className="text-gray-900 font-mono font-bold">0.00 m</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Desnível Defeito:</span>
                          <span className="text-slate-600 font-mono font-bold">±5 mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Desnível Stop:</span>
                          <span className="text-slate-700 font-mono font-bold">±10 mm</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Desnível Alarme:</span>
                        <span className="text-slate-800 font-mono font-bold text-lg">±15 mm</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>
            </div>

            {/* Footer com ações */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMenuParametrosOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Fechar
                </button>
                <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-[#212E3E] rounded-lg transition-colors font-bold">
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Container do SVG - SISTEMA ORIGINAL INALTERADO */}
      <div 
        ref={containerRef}
        className="w-full max-w-[1920px] flex flex-col items-center relative z-10"
        style={{
          height: 'auto',
          minHeight: '50vh',
          overflow: 'visible'
        }}
      >

        {isInitialized && containerDimensions.width > 100 && windowDimensions.width > 0 ? (
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

            {/* 🎯 CONTRAPESO DIREITO - COM MOVIMENTO PROPORCIONAL */}
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

            {/* 🎯 CONTRAPESO ESQUERDO - COM MOVIMENTO PROPORCIONAL */}
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

            {/* 🚪 INDICADOR STATUS PORTA - ÚNICO (CONDICIONAL) */}
            {reguaPortaJusante >= 95 && (
              <div 
                className="absolute flex items-center justify-center z-20"
                style={{
                  top: `${(alturaTotal * 5) / 100}px`, // 5% do topo
                  left: `${(maxWidth * 42) / 100}px`, // Centralizado
                  width: `${(maxWidth * 16) / 100}px`, // Mais largo
                  height: `${(alturaTotal * 6) / 100}px` // Menor altura
                }}
              >
                <div className="bg-green-600 border border-green-500 rounded-md p-3 w-full">
                  <div className="text-center">
                    <div className="text-xs font-bold text-white uppercase tracking-wide">
                      PORTA ABERTA
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reguaPortaJusante <= 5 && (
              <div 
                className="absolute flex items-center justify-center z-20"
                style={{
                  bottom: `${(alturaTotal * 5) / 100}px`, // 5% do fundo
                  left: `${(maxWidth * 42) / 100}px`, // Centralizado
                  width: `${(maxWidth * 16) / 100}px`, // Mais largo
                  height: `${(alturaTotal * 6) / 100}px` // Menor altura
                }}
              >
                <div className="bg-yellow-600 border border-yellow-500 rounded-md p-3 w-full">
                  <div className="text-center">
                    <div className="text-xs font-bold text-white uppercase tracking-wide">
                      PORTA FECHADA
                    </div>
                  </div>
                </div>
              </div>
            )}


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

export default PortaJusante;