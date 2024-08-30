import { atom, selector } from 'recoil';
import { PublicKey } from '@solana/web3.js';

export interface Wallet {
  name: string;
  publicKey: PublicKey | null;
  isConnected: boolean;
  accounts: PublicKey[];
}

export const walletsState = atom<Wallet[]>({
  key: 'walletsState',
  default: [],
});

export const selectedWalletState = atom<string | null>({
  key: 'selectedWalletState',
  default: null,
});

export const selectedAccountState = atom<PublicKey | null>({
  key: 'selectedAccountState',
  default: null,
});

export const walletErrorState = atom<string | null>({
  key: 'walletErrorState',
  default: null,
});

export const isLoadingState = atom<boolean>({
  key: 'isLoadingState',
  default: false,
});

export const currentWalletState = selector<Wallet | null>({
  key: 'currentWalletState',
  get: ({ get }) => {
    const wallets = get(walletsState);
    const selectedWallet = get(selectedWalletState);
    return wallets.find(wallet => wallet.name === selectedWallet) || null;
  },
});

export const isWalletConnectedState = selector<boolean>({
  key: 'isWalletConnectedState',
  get: ({ get }) => {
    const wallets = get(walletsState);
    return wallets.some(wallet => wallet.isConnected);
  },
});
