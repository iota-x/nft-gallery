import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

export interface Wallet {
  name: string;
  publicKey: PublicKey | null;
  isConnected: boolean;
  accounts: PublicKey[];
}

export interface UseWalletResult {
  wallets: Wallet[];
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: (walletName: string) => void;
  selectAccount: (walletName: string, account: PublicKey) => void;
}

const LOCAL_STORAGE_KEY = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || 'wallet_connection';

export const useWallet = (): UseWalletResult => {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const detectWallets = () => {
      const walletsDetected: Wallet[] = [];

      if ('solana' in window && window.solana.isPhantom) {
        walletsDetected.push({
          name: 'Phantom',
          publicKey: null,
          isConnected: false,
          accounts: [],
        });
      }

      if ('backpack' in window && window.backpack.isBackpack) {
        walletsDetected.push({
          name: 'Backpack',
          publicKey: null,
          isConnected: false,
          accounts: [],
        });
      }

      setWallets(walletsDetected);

      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const { name, publicKey, isConnected, accounts } = JSON.parse(savedState);
        setWallets(prev =>
          prev.map(wallet =>
            wallet.name === name
              ? { ...wallet, publicKey: new PublicKey(publicKey), isConnected, accounts: accounts.map((acc: string) => new PublicKey(acc)) }
              : wallet
          )
        );
      }
    };

    detectWallets();
  }, []);

  const connectWallet = async (walletName: string) => {
    try {
      let walletProvider;
      if (walletName === 'Phantom') {
        walletProvider = window.solana;
        const response = await walletProvider.connect();
        const publicKey = response.publicKey.toString();
        const updatedWallet = { name: 'Phantom', publicKey: new PublicKey(publicKey), isConnected: true, accounts: [new PublicKey(publicKey)] };
        setWallets(prev =>
          prev.map(wallet =>
            wallet.name === 'Phantom'
              ? updatedWallet
              : wallet
          )
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallet));
      } else if (walletName === 'Backpack') {
        walletProvider = window.backpack;
        const response = await walletProvider.connect();
        const publicKey = response.publicKey.toString();
        const updatedWallet = { name: 'Backpack', publicKey: new PublicKey(publicKey), isConnected: true, accounts: [new PublicKey(publicKey)] };
        setWallets(prev =>
          prev.map(wallet =>
            wallet.name === 'Backpack'
              ? updatedWallet
              : wallet
          )
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallet));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = (walletName: string) => {
    setWallets(prev =>
      prev.map(wallet =>
        wallet.name === walletName
          ? { ...wallet, publicKey: null, isConnected: false, accounts: [] }
          : wallet
      )
    );
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const selectAccount = (walletName: string, account: PublicKey) => {
    setWallets(prev =>
      prev.map(wallet =>
        wallet.name === walletName ? { ...wallet, publicKey: account } : wallet
      )
    );
    const updatedWallet = wallets.find(wallet => wallet.name === walletName);
    if (updatedWallet) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedWallet));
    }
  };

  return { wallets, connectWallet, disconnectWallet, selectAccount };
};
