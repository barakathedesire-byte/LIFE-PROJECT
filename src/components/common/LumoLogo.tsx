import React from 'react';
import { LumoStarIcon } from './LumoStarIcon';

interface LumoLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LumoLogo: React.FC<LumoLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
}) => {
  // Sizing maps
  const starSizes = {
    sm: 24,
    md: 32,
    lg: 42,
    xl: 52,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const textColor = variant === 'light' ? '#FFFFFF' : '#0B132B';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <LumoStarIcon size={starSizes[size]} color="#FF6A00" />
    </div>
  );
};

