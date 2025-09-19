import React from 'react';
import TagsViewer from '../components/Dashboard/TagsViewer'; 

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-full">
      
      {/* Descrição da página */}
      <div className="mb-6">
        <p className="text-base text-edp-neutral-dark font-edp leading-relaxed">
          Sistema de Controle Industrial EDP
        </p>
      </div>

      {/* Conteúdo principal - Preparado para receber componentes */}
      <div className="grid grid-cols-1 gap-6 h-full">
        
        {/* Tags WebSocket Viewer */}
        <TagsViewer />

        {/* Grid para componentes adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards para futuros componentes */}
          <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-6 h-48 flex items-center justify-center">
            <span className="text-edp-neutral-medium font-edp">Componente 1</span>
          </div>
          <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-6 h-48 flex items-center justify-center">
            <span className="text-edp-neutral-medium font-edp">Componente 2</span>
          </div>
          <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-6 h-48 flex items-center justify-center">
            <span className="text-edp-neutral-medium font-edp">Componente 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;