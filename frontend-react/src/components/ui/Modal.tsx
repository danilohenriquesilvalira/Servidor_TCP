import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Suave entrada
      setTimeout(() => setIsAnimating(false), 10);
    } else if (isVisible) {
      handleClose();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
      onClose();
    }, 200); // Duração da animação de saída
  };

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop Moderno com Blur */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal Container Responsivo */}
      <div className="flex min-h-full items-start sm:items-center justify-center p-2 sm:p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out ${
            isAnimating 
              ? 'opacity-0 scale-95 translate-y-4' 
              : 'opacity-100 scale-100 translate-y-0'
          } max-h-[95vh] sm:max-h-[90vh] flex flex-col`}
        >
          
          {/* Header Moderno */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-[#7C9599] to-[#212E3E] rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800 tracking-tight">
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="group w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              aria-label="Fechar modal"
            >
              <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Content Scrollável */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </div>

          {/* Footer com Gradient Sutil */}
          <div className="h-2 bg-gradient-to-r from-[#7C9599]/10 via-transparent to-[#212E3E]/10 rounded-b-2xl"></div>
        </div>
      </div>
    </div>
  );
};