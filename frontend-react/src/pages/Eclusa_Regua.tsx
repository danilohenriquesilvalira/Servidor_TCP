import React from 'react';
import NivelCaldeira from '../components/Eclusa/caldeira/Nivel_Caldeira';
import NivelJusante from '../components/Eclusa/caldeira/Nivel_Jusante';
import NivelMontante from '../components/Eclusa/caldeira/Nivel_Montante';
import PortaJusante from '../components/Eclusa/caldeira/PortaJusante';
import PortaMontante from '../components/Eclusa/caldeira/PortaMontante';
import SemaforoSimples from '../components/Eclusa/caldeira/SemaforoSimples';
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
    heightPercent: 15,      // % da altura total
  },
  montante: {
    verticalPercent: 15.5,  // % da altura total
    horizontalPercent: 0.5, // % da largura total
    widthPercent: 25,       // % da largura total
    heightPercent: 28,      // % da altura total
  }
};

// 🚪 CONFIGURAÇÕES DOS COMPONENTES DE PORTA - Edite aqui para salvar permanentemente
const PORTA_CONFIG = {
  jusante: {
    verticalPercent: 26.5,    // % da altura total (posição Y)
    horizontalPercent: 78.1,  // % da largura total (posição X)
    widthPercent: 8,        // % da largura total (tamanho)
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
    verticalPercent: 5.7,   // % da altura total (posição Y)
    horizontalPercent: 22.4, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,       // % da altura total (tamanho)
  },
  semaforo2: {
    verticalPercent: 7.5,   // % da altura total (posição Y)
    horizontalPercent: 37.9, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,       // % da altura total (tamanho)
  },
  semaforo3: {
    verticalPercent: 7.5,   // % da altura total (posição Y)
    horizontalPercent: 67.3, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,       // % da altura total (tamanho)
  },
  semaforo4: {
    verticalPercent: 6.6,   // % da altura total (posição Y)
    horizontalPercent: 86.3, // % da largura total (posição X)
    widthPercent: 3,        // % da largura total (tamanho)
    heightPercent: 8,       // % da altura total (tamanho)
  }
};

