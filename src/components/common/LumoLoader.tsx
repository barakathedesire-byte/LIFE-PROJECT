import React from 'react';
import { motion } from 'motion/react';

interface LumoLoaderProps {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  className?: string;
  text?: string;
}

export const LumoLoader: React.FC<LumoLoaderProps> = ({
  size = 'medium',
  className = '',
  text,
}) => {
  // Size dimension mappings for the star icon
  const sizeMap = {
    small: 'w-5 h-5',
    medium: 'w-9 h-9',
    large: 'w-14 h-14',
    fullscreen: 'w-16 h-16',
  };

  const containerSizes = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3',
    fullscreen: 'fixed inset-0 z-[9999] bg-[#0B132B]/90 backdrop-blur-md flex flex-col items-center justify-center text-white',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${size === 'fullscreen' ? containerSizes.fullscreen : className}`}>
      <div className={`relative flex items-center justify-center ${size === 'fullscreen' ? 'w-24 h-24' : ''}`}>
        {/* Subtle Cyan/Blue luminous sweep & warm orange glow aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6A00]/40 via-cyan-400/30 to-blue-500/30 blur-xl pointer-events-none"
        />

        {/* Lumo Star / O-Symbol Vector Asset with pulse, rotation, and glow */}
        <motion.div
          animate={{
            scale: [1, 1.07, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${size === 'fullscreen' ? 'w-20 h-20' : sizeMap[size]} relative z-10 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,106,0,0.5)]`}
        >
          <svg
            viewBox="225 2 95 95"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Loading"
            role="img"
          >
            {/* Outer Sun Rays at top-right (3 rays) */}
            <path
              d="M 284 14 L 286 6 C 286.3 4.5 288 3.8 289.2 4.5 L 290 5 C 291.2 5.7 291.5 7.4 290.8 8.6 L 288 15.5 Z"
              fill="#FF6A00"
            />
            <path
              d="M 296 23 L 304 18 C 305.5 17.2 307.2 18 307.8 19.5 L 308.2 20.5 C 308.8 22 308 23.7 306.5 24.3 L 299 27 Z"
              fill="#FF6A00"
            />
            <path
              d="M 298 37 L 307 38 C 308.8 38.2 310 39.8 309.8 41.5 L 309.6 42.5 C 309.4 44.2 307.8 45.4 306 45.2 L 297 43.5 Z"
              fill="#FF6A00"
            />

            {/* Main 'O' Circle Ring */}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 268 86.5 C 287.3 86.5 303 70.8 303 51.5 C 303 32.2 287.3 16.5 268 16.5 C 248.7 16.5 233 32.2 233 51.5 C 233 70.8 248.7 86.5 268 86.5 Z M 268 70 C 278.2 70 286.5 61.7 286.5 51.5 C 286.5 41.3 278.2 33 268 33 C 257.8 33 249.5 41.3 249.5 51.5 C 249.5 61.7 257.8 70 268 70 Z"
              fill="#FF6A00"
            />

            {/* Inner 4-point Sparkle/Diamond Star */}
            <path
              d="M 268 36 C 268.5 44 274.5 50.5 282.5 51.5 C 274.5 52.5 268.5 59 268 67 C 267.5 59 261.5 52.5 253.5 51.5 C 261.5 50.5 267.5 44 268 36 Z"
              fill="#FF6A00"
            />
          </svg>
        </motion.div>
      </div>

      {(text || size === 'fullscreen') && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <p className={`font-bold tracking-wide ${size === 'fullscreen' ? 'text-white text-sm' : 'text-slate-700 text-xs'}`}>
            {text || (size === 'fullscreen' ? 'Loading LUMO Platform...' : '')}
          </p>
          {size === 'fullscreen' && (
            <p className="text-[11px] text-cyan-300/80 font-medium tracking-wider uppercase">
              Secure Escrow & Enterprise Commerce
            </p>
          )}
        </motion.div>
      )}
    </div>
  );

  return content;
};
