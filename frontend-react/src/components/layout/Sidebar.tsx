import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavItem = 'dashboard' | 'eclusa' | 'enchimento' | 'porta_jusante' | 'porta_montante' | 'usuarios';

export const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState<NavItem>('dashboard');
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obter a localização atual

  // Detectar se é mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);

  // Detectar a página atual automaticamente
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes('dashboard') || pathname === '/') {
      setActiveItem('dashboard');
    } else if (pathname.includes('eclusa') || pathname.includes('caldeira-eclusa')) {
      setActiveItem('eclusa');
    } else if (pathname.includes('porta_jusante')) {
      setActiveItem('porta_jusante');
    } else if (pathname.includes('porta_montante')) {
      setActiveItem('porta_montante');
    } else if (pathname.includes('enchimento')) {
      setActiveItem('enchimento');
    } else if (pathname.includes('usuarios')) {
      setActiveItem('usuarios');
    } else {
      setActiveItem('dashboard');
    }
  }, [location.pathname]); // Dependência para re-executar quando a rota mudar

  const handleItemClick = (itemId: NavItem, path: string) => {
    setActiveItem(itemId);
    navigate(path);
  };

  return (
    <>
      {/* Desktop Sidebar - Lateral esquerda - APENAS DESKTOP */}
      {!isMobile && (
        <div
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Container principal */}
        <div className={`relative transition-all duration-300 ease-out ${
          isHovered ? 'translate-x-0' : '-translate-x-[52px]'
        }`}>
        
        {/* 3 Traços quando recuado - APENAS DESKTOP */}
        <div className={`absolute left-[36px] top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 transition-opacity duration-300 hidden md:block ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="w-7 h-1 bg-edp-electric rounded-full shadow-md"></div>
          <div className="w-7 h-1 bg-edp-ice rounded-full shadow-md"></div>
          <div className="w-7 h-1 bg-edp-violet rounded-full shadow-md"></div>
        </div>

        {/* SVG Container - APENAS DESKTOP */}
        <div className={`transition-opacity duration-300 hidden md:block ${isHovered ? 'opacity-100' : 'opacity-0'} drop-shadow-lg`}>
          <svg width="88" height="620" viewBox="0 0 88 620" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.175 52C15.543 44 2.878 14 0 0V310H88V94C88 67 70.867 59.6 43.175 52Z" fill="#212E3E"/>
            <path d="M43.175 568C15.543 576 2.878 606 0 620V310H88V526C88 553 70.867 560.4 43.175 568Z" fill="#212E3E"/>
          </svg>

          {/* Navigation Icons - Heroicons Beautiful */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 py-12">
            
            {/* Dashboard - Home Icon */}
            <button 
              className={`
                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                ${activeItem === 'dashboard' 
                  ? 'text-black bg-edp-electric shadow-lg' 
                  : 'text-white hover:bg-edp-electric hover:text-black'
                }
              `}
              onClick={() => handleItemClick('dashboard', '/dashboard')}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </button>

            {/* Eclusa - Water Drop */}
            <button 
              className={`
                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                ${activeItem === 'eclusa' 
                  ? 'text-black bg-edp-electric shadow-lg' 
                  : 'text-white hover:bg-edp-electric hover:text-black'
                }
              `}
              onClick={() => handleItemClick('eclusa', '/caldeira-eclusa')}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
            </button>

            {/* Enchimento - Beaker */}
            <button 
              className={`
                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                ${activeItem === 'enchimento' 
                  ? 'text-black bg-edp-electric shadow-lg' 
                  : 'text-white hover:bg-edp-electric hover:text-black'
                }
              `}
              onClick={() => handleItemClick('enchimento', '/enchimento')}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 15.3m14.8 0a3 3 0 1 1-7.83 1.857M5 15.3a3 3 0 1 0 7.83 1.857m8.967-3.84a24.255 24.255 0 0 1-1.856.148 24.345 24.345 0 0 1-8.222 0m0 0V9.75a3.001 3.001 0 0 1 6 0v.823m-6-.823V9.75a3.001 3.001 0 0 1 6 0V10.5m0-.823a24.255 24.255 0 0 1 8.222-.148" />
              </svg>
            </button>

            {/* Porta Jusante - Adjustments */}
            <button 
              className={`
                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                ${activeItem === 'porta_jusante' 
                  ? 'text-black bg-edp-electric shadow-lg' 
                  : 'text-white hover:bg-edp-electric hover:text-black'
                }
              `}
              onClick={() => handleItemClick('porta_jusante', '/porta_jusante')}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </button>

            {/* Porta Montante - Cog */}
            <button 
              className={`
                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                ${activeItem === 'porta_montante' 
                  ? 'text-black bg-edp-electric shadow-lg' 
                  : 'text-white hover:bg-edp-electric hover:text-black'
                }
              `}
              onClick={() => handleItemClick('porta_montante', '/porta_montante')}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>

            {/* Usuários - Users */}
            <div className="mt-4">
              <button 
                className={`
                  w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                  ${activeItem === 'usuarios' 
                    ? 'text-black bg-edp-electric shadow-lg' 
                    : 'text-white hover:bg-edp-electric hover:text-black'
                  }
                `}
                onClick={() => handleItemClick('usuarios', '/usuarios')}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - EDP Padrões */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-edp-marine border-t-2 border-edp-neutral-600 h-16 w-full">
        <div className="grid grid-cols-6 gap-0 h-full">
          
          {/* Dashboard */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'dashboard' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('dashboard', '/dashboard')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              Home
            </span>
          </button>

          {/* Eclusa */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'eclusa' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('eclusa', '/caldeira-eclusa')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              Eclusa
            </span>
          </button>

          {/* Enchimento */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'enchimento' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('enchimento', '/enchimento')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 15.3m14.8 0a3 3 0 1 1-7.83 1.857M5 15.3a3 3 0 1 0 7.83 1.857m8.967-3.84a24.255 24.255 0 0 1-1.856.148 24.345 24.345 0 0 1-8.222 0m0 0V9.75a3.001 3.001 0 0 1 6 0v.823m-6-.823V9.75a3.001 3.001 0 0 1 6 0V10.5m0-.823a24.255 24.255 0 0 1 8.222-.148" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              Ench.
            </span>
          </button>

          {/* Porta Jusante */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'porta_jusante' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('porta_jusante', '/porta_jusante')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              P.Jus.
            </span>
          </button>

          {/* Porta Montante */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'porta_montante' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('porta_montante', '/porta_montante')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              P.Mon.
            </span>
          </button>

          {/* Usuários */}
          <button 
            className={`
              flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 h-full
              ${activeItem === 'usuarios' 
                ? 'text-edp-electric border-t-2 border-edp-electric bg-edp-electric/10' 
                : 'text-white hover:text-edp-electric hover:bg-edp-electric/5'
              }
            `}
            onClick={() => handleItemClick('usuarios', '/usuarios')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span className="text-[10px] font-edp font-medium text-center leading-tight">
              Users
            </span>
          </button>

        </div>
        </div>
      )}
    </>
  );
};