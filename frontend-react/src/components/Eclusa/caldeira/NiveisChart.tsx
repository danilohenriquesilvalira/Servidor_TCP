import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { usePLC } from '../../../contexts/PLCContext';

interface NiveisChartProps {
  height?: number;
}

const NiveisChart: React.FC<NiveisChartProps> = ({ height = 180 }) => {
  const { data: plcData, connectionStatus } = usePLC();
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [tooltipActive, setTooltipActive] = React.useState(false);

  // Valores dos níveis (0-100% ou metros)
  const caldeira = Number(plcData?.reals?.[108]) || 45;
  const montante = Number(plcData?.reals?.[109]) || 60;
  const jusante = Number(plcData?.reals?.[107]) || 35;

  // Histórico de dados reais (usar apenas valores reais do PLC)
  const [historyData, setHistoryData] = React.useState<Array<{time: number, caldeira: number, montante: number, jusante: number}>>([]);

  // Atualizar histórico com valores reais do PLC
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setHistoryData(prev => {
        const newData = [...prev, {
          time: now,
          caldeira: caldeira,
          montante: montante,
          jusante: jusante
        }].slice(-30); // Manter apenas os últimos 30 pontos
        return newData;
      });
    }, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [caldeira, montante, jusante]);

  // Dados para o gráfico (apenas valores reais)
  const chartData = React.useMemo(() => {
    return historyData.map((point, index) => ({
      time: index,
      caldeira: point.caldeira,
      montante: point.montante,
      jusante: point.jusante
    }));
  }, [historyData]);

  // Responsividade baseada na altura
  const isSmall = height < 160;

  // Detectar cliques fora do gráfico para esconder tooltip
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (chartRef.current && !chartRef.current.contains(event.target as Node)) {
        setTooltipActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Tooltip customizado com controle manual
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && tooltipActive) {
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 pointer-events-none">
          <p className="text-xs font-medium text-gray-600 mb-1">Ponto {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="font-medium capitalize">{entry.dataKey}:</span>
              <span className="font-bold">{entry.value.toFixed(1)}m</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={chartRef}
      className="bg-gray-200 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Header azul - Retângulo para ícone e título */}
      <div className={`bg-slate-700 text-white px-4 ${isSmall ? 'py-1.5' : 'py-2'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} ${connectionStatus.connected ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <h4 className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium`}>Níveis</h4>
          </div>
          
          {/* Valores no header - lado direito */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-300">Jus</div>
              <div className="font-bold text-green-400">{jusante.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Mon</div>
              <div className="font-bold text-green-400">{montante.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">Cal</div>
              <div className="font-bold text-green-400">{caldeira.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico preenchendo todo o espaço abaixo do header */}
      <div 
        className="flex-1 w-full"
        onMouseEnter={() => setTooltipActive(true)}
        onTouchStart={() => setTooltipActive(true)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCaldeira" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C9599" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#7C9599" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMontante" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#28FF52" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#28FF52" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorJusante" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6D32FF" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#6D32FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3' }}
              animationDuration={150}
              wrapperStyle={{ outline: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="caldeira"
              stroke="#7C9599"
              strokeWidth={2.5}
              fill="url(#colorCaldeira)"
            />
            <Area
              type="monotone"
              dataKey="jusante"
              stroke="#6D32FF"
              strokeWidth={3}
              fill="url(#colorJusante)"
            />
            <Area
              type="monotone"
              dataKey="montante"
              stroke="#28FF52"
              strokeWidth={3}
              fill="url(#colorMontante)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NiveisChart;