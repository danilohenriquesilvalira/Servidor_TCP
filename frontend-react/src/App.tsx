import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PLCProvider } from './contexts/PLCContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header, Sidebar } from './components/layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <PLCProvider>
            <Routes>
              {/* Rota de Login - Pública */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rotas Protegidas - Sistema HMI */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    {/* Layout EDP Design System */}
                    <div className="min-h-screen bg-white">
                      <Header />
                      <Sidebar />
                      
                      {/* Main Content Area - Respects EDP spacing guidelines */}
                      <main className="pt-6 pb-20 lg:pb-6 lg:ml-24 bg-white min-h-screen transition-all duration-300">
                        <Dashboard />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              {/* Rota Raiz - Redireciona para Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rota 404 - Redireciona para Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PLCProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;