"use client";
import React, { useState } from 'react';
import { useWallet } from '../app/hooks/useWallet';
import { PublicKey } from '@solana/web3.js';

const WalletButton: React.FC = () => {
  const { wallets, connectWallet, disconnectWallet, selectAccount } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (walletName: string) => {
    setLoading(true);
    setError(null);
    try {
      await connectWallet(walletName);
      setSelectedWallet(walletName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to connect to ${walletName}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = (walletName: string) => {
    disconnectWallet(walletName);
    setSelectedWallet(null);
    setSelectedAccount(null);
  };

  const handleSelectAccount = (walletName: string, account: string) => {
    const accountPublicKey = new PublicKey(account);
    selectAccount(walletName, accountPublicKey);
    setSelectedAccount(accountPublicKey);
  };

  return (
    <div className="wallet-buttons">
      {wallets.length === 0 ? (
        <p>No wallets detected. Please install a wallet extension.</p>
      ) : (
        wallets.map((wallet) => (
          <div key={wallet.name} className="wallet-section">
            <h3>{wallet.name}</h3>
            {wallet.isConnected ? (
              <div>
                <p>Connected Account: {wallet.publicKey?.toString()}</p>
                {wallet.accounts.length > 1 && (
                  <div>
                    <label>Select Account:</label>
                    <select
                      onChange={(e) => handleSelectAccount(wallet.name, e.target.value)}
                      value={selectedAccount ? selectedAccount.toString() : wallet.publicKey?.toString() || ''}
                    >
                      {wallet.accounts.map((acc) => (
                        <option key={acc.toString()} value={acc.toString()}>
                          {acc.toString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                  onClick={() => handleDisconnect(wallet.name)}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span>Disconnect {wallet.name}</span>
                    <svg
                      fill="none"
                      height="16"
                      viewBox="0 0 24 24"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.75 8.75L14.25 12L10.75 15.25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
              </div>
            ) : (
              <button
                className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                onClick={() => handleConnect(wallet.name)}
                disabled={loading}
              >
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </span>
                <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                  <span>
                    {loading && selectedWallet === wallet.name ? 'Connecting...' : `Connect ${wallet.name}`}
                  </span>
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.75 8.75L14.25 12L10.75 15.25"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
              </button>
            )}
          </div>
        ))
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WalletButton;
