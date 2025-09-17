import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline' | 'login';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = [
    // INPUTS QUADRADOS EDP - SEM BORDER RADIUS
    'w-full font-edp transition-all duration-200',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-edp-neutral-100',
    'placeholder:text-edp-neutral-500'
  ];

  const variantClasses = {
    default: [
      // Input padrão com cores EDP
      'border-2 border-edp-neutral-400 bg-white text-edp-neutral-900',
      'hover:border-edp-neutral-600',
      'focus:border-edp-electric',
      error ? 'border-red-500 focus:border-red-500' : ''
    ],
    filled: [
      // Input preenchido com Slate Grey
      'border-2 border-transparent bg-edp-neutral-100 text-edp-neutral-900',
      'hover:bg-edp-neutral-200 focus:bg-white focus:border-edp-electric',
      error ? 'bg-red-50 border-red-500 focus:border-red-500' : ''
    ],
    outline: [
      // Input outline com Electric Green
      'border-2 border-edp-electric bg-transparent text-edp-neutral-900',
      'hover:border-edp-electric/80',
      'focus:border-edp-electric',
      error ? 'border-red-500 focus:border-red-500' : ''
    ],
    login: [
      // Input para página de login com tema dark
      'border-2 border-white/20 bg-white/10 text-white rounded-xl',
      'hover:border-white/30',
      'focus:border-edp-electric focus:bg-white/15',
      'placeholder:text-white/50',
      error ? 'border-red-400 focus:border-red-400' : ''
    ]
  };

  const paddingClasses = leftIcon || rightIcon 
    ? leftIcon && rightIcon 
      ? 'px-10 py-3'
      : leftIcon 
        ? 'pl-10 pr-4 py-3'
        : 'pl-4 pr-10 py-3'
    : 'px-4 py-3';

  const inputClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    paddingClasses,
    'min-h-[48px]',
    className
  ].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-edp font-medium mb-2 ${
            variant === 'login' ? 'text-white/90' : 'text-edp-neutral-800'
          }`}
        >
          {label}
        </label>
      )}
      
      <div className="relative group">
        {leftIcon && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
            variant === 'login' ? 'text-white/60 group-focus-within:text-edp-electric' : 'text-edp-neutral-500'
          }`}>
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
            variant === 'login' ? 'text-white/60' : 'text-edp-neutral-500'
          }`}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className={`mt-2 text-sm font-edp font-medium ${
          variant === 'login' ? 'text-red-400' : 'text-red-600'
        }`}>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm font-edp text-edp-neutral-600">
          {helper}
        </p>
      )}
    </div>
  );
});