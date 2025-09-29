import React from 'react';
import { usePLC } from '../contexts/PLCContext';
import ContraPeso20t from '../components/Porta_Montante/Porta_Montante_Contrapeso';
import PortaMontanteRegua from '../components/Porta_Montante/PortaMontanteRegua';
import MotorMontante from '../components/Porta_Montante/Motor_Montante';
import { Card } from '../components/ui/Card';
import { InfoCard } from '../components/ui/InfoCard';
import { StatusCard } from '../components/ui/StatusCard';
import { 
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';


interface PortaMontanteProps {
  sidebarOpen?: boolean;
}

// 🏗️ CONFIGURAÇÃO DOS CONTRAPESOS E RÉGUA - SEPARADO MOBILE/DESKTOP
const CONTRAPESO_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 40.7,    // % da altura total (posição Y)
      horizontalPercent: 68.65,  // % da largura total (posição X)
      widthPercent: 8,          // % da largura total (tamanho)
      heightPercent: 60,        // % da altura total (tamanho)
    },
    esquerdo: {
      verticalPercent: 40.7,    // % da altura total (posição Y)
      horizontalPercent: 23.75,  // % da largura total (posição X)
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

// 📏 CONFIGURAÇÃO DA RÉGUA PORTA MONTANTE - SEPARADO MOBILE/DESKTOP
const REGUA_CONFIG = {
  desktop: {
    verticalPercent: 20,      // % da altura total (posição Y)
    horizontalPercent: 20.95,    // % da largura total (posição X) - VOLTA POSIÇÃO ORIGINAL
    widthPercent: 58.16,      // % da largura total (tamanho) +34% (57.02 * 1.02)
    heightPercent: 72.00,     // % da altura total (tamanho) +34% (70.59 * 1.02)
  },
  mobile: {
    verticalPercent: 46,      // % da altura total (posição Y)
    horizontalPercent: 26,    // % da largura total (posição X) - ajustado para mobile
    widthPercent: 66.47,      // % da largura total (tamanho) +34% (65.17 * 1.02)
    heightPercent: 114.93,    // % da altura total (tamanho) +34% (112.68 * 1.02)
  }
};


// ⚙️ CONFIGURAÇÃO DOS MOTORES PORTA MONTANTE - SEPARADO MOBILE/DESKTOP
const MOTOR_CONFIG = {
  desktop: {
    direito: {
      verticalPercent: 3.75,      // % da altura total (posição Y)
      horizontalPercent: 69.3,    // % da largura total (posição X)
      widthPercent: 7.4,        // % da largura total (tamanho) - 45% menor
      heightPercent: 9.2,       // % da altura total (tamanho) - 45% menor
    },
    esquerdo: {
      verticalPercent: 3.9,      // % da altura total (posição Y)
      horizontalPercent: 23.25,    // % da largura total (posição X)
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


const PortaMontante: React.FC<PortaMontanteProps> = ({ sidebarOpen = true }) => {
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
  }, []); // Não incluir sidebarOpen para evitar recálculos desnecessários

  // Detectar se é mobile - otimizado para evitar recálculos
  const isMobile = React.useMemo(() => windowDimensions.width < 1024, [windowDimensions.width]);

  // 🎯 SISTEMA IDÊNTICO AO ECLUSA_REGUA - SEM ESCALA RESPONSIVA
  const portaMontanteAspectRatio = 1075 / 1098; // Baseado no SVG real: width="1075" height="1098"
  
  // 📐 EXATAMENTE IGUAL ECLUSA_REGUA - maxWidth direto - MANTER CÁLCULO ORIGINAL
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  
  // 🎯 PORTA MONTANTE: maxWidth direto igual caldeira na Eclusa_Regua  
  const portaScale = isMobile ? 90 : 55; // 90% mobile, 55% desktop
  const basePortaWidth = (maxWidth * portaScale) / 100;
  const basePortaHeight = basePortaWidth / portaMontanteAspectRatio;
  
  // 🎯 ALTURA TOTAL FIXA - igual sistema Eclusa_Regua
  const alturaTotal = basePortaHeight;
  
  // 📡 USAR O SISTEMA PLC EXISTENTE (sem criar nova conexão!)
  const { data: plcData } = usePLC();
  
  // Extrair dados dos contrapesos, régua e motores do PLC - PORTA MONTANTE
  const contrapesoDirecto = plcData?.ints?.[57] || 0;   // Contrapeso direito (índice 57)
  const contrapesoEsquerdo = plcData?.ints?.[58] || 0;  // Contrapeso esquerdo (índice 58)
  const reguaPortaMontante = plcData?.ints?.[56] || 0;   // Régua porta montante (índice 56)
  const motorDireito = plcData?.ints?.[50] || 0;        // Motor direito (índice 50)
  const motorEsquerdo = plcData?.ints?.[51] || 0;       // Motor esquerdo (índice 51)
  
  // Configuração responsiva SIMPLES - igual outros componentes
  const configAtual = isMobile ? CONTRAPESO_CONFIG.mobile : CONTRAPESO_CONFIG.desktop;
  const contrapesoDireitoConfig = configAtual.direito;
  const contrapesoEsquerdoConfig = configAtual.esquerdo;
  
  const reguaConfigAtual = isMobile ? REGUA_CONFIG.mobile : REGUA_CONFIG.desktop;
  
  const motorConfigAtual = isMobile ? MOTOR_CONFIG.mobile : MOTOR_CONFIG.desktop;
  const motorDireitoConfig = motorConfigAtual.direito;
  const motorEsquerdoConfig = motorConfigAtual.esquerdo;
  
  
  // CÁLCULO DO ESPAÇO DISPONÍVEL REAL - SEM CONSIDERAR SIDEBAR
  const larguraTotalTela = windowDimensions.width;
  const espacoUsadoPorComponentes = maxWidth; // Usar maxWidth que mantém o tamanho original
  const espacoSobrandoTotal = Math.max(0, larguraTotalTela - espacoUsadoPorComponentes);
  
  const espacoDisponivelEsquerda = Math.max(0, espacoSobrandoTotal / 2); // Metade do espaço sobrando
  const espacoDisponivelDireita = Math.max(0, espacoSobrandoTotal / 2); // Metade do espaço sobrando

  // Debug completo do espaço disponível
  console.log('📐 ESPAÇO DISPONÍVEL REAL:', {
    tela_largura: windowDimensions.width,
    container_largura: containerDimensions.width,
    sidebar_aberto: sidebarOpen,
    espaco_usado_componentes: espacoUsadoPorComponentes,
    componentes_largura_maxima: maxWidth,
    componentes_largura_real: basePortaWidth,
    espaco_sobrando_total: espacoSobrandoTotal,
    espaco_disponivel_esquerda: espacoDisponivelEsquerda,
    espaco_disponivel_direita: espacoDisponivelDireita,
    condicao_esquerda: espacoDisponivelEsquerda > 100,
    condicao_direita: espacoDisponivelDireita > 100 && windowDimensions.width >= 1500,
    config_usada: isMobile ? 'mobile' : 'desktop',
    isMobile: isMobile
  });

  return (
    <div className="w-full h-auto flex flex-col items-center relative">

      {/* PAINEL INDUSTRIAL ISA-104 - ESQUERDA */}
      {!isMobile && espacoDisponivelEsquerda > 100 && (
        <div 
          className="absolute top-8 z-10 flex flex-col gap-4"
          style={{ 
            left: '16px',
            width: `${Math.max(380, Math.min(espacoDisponivelEsquerda - 20, 600))}px`,
            maxHeight: 'calc(100vh - 120px)'
          }}
        >
          {/* DADOS OPERACIONAIS - USANDO INFOCARD PADRÃO */}
          <InfoCard title="DADOS OPERACIONAIS" variant="industrial">
            {/* POSIÇÃO */}
            <div className="mb-3">
              <div className="text-xs font-medium text-green-400 uppercase tracking-wide mb-1">POSIÇÃO PORTA</div>
              <div className="text-2xl font-mono font-bold text-white">
                {(reguaPortaMontante * 12.5 / 100).toFixed(2)} <span className="text-sm text-slate-400">m</span>
              </div>
              <div className="text-xs text-slate-400">Abertura: {reguaPortaMontante}%</div>
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
          </InfoCard>

          {/* STATUS OPERACIONAIS - USANDO STATUSCARD PADRÃO */}
          <div className="flex flex-col gap-2">
            <StatusCard 
              title="COMANDO EM AUTOMÁTICO"
              variant="automatic"
            />
            
            <StatusCard 
              title="IGUALDADE DE NÍVEIS PRESENTE"
              variant="success"
            />
            
            <StatusCard 
              title="FALTA IGUALDADE DE NÍVEIS"
              variant="error"
            />
          </div>
        </div>
      )}

      {/* PAINEL INDUSTRIAL ISA-104 - DIREITA */}
      {!isMobile && espacoDisponivelDireita > 100 && windowDimensions.width >= 1500 && (
        <div 
          className="absolute top-8 z-10 flex flex-col gap-4"
          style={{ 
            right: '16px',
            width: `${Math.max(380, Math.min(espacoDisponivelDireita - 20, 600))}px`,
            maxHeight: 'calc(100vh - 120px)'
          }}
        >
          {/* MOTORES - USANDO INFOCARD PADRÃO */}
          <InfoCard title="MOTORES" variant="motor">
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
          </InfoCard>

          {/* SISTEMA STATUS - USANDO INFOCARD PADRÃO */}
          <InfoCard title="SISTEMA" variant="system">
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
          </InfoCard>
        </div>
      )}


      {/* MENU PARÂMETROS - CANTO INFERIOR DIREITO */}
      {!isMobile && (
        <button
          onClick={() => setMenuParametrosOpen(!menuParametrosOpen)}
          className={`fixed bottom-6 right-6 z-30 px-8 py-5 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-5 ${
            menuParametrosOpen 
              ? 'bg-[#212E3E] text-white scale-105' 
              : 'bg-[#212E3E] text-white hover:scale-102'
          }`}
        >
          {/* Ícone */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            menuParametrosOpen ? 'bg-white/20' : 'bg-green-400/20'
          }`}>
            <CogIcon className={`w-6 h-6 transition-transform duration-300 text-white ${
              menuParametrosOpen ? 'rotate-90' : ''
            }`} />
          </div>
          
          {/* Texto */}
          <div className="text-left">
            <div className="text-sm font-semibold uppercase">PARÂMETROS</div>
            <div className="text-xs uppercase">Porta Montante</div>
          </div>
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

                {/* PARÂMETROS LASER MONTANTE */}
                <Card 
                  title="LASER MONTANTE" 
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
                        {(reguaPortaMontante * 12.5 / 100 + 125.5).toFixed(2)} m
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
            {/* SVG Base Porta Montante - CENTRALIZADO */}
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
                  href="/PortaMontante/Base_Porta_Montante.svg"
                  width="1075"
                  height="1098"
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>

            {/* 🎯 CONTRAPESO DIREITO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 57 */}
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
              <ContraPeso20t 
                websocketValue={contrapesoDirecto}
                editMode={false}
              />
            </div>

            {/* 🎯 CONTRAPESO ESQUERDO - COM MOVIMENTO PROPORCIONAL - WEBSOCKET ÍNDICE 58 */}
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
              <ContraPeso20t 
                websocketValue={contrapesoEsquerdo}
                editMode={false}
              />
            </div>

            {/* 📏 RÉGUA PORTA MONTANTE - WEBSOCKET ÍNDICE 56 */}
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
              <PortaMontanteRegua 
                websocketValue={reguaPortaMontante}
                editMode={false}
              />
            </div>

            {/* ⚙️ MOTOR DIREITO - WEBSOCKET ÍNDICE 50 */}
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
              <MotorMontante 
                websocketValue={motorDireito}
                editMode={false}
                direction="left"
              />
            </div>

            {/* ⚙️ MOTOR ESQUERDO - WEBSOCKET ÍNDICE 51 - ESPELHADO */}
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
              <MotorMontante 
                websocketValue={motorEsquerdo}
                editMode={false}
                direction="right"
              />
            </div>

            {/* 🚪 INDICADOR STATUS PORTA - ÚNICO (CONDICIONAL) */}
            {reguaPortaMontante >= 95 && (
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

            {reguaPortaMontante <= 5 && (
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

export default PortaMontante;