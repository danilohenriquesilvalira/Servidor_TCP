import React from 'react';

interface PortaMontanteProps {
  sidebarOpen?: boolean;
}

const PortaMontante: React.FC<PortaMontanteProps> = ({ sidebarOpen = true }) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header da Página */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Porta Montante</h1>
          <p className="text-sm text-gray-600 mt-1">
            Controle e monitoramento da porta montante
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-6 pb-6">
        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Porta Montante
              </h2>
              <p className="text-gray-600 max-w-md">
                Esta página será desenvolvida com os componentes de controle e 
                monitoramento específicos da porta montante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortaMontante;