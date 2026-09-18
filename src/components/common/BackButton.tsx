import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  fallbackUrl = '/',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      type="button"
      className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-[#0B132B] hover:text-[#FF6A00] font-bold text-xs border border-neutral-200 shadow-2xs transition-all active:scale-98 cursor-pointer group ${className}`}
      aria-label="Go to previous page"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#FF6A00]" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
