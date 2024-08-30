"use client";
import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWalletContext } from '@/context/WalletContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tooltip } from '@chakra-ui/react';

import phantomIcon from '../app/assets/logos/phantom-icon.png';
import backpackIcon from '../app/assets/logos/backpack-icon.png';
import manualWalletIcon from '../app/assets/logos/manualwallet-icon.svg';

const WalletButton: React.FC = () => {
  const { wallets, connectWallet, disconnectWallet, selectAccount, setManualWallet } = useWalletContext();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PublicKey | null>(null);
  const [manualAddress, setManualAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleConnect = async (walletName: string) => {
    if (selectedWallet) {
      setError(`You can only connect one wallet at a time. Please disconnect your ${selectedWallet} wallet to connect ${walletName}.`);
      return;
    }

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

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualAddress(e.target.value);
  };

  const handleAddManualWallet = () => {
    if (manualAddress) {
      setManualWallet(manualAddress);
      setSelectedWallet('manual');
      setManualAddress(''); // Placeholder is removed after adding a wallet
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="wallet-container max-w-3xl mx-auto mt-8 p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-xl space-y-6 text-gray-100 border border-gray-600 animate-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {wallets.length === 0 ? (
        <p className="text-center text-gray-400">No wallets detected. Please install a wallet extension.</p>
      ) : (
        wallets.map((wallet) => (
          <motion.div
            key={wallet.name}
            className="wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 border border-gray-700 animate-border"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Image
              src={
                wallet.name === 'Phantom' ? phantomIcon :
                wallet.name === 'Backpack' ? backpackIcon :
                manualWalletIcon
              }
              alt={`${wallet.name} icon`}
              className="wallet-icon w-12 h-12"
              width={48}
              height={48}
            />
            <div className="wallet-details flex-grow w-full sm:w-auto">
              <h3 className="text-xl font-bold text-white">{wallet.name}</h3>
              {wallet.isConnected ? (
                <div className="connected-wallet space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Connected Address:</p>
                    <Tooltip label={copied ? "Copied!" : "Copy to clipboard"} aria-label="Copy tooltip">
                      <span
                        onClick={() => handleCopyToClipboard(wallet.publicKey?.toString() || '')}
                        className="text-sm text-green-400 cursor-pointer hover:text-green-300 transition-colors truncate"
                      >
                        {wallet.publicKey?.toString()}
                      </span>
                    </Tooltip>
                  </div>
                  {wallet.accounts.length > 1 && (
                    <div className="account-select mt-2">
                      <label className="block text-sm text-gray-300 mb-1">Select Account:</label>
                      <select
                        onChange={(e) => handleSelectAccount(wallet.name, e.target.value)}
                        value={selectedAccount ? selectedAccount.toString() : wallet.publicKey?.toString() || ''}
                        className="w-full bg-gray-700 text-white rounded-md p-2"
                      >
                        {wallet.accounts.map((acc) => (
                          <option key={acc.toString()} value={acc.toString()}>
                            {acc.toString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <motion.button
                    className="disconnect-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-red-800 bg-[linear-gradient(110deg,#2a0302,45%,#540d0a,55%,#2a0302)] bg-[length:200%_100%] px-6 font-medium text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                    onClick={() => handleDisconnect(wallet.name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Disconnect {wallet.name}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  className="connect-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                  onClick={() => handleConnect(wallet.name)}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading && selectedWallet === wallet.name ? 'Connecting...' : `Connect ${wallet.name}`}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))
      )}
      <motion.div
        className="manual-wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 border border-gray-700 animate-border"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Image
          src={manualWalletIcon}
          alt="Manual wallet icon"
          className="wallet-icon w-12 h-12"
          width={48}
          height={48}
        />
        <div className="manual-wallet-details flex-grow w-full sm:w-auto">
          <input
            type="text"
            value={manualAddress}
            onChange={handleManualAddressChange}
            placeholder="Enter your wallet address here"
            className="manual-address-input w-full bg-gray-700 text-white rounded-md p-2 mb-2"
          />
          {manualAddress && (
            <motion.button
              onClick={handleAddManualWallet}
              className="add-wallet-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Wallet
            </motion.button>
          )}
        </div>
      </motion.div>
      {error && <p className="error-message text-center text-red-500 text-sm mt-4">{error}</p>}
    </motion.div>
  );
};

export default WalletButton;
