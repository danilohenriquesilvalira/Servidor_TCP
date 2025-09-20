import React from 'react';
import NivelCaldeira from '../components/Eclusa/caldeira/Nivel_Caldeira';
import NivelJusante from '../components/Eclusa/caldeira/Nivel_Jusante';
import NivelMontante from '../components/Eclusa/caldeira/Nivel_Montante';
import PortaJusante from '../components/Eclusa/caldeira/PortaJusante';
import PortaMontante from '../components/Eclusa/caldeira/PortaMontante';
import SemaforoSimples from '../components/Eclusa/caldeira/SemaforoSimples';
import EclusaStatusCard from '../components/Eclusa/caldeira/EclusaStatusCard';
import NiveisChart from '../components/Eclusa/caldeira/NiveisChart';
import VelocidadeRadares from '../components/Eclusa/caldeira/VelocidadeRadares';
import TrendDialog from '../components/Eclusa/caldeira/TrendDialog';
import { usePLC } from '../contexts/PLCContext';

// 🎯 CONFIGURAÇÕES DOS COMPONENTES DE NÍVEL - Edite aqui para salvar permanentemente
const NIVEL_CONFIG = {
  caldeira: {
    verticalPercent: 36.2,  // % da altura da caldeira (posição Y)
    horizontalPercent: 25.6, // % da largura da caldeira (posição X)
    widthPercent: 64.6,     // % da largura da caldeira (tamanho)
    heightPercent: 61.7,    // % da altura da caldeira (tamanho)
  },
  jusante: {
    verticalPercent: 29.4,  // % da altura total
    horizontalPercent: 89.4, // % da largura total
    widthPercent: 10.2,     // % da largura total
    heightPercent: 15    // % da altura total
  },
  montante: {
    verticalPercent: 15.5,  // % da altura total
    horizontalPercent: 0.4, // % da largura total
    widthPercent: 25,       // % da largura total
    heightPercent: 28,      // % da altura total
  }
};

// 🚪 CONFIGURAÇÕES DOS COMPONENTES DE PORTA - Edite aqui para salvar permanentemente
const PORTA_CONFIG = {
  jusante: {
    verticalPercent: 26.5,    // % da altura total (posição Y)
    horizontalPercent: 78.1,  // % da largura total (posição X)
    widthPercent: 8,          // % da largura total (tamanho)
    heightPercent: 20,      // % da altura total (tamanho)
  },
  montante: {
    verticalPercent: 14.6,  // % da altura total (posição Y)
    horizontalPercent: 25.5, // % da largura total (posição X)
    widthPercent: 1.5,      // % da largura total (tamanho)
    heightPercent: 18,      // % da altura total (tamanho)
  }
};

// 🚦 CONFIGURAÇÕES DOS SEMÁFOROS - Posições finais ajustadas
const SEMAFORO_CONFIG = {
  semaforo1: {
    verticalPercent: 5.7,  // % da altura total (posição Y)
    horizontalPercent: 22.4, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,      // % da altura total (tamanho)
  },
  semaforo2: {
    verticalPercent: 7.5,  // % da altura total (posição Y)
    horizontalPercent: 37.9, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,      // % da altura total (tamanho)
  },
  semaforo3: {
    verticalPercent: 7.5,  // % da altura total (posição Y)
    horizontalPercent: 67.3, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,      // % da altura total (tamanho)
  },
  semaforo4: {
    verticalPercent: 6.6,  // % da altura total (posição Y)
    horizontalPercent: 86.3, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,      // % da altura total (tamanho)
  }
};

// 🏗️ CONFIGURAÇÃO DA BASE PORTA JUSANTE
const BASE_PORTA_JUSANTE_CONFIG = {
  verticalPercent: 13.5,    // % da altura total (posição Y inicial para ajuste)
  horizontalPercent: 48.8,  // % da largura total (posição X inicial para ajuste)
  widthPercent: 70,       // % da largura total (tamanho inicial)
  heightPercent: 36.3,      // % da altura total (tamanho inicial)
};

