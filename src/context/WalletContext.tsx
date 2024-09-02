"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { useWallet } from '@/app/hooks/useWallet';
import { useManualWallet } from '@/app/hooks/useManualWallet'; // Import the new hook
import { Wallet, walletErrorState, isLoadingState } from '@/app/state/walletState';
import { PublicKey } from '@solana/web3.js';

interface WalletContextProps {
  wallets: Wallet[];
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: (walletName: string) => void;
  selectAccount: (walletName: string, account: PublicKey) => void;
  manualWalletData: {
    address: string | null;
    error: string | null;
    handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addManualWallet: (address: string) => void;
    disconnectManualWallet: () => void;
  };
  error: string | null;
  loading: boolean;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { wallets, connectWallet, disconnectWallet, selectAccount } = useWallet();
  const {
    manualAddress,
    manualWalletError,
    handleManualAddressChange,
    addManualWallet,
    disconnectManualWallet
  } = useManualWallet();

  const error = useRecoilValue(walletErrorState);
  const loading = useRecoilValue(isLoadingState);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        connectWallet,
        disconnectWallet,
        selectAccount,
        manualWalletData: {
          address: manualAddress,
          error: manualWalletError,
          handleAddressChange: handleManualAddressChange,
          addManualWallet,
          disconnectManualWallet
        },
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
