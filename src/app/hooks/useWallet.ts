"use client";
import { useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { walletsState, selectedWalletState, selectedAccountState, walletErrorState, isLoadingState, Wallet } from '@/app/state/walletState';

export const useWallet = () => {
  const [wallets, setWallets] = useRecoilState(walletsState);
  const setSelectedWallet = useSetRecoilState(selectedWalletState);
  const setSelectedAccount = useSetRecoilState(selectedAccountState);
  const setError = useSetRecoilState(walletErrorState);
  const setLoading = useSetRecoilState(isLoadingState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load wallet state from local storage
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      const parsedWallets = JSON.parse(savedWallets);
      setWallets(parsedWallets);

      // Set selected wallet and account based on saved state
      const connectedWallet = parsedWallets.find((wallet: Wallet) => wallet.isConnected);
      if (connectedWallet) {
        setSelectedWallet(connectedWallet.name);
        setSelectedAccount(connectedWallet.publicKey ? new PublicKey(connectedWallet.publicKey) : null);
      }
    }

    // Synchronize state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'wallets') {
        const updatedWallets = event.newValue ? JSON.parse(event.newValue) : [];
        setWallets(updatedWallets);
        const connectedWallet = updatedWallets.find((wallet: Wallet) => wallet.isConnected);
        if (connectedWallet) {
          setSelectedWallet(connectedWallet.name);
          setSelectedAccount(connectedWallet.publicKey ? new PublicKey(connectedWallet.publicKey) : null);
        } else {
          setSelectedWallet(null);
          setSelectedAccount(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setWallets, setSelectedWallet, setSelectedAccount]);

  const connectWallet = async (walletName: string) => {
    setLoading(true);
    try {
      let walletProvider: any;
      if (walletName === 'Phantom') {
        walletProvider = window.solana;
        const response = await walletProvider.connect();
        const publicKey = new PublicKey(response.publicKey.toString());
        updateWallet(walletName, publicKey);
      } else if (walletName === 'Backpack') {
        walletProvider = window.backpack;
        const response = await walletProvider.connect();
        const publicKey = new PublicKey(response.publicKey.toString());
        updateWallet(walletName, publicKey);
      }
    } catch (error) {
      setError(`Failed to connect to ${walletName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = (walletName: string) => {
    const updatedWallets = wallets.map(wallet =>
      wallet.name === walletName
        ? { ...wallet, publicKey: null, isConnected: false, accounts: [] }
        : wallet
    );
    setWallets(updatedWallets);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    setSelectedWallet(null);
    setSelectedAccount(null);
  };

  const selectAccount = (walletName: string, account: PublicKey) => {
    const updatedWallets = wallets.map(wallet =>
      wallet.name === walletName ? { ...wallet, publicKey: account } : wallet
    );
    setWallets(updatedWallets);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    setSelectedAccount(account);
  };

  const updateWallet = (walletName: string, publicKey: PublicKey) => {
    const updatedWallet: Wallet = {
      name: walletName,
      publicKey,
      isConnected: true,
      accounts: [publicKey],
    };
    const updatedWallets = wallets.map(wallet =>
      wallet.name === walletName ? updatedWallet : wallet
    );
    setWallets(updatedWallets);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    setSelectedWallet(walletName);
    setSelectedAccount(publicKey);
  };

  const setManualWallet = (address: string) => {
    try {
      const publicKey = new PublicKey(address);
      updateWallet('ManualWallet', publicKey);
    } catch (error) {
      setError(`Invalid manual wallet address: ${address}`);
    }
  };

  return { wallets, connectWallet, disconnectWallet, selectAccount, setManualWallet };
};
