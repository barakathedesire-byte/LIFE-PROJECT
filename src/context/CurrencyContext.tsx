import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, CURRENCY_RATES, formatCurrency as formatCurrencyUtil } from '../utils/formatters';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumo_currency') as CurrencyCode;
      if (saved && CURRENCY_RATES[saved]) return saved;
    }
    return 'TZS';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumo_currency', code);
      // Dispatch storage event or custom event for non-react or global listeners
      window.dispatchEvent(new Event('currency-change'));
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('lumo_currency') as CurrencyCode;
      if (saved && CURRENCY_RATES[saved]) {
        setCurrencyState(saved);
      }
    };
    window.addEventListener('currency-change', handleStorage);
    return () => window.removeEventListener('currency-change', handleStorage);
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
