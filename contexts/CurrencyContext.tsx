import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency } from '../types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES: Record<Currency, { rate: number, symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  HKD: { rate: 7.8, symbol: 'HK$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to HKD since the app is HK focused
  const [currency, setCurrency] = useState<Currency>('HKD');

  const formatPrice = (priceInUSD: number) => {
    if (priceInUSD === 0) return RATES[currency].symbol + '0';
    
    const { rate, symbol } = RATES[currency];
    const value = priceInUSD * rate;
    
    // For USD, keep standard 2 decimal places without rounding up to integer
    if (currency === 'USD') {
      return `${symbol}${value.toFixed(2)}`;
    }

    // For non-USD, round up to nearest whole number as requested
    // e.g., 116.92 -> 117.00
    return `${symbol}${Math.ceil(value).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};