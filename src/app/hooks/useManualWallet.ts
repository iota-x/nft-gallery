"use client";
import { useCallback, useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { walletsState, selectedWalletState, selectedAccountState, walletErrorState } from '@/app/state/walletState';

export const useManualWallet = () => {
  const [wallets, setWallets] = useRecoilState(walletsState);
  const setSelectedWallet = useSetRecoilState(selectedWalletState);
  const setSelectedAccount = useSetRecoilState(selectedAccountState);
  const setError = useSetRecoilState(walletErrorState);

  const [manualAddress, setManualAddress] = useState<string | null>(null);
  const [manualWalletError, setManualWalletError] = useState<string | null>(null);

  // Function to add a manual wallet
  const addManualWallet = useCallback(() => {
    if (manualAddress) {
      try {
        const publicKey = new PublicKey(manualAddress);
        const updatedWallets = [...wallets, {
          name: 'Manual',
          publicKey,
          isConnected: true,
          accounts: [publicKey],
        }];
        setWallets(updatedWallets);
        localStorage.setItem('wallets', JSON.stringify(updatedWallets));
        localStorage.setItem('manualWalletAddress', manualAddress);
        setSelectedWallet('Manual');
        setSelectedAccount(publicKey);
        setManualAddress(null); // Reset manualAddress after adding
      } catch (error) {
        setManualWalletError('Invalid wallet address');
      }
    }
  }, [manualAddress, wallets, setWallets, setSelectedWallet, setSelectedAccount]);

  // Function to handle manual wallet address change
  const handleManualAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setManualAddress(e.target.value);
    setManualWalletError(null); // Reset error on change
  }, []);

  // Function to disconnect the manual wallet
  const disconnectManualWallet = useCallback(() => {
    const updatedWallets = wallets.filter(wallet => wallet.name !== 'Manual');
    setWallets(updatedWallets);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    localStorage.removeItem('manualWalletAddress');
    setSelectedWallet(null);
    setSelectedAccount(null);
    setManualAddress(null); // Reset manualAddress
  }, [wallets, setWallets, setSelectedWallet, setSelectedAccount]);

  // Detect wallets and synchronize state across tabs
  const detectWallets = useCallback(() => {
    if (manualAddress) {
      const detectedWallets = wallets.filter(wallet => wallet.name === 'Manual');
      if (!detectedWallets.length) {
        addManualWallet();
      }
    }
  }, [wallets, manualAddress, addManualWallet]);

  // Synchronize wallet state across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'wallets') {
        const updatedWallets = event.newValue
          ? JSON.parse(event.newValue)
          : [];
        if (JSON.stringify(wallets) !== JSON.stringify(updatedWallets)) {
          setWallets(updatedWallets);
          const connectedWallet = updatedWallets.find(
            (wallet: any) => wallet.isConnected && wallet.name === 'Manual'
          );
          if (connectedWallet) {
            setSelectedWallet(connectedWallet.name);
            setSelectedAccount(
              connectedWallet.publicKey
                ? new PublicKey(connectedWallet.publicKey)
                : null
            );
          } else {
            setSelectedWallet(null);
            setSelectedAccount(null);
          }
        }
      }
      if (event.key === 'manualWalletAddress') {
        const updatedManualAddress = event.newValue || null;
        if (manualAddress !== updatedManualAddress) {
          setManualAddress(updatedManualAddress);
          if (updatedManualAddress) {
            detectWallets();
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [wallets, manualAddress, setWallets, setSelectedWallet, setSelectedAccount, detectWallets]);

  // Load wallet state from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize manual wallet address in local storage if it doesn't exist
      if (localStorage.getItem('manualWalletAddress') === null) {
        localStorage.setItem('manualWalletAddress', 'null');
      }

      const savedWallets = localStorage.getItem('wallets');
      const savedManualAddress = localStorage.getItem('manualWalletAddress');

      if (savedWallets) {
        const parsedWallets = JSON.parse(savedWallets);

        if (JSON.stringify(wallets) !== JSON.stringify(parsedWallets)) {
          setWallets(parsedWallets);

          // Update state with manual wallet address from local storage
          if (savedManualAddress && savedManualAddress !== 'null') {
            setManualAddress(savedManualAddress);
            detectWallets();
          } else {
            setManualAddress(null);
          }

          const connectedWallet = parsedWallets.find(
            (wallet: any) => wallet.isConnected && wallet.name === 'Manual'
          );
          if (connectedWallet) {
            setSelectedWallet(connectedWallet.name);
            setSelectedAccount(
              connectedWallet.publicKey
                ? new PublicKey(connectedWallet.publicKey)
                : null
            );
          } else {
            setSelectedWallet(null);
            setSelectedAccount(null);
          }
        }
      }
    }
  }, [detectWallets, setWallets, setSelectedWallet, setSelectedAccount, wallets]);

  return {
    manualAddress,
    manualWalletError,
    handleManualAddressChange,
    addManualWallet,
    disconnectManualWallet,
  };
};
