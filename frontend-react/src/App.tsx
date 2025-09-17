import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PLCProvider } from './contexts/PLCContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';

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
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <UsersPage />
                    </Layout>
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