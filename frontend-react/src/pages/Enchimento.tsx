import React from 'react';

interface EnchimentoProps {
  sidebarOpen?: boolean;
}

const Enchimento: React.FC<EnchimentoProps> = ({ sidebarOpen = true }) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header da Página */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Enchimento</h1>
          <p className="text-sm text-gray-600 mt-1">
            Controle e monitoramento do sistema de enchimento
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 pb-6">
        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-purple-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de Enchimento
              </h2>
              <p className="text-gray-600 max-w-md">
                Esta página será desenvolvida com os componentes de controle e 
                monitoramento específicos do sistema de enchimento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enchimento;