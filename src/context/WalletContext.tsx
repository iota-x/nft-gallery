"use client"
import { useWallet, UseWalletResult } from '@/app/hooks/useWallet';
import React, { createContext, useContext } from 'react';

interface WalletProviderProps {
  children: React.ReactNode; // Define children prop type
}

const WalletContext = createContext<UseWalletResult | undefined>(undefined);

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const walletState = useWallet();

  return (
    <WalletContext.Provider value={walletState}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
