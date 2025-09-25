import React from 'react';

interface StatusCardProps {
  title: string;
  variant: 'automatic' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  variant,
  className = ''
}) => {
  // Estilos baseados nos status industriais EDP
  const getVariantStyles = () => {
    switch (variant) {
      case 'automatic':
        return 'bg-[#00A3E0] border-blue-500'; // Azul EDP
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles} border rounded-md p-4 ${className}`}>
      <div className="text-center">
        <div className="text-sm font-bold text-white uppercase tracking-wide">
          {title}
        </div>
      </div>
    </div>
  );
};