const EclusaRegua: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [paredeOffsetPercent, setParedeOffsetPercent] = React.useState(-50.5); // Posição ajustada para encaixe perfeito
  
  // Estados para ajustar a caldeira
  const [caldeiraScale] = React.useState(99.3); // Escala da caldeira em %
  
  // Estados para posicionamento dos componentes de nível
  const [caldeiraConfig, setCaldeiraConfig] = React.useState(NIVEL_CONFIG.caldeira);
  const [jusanteConfig, setJusanteConfig] = React.useState(NIVEL_CONFIG.jusante);
  const [montanteConfig, setMontanteConfig] = React.useState(NIVEL_CONFIG.montante);
  
  // Estados para posicionamento dos componentes de porta
  const [portaJusanteConfig, setPortaJusanteConfig] = React.useState(PORTA_CONFIG.jusante);
  const [portaMontanteConfig, setPortaMontanteConfig] = React.useState(PORTA_CONFIG.montante);
  
  // Estados para posicionamento dos semáforos
  const [semaforo1Config, setSemaforo1Config] = React.useState(SEMAFORO_CONFIG.semaforo1);
  const [semaforo2Config, setSemaforo2Config] = React.useState(SEMAFORO_CONFIG.semaforo2);
  const [semaforo3Config, setSemaforo3Config] = React.useState(SEMAFORO_CONFIG.semaforo3);
  const [semaforo4Config, setSemaforo4Config] = React.useState(SEMAFORO_CONFIG.semaforo4);
  
  // 📡 USAR O SISTEMA PLC EXISTENTE (sem criar nova conexão!)
  const { data: plcData, connectionStatus } = usePLC();
  
  // Removido auto-connect daqui - agora é gerenciado pelo useWebSocket
  
  // Extrair dados reais dos níveis do PLC (do sistema existente)
  const nivelJusante = plcData?.reals?.[107] || 0;   // NIV.NIV_JUSANTE_COTA (índice 107)
  const nivelCaldeira = plcData?.reals?.[108] || 0;  // NIV.NIV_CALD_COTA (índice 108)  
  const nivelMontante = plcData?.reals?.[109] || 0;  // NIV.NIV_MONT_COTA (índice 109)
  
  // Extrair dados das portas do PLC (do sistema existente)
  const portaJusanteValue = plcData?.ints?.[42] || 0;  // MOVIMENTO_PORTA_JUSANTE_CALDEIRA (índice 42)
  const portaMontanteValue = plcData?.ints?.[59] || 0; // MOVIMENTAR_PORTA_MONTANTE_CALDEIRA (índice 59)
  
  // Extrair dados dos semáforos do PLC (bit_data.status_bits)
  const statusBits = plcData?.bit_data?.status_bits || [];
  
  // Função para obter o estado dos LEDs de cada semáforo
  const getSemaforoLeds = (semaforoNum: number) => {
    // Função para calcular word e bit de uma posição
    const getBitFromPosition = (position: number) => {
      const wordIndex = Math.floor(position / 16);  // posição ÷ 16
      const bitIndex = position % 16;               // posição % 16
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
        console.log(`Semáforo 1 - Verde(151): ${verde1}, Vermelho(152): ${vermelho1}`);
        return { verde: verde1, vermelho: vermelho1 };
        
      case 2:
        const verde2 = getBitFromPosition(153); // Word[9] Bit[9]
        const vermelho2 = getBitFromPosition(154); // Word[9] Bit[10]
        console.log(`Semáforo 2 - Verde(153): ${verde2}, Vermelho(154): ${vermelho2}`);
        return { verde: verde2, vermelho: vermelho2 };
        
      case 3:
        const verde3 = getBitFromPosition(155); // Word[9] Bit[11]
        const vermelho3 = getBitFromPosition(156); // Word[9] Bit[12]
        console.log(`Semáforo 3 - Verde(155): ${verde3}, Vermelho(156): ${vermelho3}`);
        return { verde: verde3, vermelho: vermelho3 };
        
      case 4:
        const verde4 = getBitFromPosition(157); // Word[9] Bit[13]
        const vermelho4 = getBitFromPosition(158); // Word[9] Bit[14]
        console.log(`Semáforo 4 - Verde(157): ${verde4}, Vermelho(158): ${vermelho4}`);
        return { verde: verde4, vermelho: vermelho4 };
        
      default:
        return { verde: false, vermelho: false };
    }
  };
  
  
  
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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
  
  // Função para ajustar posição da parede proporcionalmente
  const adjustParedePosition = (direction: 'up' | 'down') => {
    setParedeOffsetPercent(prev => {
      const step = 0.5; // Porcentagem por ajuste (mais fino)
      return direction === 'up' ? prev - step : prev + step;
    });
  };


  // Função para resetar todas as configurações
  const resetAllConfigs = () => {
    setParedeOffsetPercent(-50.5);
    setCaldeiraConfig(NIVEL_CONFIG.caldeira);
    setJusanteConfig(NIVEL_CONFIG.jusante);
    setMontanteConfig(NIVEL_CONFIG.montante);
  };

  // Função para mostrar valores atuais no console (para salvar no código)
  const logCurrentValues = () => {
    console.log('🎯 VALORES ATUAIS PARA SALVAR NO CÓDIGO:');
    console.log('const NIVEL_CONFIG = {');
    console.log('  caldeira: {');
    console.log(`    verticalPercent: ${caldeiraConfig.verticalPercent},`);
    console.log(`    horizontalPercent: ${caldeiraConfig.horizontalPercent},`);
    console.log(`    widthPercent: ${caldeiraConfig.widthPercent},`);
    console.log(`    heightPercent: ${caldeiraConfig.heightPercent},`);
    console.log('  },');
    console.log('  jusante: {');
    console.log(`    verticalPercent: ${jusanteConfig.verticalPercent},`);
    console.log(`    horizontalPercent: ${jusanteConfig.horizontalPercent},`);
    console.log(`    widthPercent: ${jusanteConfig.widthPercent},`);
    console.log(`    heightPercent: ${jusanteConfig.heightPercent},`);
    console.log('  },');
    console.log('  montante: {');
    console.log(`    verticalPercent: ${montanteConfig.verticalPercent},`);
    console.log(`    horizontalPercent: ${montanteConfig.horizontalPercent},`);
    console.log(`    widthPercent: ${montanteConfig.widthPercent},`);
    console.log(`    heightPercent: ${montanteConfig.heightPercent},`);
    console.log('  }');
    console.log('};');
    console.log(`const paredeOffsetPercent = ${paredeOffsetPercent};`);
  };

  return (
    <main className="flex-1 relative min-h-0">
      <div className="w-full h-full pt-8 flex justify-center items-start">
        <div 
          ref={containerRef}
          className="w-full max-w-[1920px] flex flex-col items-center relative"
          style={{
            maxHeight: 'calc(100vh - 120px)', // Espaço para padding e margem
            overflow: 'hidden'
          }}
        >
          {/* Controles de Ajuste - Compactos */}
          <div className="mb-4 space-y-2">
            {/* Controles da Parede */}
            <div className="flex gap-2 items-center bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
              <span className="text-sm text-white w-16">Parede:</span>
              <button
                onClick={() => adjustParedePosition('up')}
                className="bg-blue-500/80 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors backdrop-blur-sm"
                title="Subir parede"
              >
                ↑
              </button>
              <button
                onClick={() => adjustParedePosition('down')}
                className="bg-blue-500/80 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors backdrop-blur-sm"
                title="Descer parede"
              >
                ↓
              </button>
              <span className="text-xs text-white/80 ml-2">{paredeOffsetPercent.toFixed(1)}%</span>
            </div>



            {/* Controles dos Semáforos */}
            <div className="flex gap-1 items-center bg-yellow/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-yellow-300/30">
              <span className="text-xs text-blue-900 font-bold w-8">🚦</span>
              <input 
                type="number" 
                value={semaforo1Config.horizontalPercent} 
                onChange={(e) => setSemaforo1Config(prev => ({...prev, horizontalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <input 
                type="number" 
                value={semaforo1Config.verticalPercent} 
                onChange={(e) => setSemaforo1Config(prev => ({...prev, verticalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <span className="text-xs text-blue-900 font-bold w-8">🚦</span>
              <input 
                type="number" 
                value={semaforo2Config.horizontalPercent} 
                onChange={(e) => setSemaforo2Config(prev => ({...prev, horizontalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <input 
                type="number" 
                value={semaforo2Config.verticalPercent} 
                onChange={(e) => setSemaforo2Config(prev => ({...prev, verticalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
            </div>

            <div className="flex gap-1 items-center bg-purple/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-300/30">
              <span className="text-xs text-blue-900 font-bold w-8">🚦</span>
              <input 
                type="number" 
                value={semaforo3Config.horizontalPercent} 
                onChange={(e) => setSemaforo3Config(prev => ({...prev, horizontalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <input 
                type="number" 
                value={semaforo3Config.verticalPercent} 
                onChange={(e) => setSemaforo3Config(prev => ({...prev, verticalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <span className="text-xs text-blue-900 font-bold w-8">🚦</span>
              <input 
                type="number" 
                value={semaforo4Config.horizontalPercent} 
                onChange={(e) => setSemaforo4Config(prev => ({...prev, horizontalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
              <input 
                type="number" 
                value={semaforo4Config.verticalPercent} 
                onChange={(e) => setSemaforo4Config(prev => ({...prev, verticalPercent: Number(e.target.value)}))}
                className="w-10 h-6 text-xs border rounded px-1 text-center"
                step="0.1"
              />
            </div>

            {/* Status WebSocket e Dados dos Níveis e Portas */}
            <div className="flex gap-2 items-center bg-green/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-300/30">
              <span className="text-sm text-blue-900 font-bold w-16">PLC:</span>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-blue-900 font-bold">
                C:{nivelCaldeira.toFixed(1)}% | J:{nivelJusante.toFixed(1)}% | M:{nivelMontante.toFixed(1)}%
              </span>
              <span className="text-xs text-blue-900/70">
                PJ:{portaJusanteValue} | PM:{portaMontanteValue}
              </span>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 items-center bg-purple/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-300/30">
              <button
                onClick={resetAllConfigs}
                className="bg-gray-500/80 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors backdrop-blur-sm"
                title="Resetar todas as configurações"
              >
                🔄 Reset Tudo
              </button>
              <button
                onClick={logCurrentValues}
                className="bg-orange-500/80 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors backdrop-blur-sm"
                title="Mostrar valores no console para salvar"
              >
                💾 Ver Código
              </button>
            </div>
          </div>

          {/* Container com positioning absoluto para controle total */}
          {containerDimensions.width > 0 && (
            <div 
              className="relative w-full flex flex-col items-center"
              style={{
                maxWidth: `${maxWidth}px`,
                height: `${caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx) + 20}px` // +20px buffer
              }}
            >
              {/* Caldeira - Posição superior */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
                style={{
                  width: `${caldeiraWidth}px`,
                  height: `${caldeiraHeight}px`,
                  zIndex: 1
                }}
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
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default EclusaRegua;
