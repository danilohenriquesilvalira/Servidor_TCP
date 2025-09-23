import React from 'react';

interface PortaJusanteProps {
  sidebarOpen?: boolean;
}

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

  // Cálculo das proporções baseado no aspect ratio real do SVG
  const portaJusanteAspectRatio = 1075 / 1098; // Baseado no SVG real: width="1075" height="1098"
  
  // Calcular dimensões otimizadas para o container disponível
  const padding = isMobile ? 16 : 32; // Padding responsivo
  const maxWidth = Math.min(containerDimensions.width - padding, 1920); // Margem responsiva
  
  // Calcular dimensões considerando altura disponível
  const availableHeight = windowDimensions.height - 100; // 100px para header e margens
  
  // Calcular por largura
  let basePortaWidth = maxWidth;
  let basePortaHeight = basePortaWidth / portaJusanteAspectRatio;
  
  // Se a altura calculada exceder o espaço disponível, ajustar pela altura
  if (basePortaHeight > availableHeight) {
    basePortaHeight = availableHeight * 0.9; // 90% da altura disponível
    basePortaWidth = basePortaHeight * portaJusanteAspectRatio;
  }
  
  // Garantir dimensões mínimas responsivas
  const minWidth = isMobile ? 280 : 400;
  const minHeight = minWidth / portaJusanteAspectRatio;
  
  basePortaWidth = Math.max(minWidth, basePortaWidth);
  basePortaHeight = Math.max(minHeight, basePortaHeight);
  
  // Debug das dimensões (remover em produção)
  console.log('🔍 PortaJusante - Dimensões calculadas:', {
    tela: { width: windowDimensions.width, height: windowDimensions.height },
    container: { width: containerDimensions.width, height: containerDimensions.height },
    disponivel: { width: maxWidth, height: availableHeight },
    calculado: { width: basePortaWidth, height: basePortaHeight },
    aspectRatio: portaJusanteAspectRatio,
    isMobile
  });

  return (
    <div className="w-full h-auto flex flex-col items-center">

      {/* Container do SVG */}
      <div 
        ref={containerRef}
        className="w-full max-w-[1920px] flex flex-col items-center relative"
        style={{
          minHeight: isMobile ? '50vh' : '60vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          padding: `${padding}px`
        }}
      >

        {containerDimensions.width > 100 && windowDimensions.width > 0 ? (
          <div 
            className="relative w-full flex flex-col items-center justify-center"
            style={{
              maxWidth: `${maxWidth}px`,
              height: `${basePortaHeight}px`,
              minHeight: `${basePortaHeight}px`
            }}
          >
            {/* SVG Base Porta Jusante */}
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