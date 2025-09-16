import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
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
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-edp-neutral-100',
    'placeholder:text-edp-neutral-500'
  ];

  const variantClasses = {
    default: [
      // Input padrão com cores EDP
      'border-2 border-edp-neutral-400 bg-white text-edp-neutral-900',
      'hover:border-edp-neutral-600',
      'focus:border-edp-electric focus:ring-edp-electric/30',
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
    ],
    filled: [
      // Input preenchido com Slate Grey
      'border-2 border-transparent bg-edp-neutral-100 text-edp-neutral-900',
      'hover:bg-edp-neutral-200 focus:bg-white focus:border-edp-electric',
      'focus:ring-edp-electric/30',
      error ? 'bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
    ],
    outline: [
      // Input outline com Electric Green
      'border-2 border-edp-electric bg-transparent text-edp-neutral-900',
      'hover:border-edp-electric/80',
      'focus:border-edp-electric focus:ring-edp-electric/30',
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''
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
          className="block text-sm font-edp font-medium text-edp-neutral-800 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-edp-neutral-500">
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-edp-neutral-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm font-edp text-red-600 font-medium">
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