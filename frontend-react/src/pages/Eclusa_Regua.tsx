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
    horizontalPercent: 89.2, // % da largura total
    widthPercent: 10.2,     // % da largura total
    heightPercent: 15     // % da altura total
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

// 🏗️ CONFIGURAÇÃO DA BASE PORTA JUSANTE
const BASE_PORTA_JUSANTE_CONFIG = {
  verticalPercent: 13.5,    // % da altura total (posição Y inicial para ajuste)
  horizontalPercent: 48.8,  // % da largura total (posição X inicial para ajuste)
  widthPercent: 70,       // % da largura total (tamanho inicial)
  heightPercent: 36.3,      // % da altura total (tamanho inicial)
};

const EclusaRegua: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });
  const [paredeOffsetPercent, setParedeOffsetPercent] = React.useState(-50.5); // Posição ajustada para encaixe perfeito
  
  const caldeiraScale = 99.3;
  
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
  

  return (
    <main className="flex-1 relative min-h-0">
      
      <div className="w-full h-full flex flex-col items-center">
        
        {/* ÁREA SUPERIOR - CARDS PADRÃO EDP */}
        <div className="w-full max-w-[1920px] mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1 - Operador Logado */}
            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Sistema HMI</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>

            {/* Card 2 - Igualdade e Níveis */}
            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Igualdade e Níveis</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title={`Caldeira: ${nivelCaldeira.toFixed(1)}%`}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full" title={`Jusante: ${nivelJusante.toFixed(1)}%`}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full" title={`Montante: ${nivelMontante.toFixed(1)}%`}></div>
                </div>
              </div>
            </div>

            {/* Card 3 - Status da Eclusa */}
            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Status da Eclusa</span>
                </div>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${portaJusanteValue > 0 ? 'bg-green-500' : 'bg-gray-300'}`} title="Porta Jusante"></div>
                  <div className={`w-2 h-2 rounded-full ${portaMontanteValue > 0 ? 'bg-green-500' : 'bg-gray-300'}`} title="Porta Montante"></div>
                  <div className={`w-2 h-2 rounded-full ${connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} title="Sistema PLC"></div>
                </div>
              </div>
            </div>
          </div>
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
          {containerDimensions.width > 0 && (
            <div 
              className="relative w-full flex flex-col items-center"
              style={{
                maxWidth: `${maxWidth}px`,
                height: `${(caldeiraHeight + paredeHeight + Math.abs(paredeOffsetPx)) * 0.56}px` // 55% da altura original
              }}
            >
              {/* Elementos de debug removidos */}
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
          )}

        </div>
        
        {/* ÁREA INFERIOR - BOTÕES DE CONTROLE */}
        <div className="w-full max-w-[1920px] mt-8">
          
          {/* 12 Botões em 2 filas de 6 */}
          <div className="space-y-4">
            {/* Primeira fila - 6 botões */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Iniciar</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10l2 2 4-4"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Parar</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Reset</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Auto</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Manual</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Config</span>
                </div>
              </button>
            </div>

            {/* Segunda fila - 6 botões */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Encher</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Esvaziar</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">P. Jusante</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">P. Montante</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Alarmes</span>
                </div>
              </button>

              <button className="bg-white hover:bg-edp-electric hover:text-white border border-edp-neutral-lighter rounded-2xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-edp-marine group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <span className="text-sm font-medium text-edp-neutral-darkest group-hover:text-white">Relatórios</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EclusaRegua;
