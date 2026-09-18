import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 14,
  showText = true,
}) => {
  const rounded = Math.round(rating * 10) / 10;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-neutral-700">
          {rounded.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-neutral-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
