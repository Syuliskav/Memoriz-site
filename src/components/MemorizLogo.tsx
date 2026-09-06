import React from 'react';

interface MemorizLogoProps {
  className?: string;
  size?: number;
}

export const MemorizLogo: React.FC<MemorizLogoProps> = ({ 
  className = "w-7 h-7 sm:w-8 sm:h-8", 
  size = 32 
}) => {
  return (
    <div 
      className={`rounded-lg overflow-hidden shrink-0 shadow-sm flex items-center justify-center relative ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/icon.svg" 
        alt="Memoriz Logo" 
        className="w-full h-full object-contain rounded-lg emoji-filter"
      />
    </div>
  );
};
