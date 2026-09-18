import React from 'react';
import { LumoStarIcon } from './LumoStarIcon';

interface VerifiedMerchantBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  sellerRating?: number;
  isOfficialStore?: boolean;
}

export const VerifiedMerchantBadge: React.FC<VerifiedMerchantBadgeProps> = ({
  className = '',
  size = 'sm',
  showText = true,
  text = 'Verified Merchant',
  sellerRating,
}) => {
  const sizeStyles = {
    xs: {
      starSize: 11,
      container: 'px-1.5 py-0.5 text-[9px] gap-1',
      font: 'text-[9px]',
    },
    sm: {
      starSize: 13,
      container: 'px-2 py-0.5 text-[10px] gap-1',
      font: 'text-[10px]',
    },
    md: {
      starSize: 15,
      container: 'px-2.5 py-1 text-xs gap-1.5',
      font: 'text-xs',
    },
    lg: {
      starSize: 18,
      container: 'px-3 py-1.5 text-sm gap-2',
      font: 'text-sm',
    },
  };

  const current = sizeStyles[size] || sizeStyles.sm;

  return (
    <div
      title="LUMO Officially Verified Merchant — Passed complete business KYC & compliance verification"
      className={`inline-flex items-center rounded-md font-extrabold bg-orange-50/90 text-orange-950 border border-orange-200/90 shadow-2xs select-none transition-all hover:bg-orange-100 ${current.container} ${className}`}
    >
      <LumoStarIcon size={current.starSize} color="#FF6A00" />
      {showText && (
        <span className={`tracking-tight ${current.font} font-black text-[#B84000] flex items-center gap-1`}>
          <span>{text}</span>
          {sellerRating && (
            <span className="text-neutral-500 font-normal">({sellerRating}★)</span>
          )}
        </span>
      )}
    </div>
  );
};
