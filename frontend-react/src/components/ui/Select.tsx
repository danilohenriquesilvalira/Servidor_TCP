import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  error,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-edp font-medium text-edp-neutral-darkest mb-2">
          {label}
          {required && <span className="text-edp-semantic-red ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg font-edp text-edp-neutral-darkest bg-white
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-edp-electric focus:border-edp-electric
            transition-colors duration-200
            ${error 
              ? 'border-edp-semantic-red focus:ring-edp-semantic-red focus:border-edp-semantic-red' 
              : 'border-edp-neutral-lighter hover:border-edp-neutral-light'
            }
            ${disabled 
              ? 'bg-edp-neutral-white-wash text-edp-neutral-medium cursor-not-allowed' 
              : ''
            }
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDownIcon className={`
          absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none
          ${disabled ? 'text-edp-neutral-medium' : 'text-edp-neutral-dark'}
        `} />
      </div>

      {error && (
        <p className="mt-1 text-sm text-edp-semantic-red font-edp">{error}</p>
      )}
    </div>
  );
};