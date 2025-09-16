import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PLCProvider } from './contexts/PLCContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header, Sidebar } from './components/layout';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <PLCProvider>
          {/* EDP Design System Layout */}
          <div className="min-h-screen bg-white">
            {/* Linha editada: removemos o título do cabeçalho */}
            <Header />
            <Sidebar />
            
            {/* Main Content Area - Respects EDP spacing guidelines */}
            <main className="pt-6 pb-20 lg:pb-6 lg:ml-24 bg-white min-h-screen transition-all duration-300">
              <Dashboard />
            </main>
          </div>
        </PLCProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;