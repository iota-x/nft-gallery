"use client";
import { useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { walletsState, selectedWalletState, selectedAccountState, walletErrorState, isLoadingState, Wallet } from '@/app/state/walletState';

export const useWallet = () => {
  const [wallets, setWallets] = useRecoilState(walletsState);
  const setSelectedWallet = useSetRecoilState(selectedWalletState);
  const setSelectedAccount = useSetRecoilState(selectedAccountState);
  const setError = useSetRecoilState(walletErrorState);
  const setLoading = useSetRecoilState(isLoadingState);

  // Function to update the wallet state
  const updateWallet = useCallback(
    (walletName: string, publicKey: PublicKey) => {
      const updatedWallet: Wallet = {
        name: walletName,
        publicKey,
        isConnected: true,
        accounts: [publicKey],
      };
      const updatedWallets = wallets.map((wallet) =>
        wallet.name === walletName ? updatedWallet : wallet
      );
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      setSelectedWallet(walletName);
      setSelectedAccount(publicKey);
    },
    [wallets, setWallets, setSelectedWallet, setSelectedAccount]
  );

  // Function to connect to a wallet
  const connectWallet = useCallback(
    async (walletName: string) => {
      setLoading(true);
      try {
        let walletProvider: any;
        let response: any;

        if (walletName === 'Phantom') {
          walletProvider = window.solana;
          response = await walletProvider.connect();
        } else if (walletName === 'Backpack') {
          walletProvider = window.backpack;
          response = await walletProvider.connect();
        }

        if (response?.publicKey) {
          const publicKey = new PublicKey(response.publicKey.toString());
          updateWallet(walletName, publicKey);
        }
      } catch (error) {
        setError(
          `Failed to connect to ${walletName}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, updateWallet]
  );

  // Function to disconnect from a wallet
  const disconnectWallet = useCallback(
    (walletName: string) => {
      const updatedWallets = wallets.map((wallet) =>
        wallet.name === walletName
          ? { ...wallet, publicKey: null, isConnected: false, accounts: [] }
          : wallet
      );
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      setSelectedWallet(null);
      setSelectedAccount(null);
    },
    [wallets, setWallets, setSelectedWallet, setSelectedAccount]
  );

  // Function to select an account
  const selectAccount = useCallback(
    (walletName: string, account: PublicKey) => {
      const updatedWallets = wallets.map((wallet) =>
        wallet.name === walletName ? { ...wallet, publicKey: account } : wallet
      );
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      setSelectedAccount(account);
    },
    [wallets, setWallets, setSelectedAccount]
  );

  // Detect wallet extensions once on mount
  const detectWalletExtensions = useCallback(() => {
    const detectedWallets: Wallet[] = [];

    // Detect Phantom wallet
    if (window.solana?.isPhantom) {
      detectedWallets.push({
        name: 'Phantom',
        publicKey: null,
        isConnected: false,
        accounts: [],
      });
    }

    // Detect Backpack wallet
    if (window.backpack) {
      detectedWallets.push({
        name: 'Backpack',
        publicKey: null,
        isConnected: false,
        accounts: [],
      });
    }

    // If new wallets are detected, update state and local storage
    const newWallets = [
      ...wallets,
      ...detectedWallets.filter(
        (w) => !wallets.some((existing) => existing.name === w.name)
      ),
    ];

    if (newWallets.length !== wallets.length) {
      setWallets(newWallets);
      localStorage.setItem('wallets', JSON.stringify(newWallets));
    }
  }, [wallets, setWallets]);

  // Load wallet state from local storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      const parsedWallets = JSON.parse(savedWallets);

      // Only update state if the parsed wallets are different
      if (JSON.stringify(wallets) !== JSON.stringify(parsedWallets)) {
        setWallets(parsedWallets);

        // Set selected wallet and account if a wallet is connected
        const connectedWallet = parsedWallets.find(
          (wallet: Wallet) => wallet.isConnected
        );
        if (connectedWallet) {
          setSelectedWallet(connectedWallet.name);
          setSelectedAccount(
            connectedWallet.publicKey
              ? new PublicKey(connectedWallet.publicKey)
              : null
          );
        }
      }
    }

    detectWalletExtensions(); // Detect wallets on first render
  }, [detectWalletExtensions, setWallets, setSelectedWallet, setSelectedAccount, wallets]);

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
            (wallet: Wallet) => wallet.isConnected
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
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [wallets, setWallets, setSelectedWallet, setSelectedAccount]);

  return {
    wallets,
    connectWallet,
    disconnectWallet,
    selectAccount,
  };
};
