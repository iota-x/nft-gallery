"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { useWallet } from '@/app/hooks/useWallet';
import { Wallet, walletErrorState, isLoadingState } from '@/app/state/walletState';
import { PublicKey } from '@solana/web3.js'; // Import PublicKey

interface WalletContextProps {
  wallets: Wallet[];
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: (walletName: string) => void;
  selectAccount: (walletName: string, account: PublicKey) => void; // Updated type
  setManualWallet: (address: string) => void;
  error: string | null;
  loading: boolean;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { wallets, connectWallet, disconnectWallet, selectAccount, setManualWallet } = useWallet();

  const error = useRecoilValue(walletErrorState);
  const loading = useRecoilValue(isLoadingState);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        connectWallet,
        disconnectWallet,
        selectAccount,
        setManualWallet,
        error,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
