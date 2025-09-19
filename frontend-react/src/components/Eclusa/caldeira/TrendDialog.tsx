import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePLC } from '../../../contexts/PLCContext';

interface TrendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrendDataPoint {
  time: string;
  timestamp: number;
  caldeira: number;
  montante: number;
  jusante: number;
}

const TrendDialog: React.FC<TrendDialogProps> = ({ isOpen, onClose }) => {
  const { data: plcData, connectionStatus } = usePLC();
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  
  // Valores dos níveis do PLC
  const caldeira = Number(plcData?.reals?.[108]) || 45;
  const montante = Number(plcData?.reals?.[109]) || 60;
  const jusante = Number(plcData?.reals?.[107]) || 35;

  // Análise de igualdade de níveis
  const analisarIgualdade = () => {
    const tolerancia = 5; // 5% de tolerância
    const caldeiraJusante = Math.abs(caldeira - jusante) <= tolerancia;
    const montanteCaldeira = Math.abs(montante - caldeira) <= tolerancia;
    const montanteJusante = Math.abs(montante - jusante) <= tolerancia;
    
    let status = 'Níveis Desbalanceados';
    let cor = '#EF4444'; // Vermelho
    
    if (caldeiraJusante && montanteCaldeira && montanteJusante) {
      status = 'Níveis Equilibrados';
      cor = '#10B981'; // Verde
    } else if (caldeiraJusante || montanteCaldeira) {
      status = 'Equilibrio Parcial';
      cor = '#F59E0B'; // Amarelo
    }
    
    return { status, cor, caldeiraJusante, montanteCaldeira, montanteJusante };
  };

  const igualdade = analisarIgualdade();

  // Detectar tamanho da tela
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determinar se é mobile
  const isMobile = windowSize.width < 768;
  const isSmallMobile = windowSize.width < 480;

  // Gerar dados iniciais quando o dialog abre
  useEffect(() => {
    if (isOpen) {
      const initialData: TrendDataPoint[] = [];
      const now = Date.now();
      
      // Gerar dados históricos simulados baseados nos valores atuais
      for (let i = 0; i < 15; i++) {
        const timestamp = now - (15 - i) * 2000;
        const time = new Date(timestamp);
        initialData.push({
          time: time.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }),
          timestamp,
          caldeira: caldeira + (Math.random() - 0.5) * 10,
          montante: montante + (Math.random() - 0.5) * 10,
          jusante: jusante + (Math.random() - 0.5) * 10
        });
      }
      
      // Adicionar ponto atual
      initialData.push({
        time: new Date(now).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        timestamp: now,
        caldeira,
        montante,
        jusante
      });
      
      setTrendData(initialData);
    }
  }, [isOpen, caldeira, montante, jusante]);

  // Atualizar dados em tempo real
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const newPoint: TrendDataPoint = {
        time: new Date(now).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        timestamp: now,
        caldeira,
        montante,
        jusante
      };

      setTrendData(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-50); // Manter últimos 50 pontos
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, caldeira, montante, jusante]);

  // Limpar dados quando fechar
  useEffect(() => {
    if (!isOpen) {
      setTrendData([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dimensões responsivas do dialog - mais compacto
  const dialogWidth = isSmallMobile ? '95%' : isMobile ? '90%' : '75%';
  const dialogMaxWidth = isMobile ? '100%' : '700px';
  const dialogHeight = isSmallMobile ? '70%' : isMobile ? '65%' : '60%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Dialog com padrão dos cards de usuário */}
      <div 
        className="relative bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
        style={{ 
          width: dialogWidth,
          maxWidth: dialogMaxWidth,
          height: dialogHeight,
          maxHeight: '90vh'
        }}
      >
        
        {/* Header usando padrão dos cards */}
        <div className={`bg-gray-200 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-800`}>
                  {isMobile ? 'Trend Níveis' : 'Trend dos Níveis da Eclusa'}
                </h2>
                {!isMobile && (
                  <p className="text-xs text-gray-600">
                    {connectionStatus.connected ? 'Tempo real' : 'Desconectado'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-300 transition-colors duration-200"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Área de conteúdo branca */}
        <div className={`bg-white ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
          
          {/* Status de Igualdade compacto */}
          <div className={`${isMobile ? 'mb-2' : 'mb-3'} text-center`}>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: `${igualdade.cor}20` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: igualdade.cor }}></div>
              <span className="text-xs font-medium" style={{ color: igualdade.cor }}>
                {isMobile ? igualdade.status.split(' ')[0] : igualdade.status}
              </span>
            </div>
          </div>
          
          {/* Valores dos Níveis compactos */}
          <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Caldeira</div>
              <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-[#263CC8]`}>
                {caldeira.toFixed(1)}%
              </div>
              {igualdade.caldeiraJusante && !isMobile && (
                <div className="text-xs text-green-600">≈ Jusante</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Montante</div>
              <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-[#28FF52]`}>
                {montante.toFixed(1)}%
              </div>
              {igualdade.montanteCaldeira && !isMobile && (
                <div className="text-xs text-green-600">≈ Caldeira</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Jusante</div>
              <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-[#6D32FF]`}>
                {jusante.toFixed(1)}%
              </div>
              {igualdade.montanteJusante && !isMobile && (
                <div className="text-xs text-green-600">≈ Montante</div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico SVG compacto */}
        <div className={`flex-1 ${isMobile ? 'p-2' : 'p-4'}`}>
          <div className="h-full bg-white rounded-lg border" style={{ minHeight: isMobile ? '200px' : '250px' }}>
            
            {/* Gráfico SVG Melhorado */}
            <div className="h-full p-4">
              <svg width="100%" height="80%" viewBox="0 0 400 200" className="rounded-lg shadow-inner bg-gradient-to-br from-gray-50 to-gray-100">
                
                <defs>
                  {/* Grid mais suave */}
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#F3F4F6" strokeWidth="0.5"/>
                  </pattern>
                  
                  {/* Gradientes para as linhas */}
                  <linearGradient id="caldeiraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#263CC8" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#263CC8" stopOpacity="1"/>
                  </linearGradient>
                  
                  <linearGradient id="montanteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#28FF52" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#28FF52" stopOpacity="1"/>
                  </linearGradient>
                  
                  <linearGradient id="jusanteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6D32FF" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#6D32FF" stopOpacity="1"/>
                  </linearGradient>
                  
                  {/* Áreas preenchidas */}
                  <linearGradient id="caldeiraArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#263CC8" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#263CC8" stopOpacity="0.05"/>
                  </linearGradient>
                  
                  <linearGradient id="montanteArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#28FF52" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#28FF52" stopOpacity="0.05"/>
                  </linearGradient>
                  
                  <linearGradient id="jusanteArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6D32FF" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#6D32FF" stopOpacity="0.05"/>
                  </linearGradient>
                  
                  {/* Filtro de brilho */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Fundo com grid */}
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Áreas preenchidas (atrás das linhas) */}
                <path d="M50,150 L100,120 L150,130 L200,110 L250,125 L300,115 L350,120 L350,200 L50,200 Z" 
                      fill="url(#caldeiraArea)" opacity="0.3"/>
                <path d="M50,100 L100,80 L150,85 L200,70 L250,75 L300,65 L350,70 L350,200 L50,200 Z" 
                      fill="url(#montanteArea)" opacity="0.3"/>
                <path d="M50,170 L100,165 L150,175 L200,160 L250,170 L300,155 L350,160 L350,200 L50,200 Z" 
                      fill="url(#jusanteArea)" opacity="0.3"/>
                
                {/* Linhas principais mais finas e detalhadas */}
                <polyline
                  fill="none"
                  stroke="#263CC8"
                  strokeWidth="1.5"
                  points="50,150 100,120 150,130 200,110 250,125 300,115 350,120"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                
                <polyline
                  fill="none"
                  stroke="#28FF52"
                  strokeWidth="1.5"
                  points="50,100 100,80 150,85 200,70 250,75 300,65 350,70"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                
                <polyline
                  fill="none"
                  stroke="#6D32FF"
                  strokeWidth="1.5"
                  points="50,170 100,165 150,175 200,160 250,170 300,155 350,160"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                
                {/* Pontos atuais mais delicados */}
                <circle cx="350" cy="120" r="2.5" fill="#263CC8" opacity="0.8">
                  <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="350" cy="70" r="2.5" fill="#28FF52" opacity="0.8">
                  <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="350" cy="160" r="2.5" fill="#6D32FF" opacity="0.8">
                  <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite"/>
                </circle>
                
                {/* Labels nos eixos */}
                <text x="30" y="50" fontSize="10" fill="#6B7280" textAnchor="middle">100%</text>
                <text x="30" y="100" fontSize="10" fill="#6B7280" textAnchor="middle">50%</text>
                <text x="30" y="150" fontSize="10" fill="#6B7280" textAnchor="middle">25%</text>
                <text x="30" y="190" fontSize="10" fill="#6B7280" textAnchor="middle">0%</text>
                
              </svg>
              
              {/* Legenda compacta */}
              <div className={`flex justify-center ${isMobile ? 'gap-3 mt-2' : 'gap-4 mt-3'}`}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#263CC8] rounded-full"></div>
                  <span className="text-xs">C: {caldeira.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#28FF52] rounded-full"></div>
                  <span className="text-xs">M: {montante.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#6D32FF] rounded-full"></div>
                  <span className="text-xs">J: {jusante.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrendDialog;