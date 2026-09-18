import React from 'react';

interface LumoStarIconProps {
  className?: string;
  size?: number | string;
  color?: string;
  variant?: 'solid' | 'badge' | 'loading';
}

export const LumoStarIcon: React.FC<LumoStarIconProps> = ({
  className = '',
  size = 24,
  color = '#FF6A00',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="LUMO Star"
      role="img"
    >
      {/* 3 Top-Right Burst Rays */}
      <path
        d="M 68 18 L 71 8 C 71.4 6.5 73.1 5.8 74.3 6.5 L 75.1 7 C 76.3 7.7 76.6 9.4 75.9 10.6 L 73 19.5 Z"
        fill={color}
      />
      <path
        d="M 80 27 L 88 22 C 89.5 21.2 91.2 22 91.8 23.5 L 92.2 24.5 C 92.8 26 92 27.7 90.5 28.3 L 83 31 Z"
        fill={color}
      />
      <path
        d="M 82 41 L 91 42 C 92.8 42.2 94 43.8 93.8 45.5 L 93.6 46.5 C 93.4 48.2 91.8 49.4 90 49.2 L 81 47.5 Z"
        fill={color}
      />

      {/* Outer Circle Ring */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 50 88 C 71 88 88 71 88 50 C 88 29 71 12 50 12 C 29 12 12 29 12 50 C 12 71 29 88 50 88 Z M 50 72 C 62.1 72 72 62.1 72 50 C 72 37.9 62.1 28 50 28 C 37.9 28 28 37.9 28 50 C 28 62.1 37.9 72 50 72 Z"
        fill={color}
      />

      {/* Inner 4-Point Sparkle Star */}
      <path
        d="M 50 32 C 50.5 41.5 58.5 49.5 68 50 C 58.5 50.5 50.5 58.5 50 68 C 49.5 58.5 41.5 50.5 32 50 C 41.5 49.5 49.5 41.5 50 32 Z"
        fill={color}
      />
    </svg>
  );
};

