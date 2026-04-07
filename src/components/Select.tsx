import React from 'react';
import { MaterialIcon } from './Icon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-[#191c1d] mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          className={`w-full px-4 py-2.5 pr-10 bg-[#f8f9fa] border border-[#bccbb9]/20 rounded-md focus:ring-2 focus:ring-[#006e2d] text-sm appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <MaterialIcon 
          name="expand_more"
          className="absolute right-3 text-[#555f70] pointer-events-none select-none" 
          style={{ 
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
      </div>
    </div>
  );
};