import React, { useState, useEffect } from 'react';
import ResponsiveWrapper from '@/components/ResponsiveWrapper';

interface PortaJusanteReguaProps {
  editMode?: boolean;
  componentId?: string;
  className?: string;
  nivel?: number;
  abertura?: number;
  websocketData?: any;
}

const PortaJusanteRegua: React.FC<PortaJusanteReguaProps> = ({
  editMode = false,
  componentId = 'porta-jusante-regua',
  className = '',
  nivel,
  abertura: aberturaExterna,
  websocketData
}) => {
  const [aberturaInterna, setAberturaInterna] = useState(0);
  
  const valorAbertura = aberturaExterna !== undefined 
    ? aberturaExterna 
    : nivel !== undefined 
      ? nivel 
      : aberturaInterna;
  
  const handleAberturaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAberturaInterna(Number(event.target.value));
  };

  useEffect(() => {
    if (nivel !== undefined) {
      setAberturaInterna(nivel);
    } else if (aberturaExterna !== undefined) {
      setAberturaInterna(aberturaExterna);
    }
  }, [nivel, aberturaExterna]);

  const maxDeslocamento = 300;
  const deslocamentoVertical = (valorAbertura / 100) * maxDeslocamento;

  return (
    <ResponsiveWrapper 
      componentId={componentId}
      editMode={editMode}
      allowOverflow={true} // NOVO: Permite overflow para movimento
      defaultConfig={{
        xs: { x: 100, y: 100, width: 300, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        sm: { x: 150, y: 150, width: 350, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        md: { x: 200, y: 200, width: 400, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        lg: { x: 250, y: 250, width: 435, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        xl: { x: 300, y: 300, width: 435, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        '2xl': { x: 350, y: 350, width: 435, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        '3xl': { x: 400, y: 400, width: 435, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 },
        '4xl': { x: 450, y: 450, width: 435, height: 438, scale: 1, zIndex: 25, opacity: 1, rotation: 0 }
      }}
    >
      <div 
        className={`relative ${className} ${editMode ? 'border-2 border-blue-500 bg-blue-50/20' : ''}`} 
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'visible' // Permite que o conteúdo saia dos limites
        }}
      >
        {/* Container para o movimento */}
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            bottom: `${deslocamentoVertical}px`,
            transition: 'bottom 0.3s ease-in-out'
          }}
        >
          <img
            src="/PortaJusante/Porta_Jusante_Regua.svg"
            alt="Porta Jusante Régua"
            width="435"
            height="438"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        </div>
        
        {editMode && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
            Porta Jusante Régua ({valorAbertura}%)
          </div>
        )}
        
        {nivel === undefined && aberturaExterna === undefined && !websocketData && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              top: '-60px',
              zIndex: 10
            }}
          >
            <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="text-white font-bold min-w-16">Abertura</span>
              <input
                type="range"
                min="0"
                max="100"
                value={aberturaInterna}
                onChange={handleAberturaChange}
                className="cursor-pointer h-2 w-32 rounded-lg appearance-none bg-gray-700"
              />
              <span className="text-white font-bold min-w-10">{valorAbertura}%</span>
            </div>
          </div>
        )}
      </div>
    </ResponsiveWrapper>
  );
};

export default PortaJusanteRegua;