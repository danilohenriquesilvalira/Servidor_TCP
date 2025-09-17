import React from 'react';
import { Button } from '../components/ui/Button'; 
import { Input } from '../components/ui/Input'; 

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
        
        {/* Área de conteúdo principal - Pronta para componentes */}
        <div className="bg-white border border-edp-neutral-lighter rounded-lg shadow-sm p-6 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-edp font-semibold text-edp-neutral-darkest mb-6">
            Área de Conteúdo Principal
          </h3>
          
          {/* Container flex para conteúdo futuro */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-edp-neutral-medium">
              <p className="text-base font-edp mb-2">Esta área está preparada para receber:</p>
              <ul className="text-sm space-y-1">
                <li>• Dashboards de monitoramento</li>
                <li>• Controles industriais</li>
                <li>• Gráficos e métricas</li>
                <li>• Componentes customizados</li>
              </ul>
            </div>
          </div>
        </div>

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