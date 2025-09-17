import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-full min-h-screen flex bg-edp-neutral-white-wash">
      {/* Sidebar */}
      <div className="flex-shrink-0 h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Header */}
        <Header />

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto bg-edp-neutral-white-wash">
          <div className="container mx-auto p-6 max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};