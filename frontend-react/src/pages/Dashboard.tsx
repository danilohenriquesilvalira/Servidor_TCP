import React from 'react';
import { Button } from '../components/ui/Button'; 
import { Input } from '../components/ui/Input'; 

const EclusaRegua: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Linha de debug para grid - apenas desktop */}
      <div className="hidden lg:block fixed left-24 top-24 bottom-0 border-l-2 border-dashed border-edp-electric/30 opacity-50 z-10"></div>
      
      {/* Header da página - EDP Typography Scale */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-edp font-bold text-edp-neutral-900 mb-3 leading-tight">
          Eclusa Reguá
        </h1>
        <p className="text-xl text-edp-neutral-700 font-edp leading-relaxed">
          Sistema de Controle Industrial EDP
        </p>
      </div>

      {/* Conteúdo da Eclusa Reguá irá aqui */}
      {/* Adicionando exemplos de botões e input */}
      <div className="bg-white border-2 border-edp-neutral-300 p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-edp font-semibold text-edp-neutral-800 mb-6">
          Exemplos de Componentes de UI
        </h3>

        {/* Exemplo de Input */}
        <div className="mb-8">
          <h4 className="text-lg font-edp font-semibold text-edp-neutral-700 mb-4">
            Input de Exemplo
          </h4>
          <Input label="Leitura do Sensor" placeholder="Digite o valor aqui..." />
        </div>

        {/* Exemplo de Botões */}
        <div>
          <h4 className="text-lg font-edp font-semibold text-edp-neutral-700 mb-4">
            Botões
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Ação Primária
            </Button>
            <Button variant="secondary" size="md">
              Ação Secundária
            </Button>
            <Button variant="outline" size="md">
              Ação de Destaque
            </Button>
            <Button variant="ghost" size="md">
              Ação Leve
            </Button>
            <Button variant="primary" size="md" disabled>
              Desabilitado
            </Button>
            <Button variant="primary" size="md" isLoading>
              Carregando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EclusaRegua;