import React from 'react';
import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  variant?: 'industrial' | 'status' | 'motor' | 'system';
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  variant = 'industrial',
  className = ''
}) => {
  // Estilos modernos baseados no padrão EDP
  const getVariantStyles = () => {
    switch (variant) {
      case 'status':
        return {
          container: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200/60',
          header: 'text-white'
        };
      case 'motor':
        return {
          container: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200/60',
          header: 'text-white'
        };
      case 'system':
        return {
          container: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200/60',
          header: 'text-white'
        };
      default: // industrial
        return {
          container: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200/60',
          header: 'text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} border rounded-xl shadow-lg backdrop-blur-sm ${className} overflow-hidden`}>
      {/* Header Moderno com Gradiente */}
      <div className={`bg-edp-marine text-white px-6 py-4`}>
        <h3 className="text-lg font-edp font-bold uppercase tracking-wide">
          {title}
        </h3>
      </div>
      
      {/* Conteúdo com Padding Melhorado */}
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
};