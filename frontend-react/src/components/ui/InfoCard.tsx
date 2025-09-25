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
  // Estilos baseados no padrão industrial EDP
  const getVariantStyles = () => {
    switch (variant) {
      case 'status':
        return {
          container: 'bg-slate-800 border-slate-600',
          header: 'text-[#00A3E0] border-slate-600'
        };
      case 'motor':
        return {
          container: 'bg-slate-800 border-slate-600',
          header: 'text-[#00A3E0] border-slate-600'
        };
      case 'system':
        return {
          container: 'bg-slate-800 border-slate-600',
          header: 'text-[#00A3E0] border-slate-600'
        };
      default: // industrial
        return {
          container: 'bg-slate-800 border-slate-600',
          header: 'text-[#00A3E0] border-slate-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} border rounded-lg p-6 ${className}`}>
      {/* Header com título padrão industrial */}
      <div className={`text-base font-bold ${styles.header} uppercase tracking-wide mb-5 border-b pb-3`}>
        {title}
      </div>
      
      {/* Conteúdo */}
      <div>
        {children}
      </div>
    </div>
  );
};