const EclusaRegua: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState(() => {
    // Inicializar com dimensões adequadas para evitar flash
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth - 32, 1920);
      return { width, height: width / 5.7 }; // Aproximação da altura baseada no aspect ratio
    }
    return { width: 0, height: 0 };
  });
  const [windowDimensions, setWindowDimensions] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 0, height: 0 };
  });
  const [paredeOffsetPercent] = React.useState(-50.5); // Posição ajustada para encaixe perfeito
  const [showTrendDialog, setShowTrendDialog] = React.useState(false);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  
  const caldeiraScale = 99.4;
  
  const caldeiraConfig = NIVEL_CONFIG.caldeira;
  const jusanteConfig = NIVEL_CONFIG.jusante;
  const montanteConfig = NIVEL_CONFIG.montante;
  
  const portaJusanteConfig = PORTA_CONFIG.jusante;
  const portaMontanteConfig = PORTA_CONFIG.montante;
  
  const semaforo1Config = SEMAFORO_CONFIG.semaforo1;
  const semaforo2Config = SEMAFORO_CONFIG.semaforo2;
  const semaforo3Config = SEMAFORO_CONFIG.semaforo3;
  const semaforo4Config = SEMAFORO_CONFIG.semaforo4;
  
  const basePortaJusanteConfig = BASE_PORTA_JUSANTE_CONFIG;
  
  
  // 📡 USAR O SISTEMA PLC EXISTENTE (sem criar nova conexão!)
  const { data: plcData } = usePLC();
  
  // Extrair dados reais dos níveis do PLC (do sistema existente)
  const nivelJusante = plcData?.reals?.[107] || 0;    // NIV.NIV_JUSANTE_COTA (índice 107)
  const nivelCaldeira = plcData?.reals?.[108] || 0;   // NIV.NIV_CALD_COTA (índice 108)  
  const nivelMontante = plcData?.reals?.[109] || 0;   // NIV.NIV_MONT_COTA (índice 109)
  
  // Extrair dados das portas do PLC (do sistema existente)
  const portaJusanteValue = plcData?.ints?.[42] || 0;   // MOVIMENTO_PORTA_JUSANTE_CALDEIRA (índice 42)
  const portaMontanteValue = plcData?.ints?.[59] || 0; // MOVIMENTAR_PORTA_MONTANTE_CALDEIRA (índice 59)
  
  // Extrair dados dos semáforos do PLC (bit_data.status_bits)
  const statusBits = plcData?.bit_data?.status_bits || [];
  
  // Função para obter o estado dos LEDs de cada semáforo
  const getSemaforoLeds = (semaforoNum: number) => {
    // Função para calcular word e bit de uma posição
    const getBitFromPosition = (position: number) => {
      const wordIndex = Math.floor(position / 16);  // posição ÷ 16
      const bitIndex = position % 16;              // posição % 16
      const wordData = statusBits[wordIndex] || [];
      return wordData[bitIndex] || false;
    };
    
    // Mapeamento individual de cada LED:
    // Semafaro_verde_1: 151, Semafaro_vermelho_1: 152
    // Semafaro_verde_2: 153, Semafaro_vermelho_2: 154  
    // Semafaro_verde_3: 155, Semafaro_vermelho_3: 156
    // Semafaro_verde_4: 157, Semafaro_vermelho_4: 158
    
    switch (semaforoNum) {
      case 1:
        const verde1 = getBitFromPosition(151); // Word[9] Bit[7]
        const vermelho1 = getBitFromPosition(152); // Word[9] Bit[8]
        return { verde: verde1, vermelho: vermelho1 };
        
      case 2:
        const verde2 = getBitFromPosition(153); // Word[9] Bit[9]
        const vermelho2 = getBitFromPosition(154); // Word[9] Bit[10]
        return { verde: verde2, vermelho: vermelho2 };
        
      case 3:
        const verde3 = getBitFromPosition(155); // Word[9] Bit[11]
        const vermelho3 = getBitFromPosition(156); // Word[9] Bit[12]
        return { verde: verde3, vermelho: vermelho3 };
        
      case 4:
        const verde4 = getBitFromPosition(157); // Word[9] Bit[13]
        const vermelho4 = getBitFromPosition(158); // Word[9] Bit[14]
        return { verde: verde4, vermelho: vermelho4 };
        
      default:
        return { verde: false, vermelho: false };
    }
  };
  
  
  
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };
        
        // Só atualizar se as dimensões mudaram significativamente
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
    
    // Delay inicial para garantir que o DOM está pronto
    const timeoutId = setTimeout(updateDimensions, 100);
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Funções de navegação melhoradas
  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentCardIndex(index);
    }
  };

  const nextCard = () => {
    const nextIndex = (currentCardIndex + 1) % 3;
    scrollToCard(nextIndex);
  };

  const prevCard = () => {
    const prevIndex = currentCardIndex === 0 ? 2 : currentCardIndex - 1;
    scrollToCard(prevIndex);
  };

  // Detectar scroll no mobile
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const cardIndex = Math.round(scrollLeft / clientWidth);
      setCurrentCardIndex(cardIndex);
    }
  };

  // Auto-scroll indicators
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Cálculo das proporções baseado nos viewBoxes originais
  const caldeiraAspectRatio = 1168 / 253; // width/height do Caldeira_Eclusa.svg
  const paredeAspectRatio = 1175 / 205;   // width/height do Parede_Eclusa.svg
  
  // Calcular dimensões otimizadas para o container disponível
  const maxWidth = Math.min(containerDimensions.width - 32, 1920); // 32px = margem mínima
  const baseCaldeiraWidth = maxWidth;
  const baseCaldeiraHeight = baseCaldeiraWidth / caldeiraAspectRatio;
  
  // Aplicar escala da caldeira
  const caldeiraWidth = (baseCaldeiraWidth * caldeiraScale) / 100;
  const caldeiraHeight = (baseCaldeiraHeight * caldeiraScale) / 100;
  
  const paredeWidth = maxWidth;
  const paredeHeight = paredeWidth / paredeAspectRatio;
  
  // Calcular offset em pixels baseado na porcentagem da altura da caldeira
  const paredeOffsetPx = (caldeiraHeight * paredeOffsetPercent) / 100;

  // Detectar se é mobile
  const isMobile = windowDimensions.width < 768;

  // ÁREA DE CONTROLE COM SCROLL MOBILE MELHORADO
  const calculateControlAreas = () => {
    const areas = 3;
    
    // Altura fixa baseada no tamanho da tela
    let areaHeight = 150;
    if (windowDimensions.height > 800) areaHeight = 180;
    if (windowDimensions.height > 1000) areaHeight = 200;
    
    return { areas, areaHeight };
  };

  const controlLayout = calculateControlAreas();
  
  // Cards data
  const cards = [
    { component: EclusaStatusCard, title: "Status da Eclusa" },
    { component: NiveisChart, title: "Níveis" },
    { component: VelocidadeRadares, title: "Radares" }
  ];

  return (
    <main className="flex-1 relative min-h-0">
      
      <div className="w-full h-full flex flex-col items-center min-h-0">
        
        {/* ÁREAS DE CONTROLE COM SCROLL HORIZONTAL MELHORADO */}
        <div className="w-full max-w-[1920px] mb-8">
          {isMobile ? (
            // Layout mobile: scroll horizontal moderno com snap
            <div className="relative">
              
              {/* Container de scroll com snap e indicadores visuais */}
              <div className="relative">
                {/* Gradiente esquerda - indica que há cards anteriores */}
                {currentCardIndex > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/60 to-transparent z-10 pointer-events-none" />
                )}
                
                {/* Gradiente direita - indica que há mais cards */}
                {currentCardIndex < cards.length - 1 && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 to-transparent z-10 pointer-events-none" />
                )}

                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto snap-x snap-mandatory"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <style>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  
                  {cards.map((card, index) => {
                    const Component = card.component;
                    return (
                      <div 
                        key={index}
                        className="flex-shrink-0 w-full snap-center px-4"
                      >
                        <Component height={controlLayout.areaHeight} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Setas de navegação modernas - posicionadas fora dos cards */}
              <button
                onClick={prevCard}
                className="absolute -left-14 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm text-slate-600 p-2 rounded-full shadow-md hover:bg-white/90 hover:text-slate-800 hover:scale-105 transition-all duration-300 border border-gray-300"
                style={{ height: '36px', width: '36px' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextCard}
                className="absolute -right-14 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm text-slate-600 p-2 rounded-full shadow-md hover:bg-white/90 hover:text-slate-800 hover:scale-105 transition-all duration-300 border border-gray-300"
                style={{ height: '36px', width: '36px' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores de posição - pontos discretos */}
              <div className="flex justify-center mt-3 gap-1.5">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCard(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentCardIndex
                        ? 'bg-slate-700 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

            </div>
          ) : (
            // Layout desktop: grid tradicional
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: `${controlLayout.areaHeight}px`
              }}
            >
              {cards.map((card, index) => {
                const Component = card.component;
                return (
                  <div key={index}>
                    <Component height={controlLayout.areaHeight} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div 
          ref={containerRef}
          className="w-full max-w-[1920px] flex flex-col items-center relative"
          style={{
            height: '100%', // Ocupa toda altura disponível
            overflow: 'hidden'
          }}
        >

          {/* Container com positioning absoluto para controle total */}
          {containerDimensions.width > 100 && windowDimensions.width > 0 ? (
            <div 
              className="relative w-full flex flex-col items-center"
              style={{
                maxWidth: `${maxWidth}px`,
                height: `${(caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * 0.56}px` // 55% da altura original
              }}
            >
              {/* Caldeira - Posição superior */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 cursor-pointer"
                style={{
                  width: `${caldeiraWidth}px`,
                  height: `${caldeiraHeight}px`,
                  zIndex: 1
                }}
                onClick={() => setShowTrendDialog(true)}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1168 253"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full drop-shadow-sm"
                >
                  <image
                    href="/Eclusa/Caldeira_Eclusa.svg"
                    width="1168"
                    height="253"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </svg>
              </div>
              
              {/* Parede - Posição inferior com sobreposição controlada dinamicamente */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2"
                style={{
                  top: `${caldeiraHeight + paredeOffsetPx}px`,
                  width: `${paredeWidth}px`,
                  height: `${paredeHeight}px`,
                  zIndex: 10,
                  clipPath: 'inset(0)', // Força o SVG a respeitar os limites
                  transition: 'all 0.2s ease-in-out' // Agora sempre tem transição suave
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1175 205"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                  style={{
                    overflow: 'hidden' // Corta elementos que vazam
                  }}
                >
                  <image
                    href="/Eclusa/Parede_Eclusa.svg"
                    width="1175"
                    height="205"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </svg>
              </div>

              {/* Componente Nível Caldeira - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${(caldeiraHeight * caldeiraConfig.verticalPercent) / 100}px`,
                  left: `${(caldeiraWidth * caldeiraConfig.horizontalPercent) / 100}px`,
                  width: `${(caldeiraWidth * caldeiraConfig.widthPercent) / 100}px`,
                  height: `${(caldeiraHeight * caldeiraConfig.heightPercent) / 100}px`,
                  zIndex: 5 // Entre caldeira (10) e parede (1)
                }}
              >
                <NivelCaldeira 
                  websocketValue={nivelCaldeira}
                  editMode={false}
                />
              </div>

              {/* Componente Nível Jusante - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * jusanteConfig.verticalPercent) / 100}px`,
                  left: `${(maxWidth * jusanteConfig.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * jusanteConfig.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * jusanteConfig.heightPercent) / 100}px`,
                  zIndex: 5 // Entre caldeira (10) e parede (1)
                }}
              >
                <NivelJusante 
                  websocketValue={nivelJusante}
                  editMode={false}
                />
              </div>

              {/* Componente Nível Montante - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * montanteConfig.verticalPercent) / 100}px`,
                  left: `${(maxWidth * montanteConfig.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * montanteConfig.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * montanteConfig.heightPercent) / 100}px`,
                  zIndex: 5 // Entre caldeira (10) e parede (1)
                }}
              >
                <NivelMontante 
                  websocketValue={nivelMontante}
                  editMode={false}
                />
              </div>

              {/* Componente Porta Jusante - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * portaJusanteConfig.verticalPercent) / 100}px`,
                  left: `${(maxWidth * portaJusanteConfig.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * portaJusanteConfig.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * portaJusanteConfig.heightPercent) / 100}px`,
                  zIndex: 8 // Acima de tudo para animação
                }}
              >
                <PortaJusante 
                  websocketValue={portaJusanteValue}
                  editMode={false}
                />
              </div>

              {/* Componente Porta Montante - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * portaMontanteConfig.verticalPercent) / 100}px`,
                  left: `${(maxWidth * portaMontanteConfig.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * portaMontanteConfig.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * portaMontanteConfig.heightPercent) / 100}px`,
                  zIndex: 9 // Mais alto para animação vertical
                }}
              >
                <PortaMontante 
                  websocketValue={portaMontanteValue}
                  editMode={false}
                />
              </div>

              {/* Semáforo 1 - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * semaforo1Config.verticalPercent) / 100}px`,
                  left: `${(maxWidth * semaforo1Config.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * semaforo1Config.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * semaforo1Config.heightPercent) / 100}px`,
                  zIndex: 15
                }}
              >
                <SemaforoSimples 
                  ledVerde={getSemaforoLeds(1).verde}
                  ledVermelho={getSemaforoLeds(1).vermelho}
                  editMode={true}
                />
              </div>

              {/* Semáforo 2 - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * semaforo2Config.verticalPercent) / 100}px`,
                  left: `${(maxWidth * semaforo2Config.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * semaforo2Config.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * semaforo2Config.heightPercent) / 100}px`,
                  zIndex: 15
                }}
              >
                <SemaforoSimples 
                  ledVerde={getSemaforoLeds(2).verde}
                  ledVermelho={getSemaforoLeds(2).vermelho}
                  editMode={true}
                />
              </div>

              {/* Semáforo 3 - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * semaforo3Config.verticalPercent) / 100}px`,
                  left: `${(maxWidth * semaforo3Config.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * semaforo3Config.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * semaforo3Config.heightPercent) / 100}px`,
                  zIndex: 15
                }}
              >
                <SemaforoSimples 
                  ledVerde={getSemaforoLeds(3).verde}
                  ledVermelho={getSemaforoLeds(3).vermelho}
                  editMode={true}
                />
              </div>

              {/* Semáforo 4 - Dados reais do PLC */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * semaforo4Config.verticalPercent) / 100}px`,
                  left: `${(maxWidth * semaforo4Config.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * semaforo4Config.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * semaforo4Config.heightPercent) / 100}px`,
                  zIndex: 15
                }}
              >
                <SemaforoSimples 
                  ledVerde={getSemaforoLeds(4).verde}
                  ledVermelho={getSemaforoLeds(4).vermelho}
                  editMode={true}
                />
              </div>

              {/* Base Porta Jusante SVG */}
              <div 
                className="absolute transition-all duration-200 ease-in-out"
                style={{
                  top: `${((caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * basePortaJusanteConfig.verticalPercent) / 100}px`,
                  left: `${(maxWidth * basePortaJusanteConfig.horizontalPercent) / 100}px`,
                  width: `${(maxWidth * basePortaJusanteConfig.widthPercent) / 100}px`,
                  height: `${((caldeiraHeight + paredeHeight) * basePortaJusanteConfig.heightPercent) / 100}px`,
                  zIndex: 12
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                >
                  <image
                    href="/Eclusa/Base_Porta_Jusante.svg"
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </svg>
              </div>
            </div>
          ) : (
            /* Placeholder para evitar flash de redimensionamento */
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

      {/* Dialog de Trend */}
      <TrendDialog 
        isOpen={showTrendDialog}
        onClose={() => setShowTrendDialog(false)}
      />
    </main>
  );
};

export default EclusaRegua;