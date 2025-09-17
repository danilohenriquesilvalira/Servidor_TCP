import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = [
    // BOTÕES QUADRADOS EDP - SEM BORDER RADIUS
    'inline-flex items-center justify-center font-edp font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ];

  const variantClasses = {
    primary: [
      // Electric Green com TEXTO PRETO (conforme diretrizes de contraste EDP)
      'bg-edp-electric text-black shadow-sm font-semibold',
      'hover:bg-edp-electric/90 active:bg-edp-electric/80',
      'border-2 border-edp-electric hover:border-edp-electric/90',
      'focus:ring-edp-electric/30'
    ],
    secondary: [
      // Marine Blue com TEXTO BRANCO (conforme diretrizes)
      'bg-edp-marine text-white shadow-sm font-semibold',
      'hover:bg-edp-marine/90 active:bg-edp-marine/80',
      'border-2 border-edp-marine hover:border-edp-marine/90',
      'focus:ring-edp-marine/30'
    ],
    outline: [
      // Fundo neutro com texto Marine Blue (seguindo diretrizes EDP)
      'bg-edp-neutral-white-wash text-edp-marine shadow-sm font-semibold',
      'hover:bg-edp-electric hover:text-black active:bg-edp-electric/90 active:text-black',
      'border-2 border-edp-neutral-lighter hover:border-edp-electric',
      'focus:ring-edp-electric/30'
    ],
    ghost: [
      // Marine Blue sobre fundo transparente
      'bg-transparent text-edp-marine font-medium',
      'hover:bg-edp-marine/10 active:bg-edp-marine/20',
      'border-2 border-transparent',
      'focus:ring-edp-marine/30'
    ]
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};