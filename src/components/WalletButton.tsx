"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWalletContext } from '@/context/WalletContext';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tooltip } from '@chakra-ui/react';

import phantomIcon from '../app/assets/logos/phantom-icon.png';
import backpackIcon from '../app/assets/logos/backpack-icon.png';
import manualWalletIcon from '../app/assets/logos/manualwallet-icon.svg';

const WalletButton: React.FC = () => {
  const { wallets, connectWallet, disconnectWallet, selectAccount, error, loading } = useWalletContext();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PublicKey | null>(null);
  const [manualAddress, setManualAddress] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [manualWalletError, setManualWalletError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Synchronize selected wallet and account from context
  useEffect(() => {
    const connectedWallet = wallets.find((wallet) => wallet.isConnected && wallet.name !== 'manual');
    if (connectedWallet && connectedWallet.publicKey) {
      setSelectedWallet(connectedWallet.name);
      setSelectedAccount(new PublicKey(connectedWallet.publicKey));
    } else {
      const storedManualAddress = localStorage.getItem('manualWalletAddress');
      if (storedManualAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(storedManualAddress)) {
        setManualAddress(storedManualAddress);
        setSelectedWallet('manual');
        setSelectedAccount(new PublicKey(storedManualAddress));
      } else {
        setManualAddress('');
        setSelectedWallet(null);
        setSelectedAccount(null);
      }
    }
  }, [wallets]);

  // Synchronize manual wallet address across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'manualWalletAddress') {
        const storedAddress = event.newValue;
        if (storedAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(storedAddress)) {
          setManualAddress(storedAddress);
          setSelectedWallet('manual');
          setSelectedAccount(new PublicKey(storedAddress));
        } else {
          setManualAddress('');
          setSelectedWallet(null);
          setSelectedAccount(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle wallet connection
  const handleConnect = useCallback(
    async (walletName: string) => {
      if (selectedWallet) {
        setConnectionError(`You can only connect one wallet at a time. Please disconnect your ${selectedWallet} wallet to connect ${walletName}.`);
        return;
      }

      try {
        await connectWallet(walletName);
        setSelectedWallet(walletName);
        setConnectionError(null);
      } catch (err) {
        console.error(`Failed to connect to ${walletName}:`, err);
      }
    },
    [selectedWallet, connectWallet]
  );

  // Handle wallet disconnection
  const handleDisconnect = useCallback(
    (walletName: string) => {
      disconnectWallet(walletName);
      setSelectedWallet(null);
      setSelectedAccount(null);
      if (walletName === 'manual') {
        setManualAddress('');
        setManualWalletError(null);
        localStorage.removeItem('manualWalletAddress'); // Remove the address from local storage
      }
    },
    [disconnectWallet]
  );

  // Handle account selection
  const handleSelectAccount = useCallback(
    (walletName: string, account: string) => {
      if (account && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(account)) {
        const accountPublicKey = new PublicKey(account);
        selectAccount(walletName, accountPublicKey);
        setSelectedAccount(accountPublicKey);
      } else {
        setManualWalletError('Invalid account address.');
      }
    },
    [selectAccount]
  );

  // Validate and handle manual wallet address input change
  const handleManualAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const address = e.target.value;
      setManualAddress(address);

      // Validate address length and character
      if (address && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        setManualWalletError('Invalid wallet address.');
      } else {
        setManualWalletError(null);
      }
    },
    []
  );

  // Add manual wallet
  const handleAddManualWallet = useCallback(() => {
    if (manualAddress.trim() && !manualWalletError) {
      localStorage.setItem('manualWalletAddress', manualAddress); // Store the address in local storage
      setSelectedWallet('manual');
      setManualWalletError(null); // Clear any error when a valid wallet is added
    } else {
      setManualWalletError('Please enter a valid wallet address.');
    }
  }, [manualAddress, manualWalletError]);

  // Copy address to clipboard
  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <motion.div
      className="wallet-container max-w-3xl mx-auto mt-8 p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-xl space-y-6 text-gray-100 border border-gray-600 animate-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Display connected wallets or prompt to connect/add wallet */}
      {selectedWallet ? (
        // Display connected wallet details
        <div className="connected-wallets space-y-4">
          {wallets.filter(wallet => wallet.isConnected && wallet.name !== 'manual').map((wallet) => (
            <motion.div
              key={wallet.name}
              className="wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 border border-gray-700 animate-border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.75 }}
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
              <div className="wallet-details flex-grow w-full sm:w-auto overflow-hidden">
                <h3 className="text-xl font-bold text-white">{wallet.name}</h3>
                {wallet.isConnected ? (
                  <div className="connected-wallet space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-300">Connected Address:</p>
                      <Tooltip label={copied ? "Copied!" : "Copy to clipboard"} aria-label="Copy tooltip">
                        <span
                          onClick={() => handleCopyToClipboard(wallet.publicKey?.toString() || '')}
                          className="text-sm text-green-400 cursor-pointer hover:text-green-300 transition-colors truncate max-w-xs"
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
                      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    className="connect-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-green-800 bg-[linear-gradient(110deg,#012700,45%,#065800,55%,#012700)] bg-[length:200%_100%] px-6 font-medium text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                    onClick={() => handleConnect(wallet.name)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                  >
                    Connect
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
          {selectedWallet === 'manual' && (
            <motion.div
              className="manual-wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col space-y-4 border border-gray-700 animate-border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.75 }}
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={manualWalletIcon}
                  alt="Manual wallet icon"
                  className="wallet-icon w-12 h-12"
                  width={48}
                  height={48}
                />
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white">Manual Wallet</h3>
                  {manualAddress ? (
                    <div className="connected-wallet space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300">Connected Address:</p>
                        <Tooltip label={copied ? "Copied!" : "Copy to clipboard"} aria-label="Copy tooltip">
                          <span
                            onClick={() => handleCopyToClipboard(manualAddress)}
                            className="text-sm text-green-400 cursor-pointer hover:text-green-300 transition-colors truncate max-w-xs"
                          >
                            {manualAddress}
                          </span>
                        </Tooltip>
                      </div>
                      <motion.button
                        className="disconnect-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-red-800 bg-[linear-gradient(110deg,#2a0302,45%,#540d0a,55%,#2a0302)] bg-[length:200%_100%] px-6 font-medium text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                        onClick={() => handleDisconnect('manual')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                      >
                        Remove
                      </motion.button>
                    </div>
                  ) : (
                    <div className="manual-wallet-form space-y-2">
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={handleManualAddressChange}
                        placeholder="Enter wallet address"
                        className="w-full bg-gray-700 text-white rounded-md p-2"
                      />
                      {manualWalletError && <p className="text-red-500 text-sm">{manualWalletError}</p>}
                      <motion.button
                        className="add-wallet-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-blue-800 bg-[linear-gradient(110deg,#00244b,45%,#00487d,55%,#00244b)] bg-[length:200%_100%] px-6 font-medium text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                        onClick={handleAddManualWallet}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                      >
                        Add Wallet
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        // Show connect buttons if no wallet is connected
        <div className="connect-wallets space-y-4">
          {wallets.filter(wallet => wallet.name !== 'manual').map((wallet) => (
            <motion.div
              key={wallet.name}
              className="wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0 border border-gray-700 animate-border"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.75 }}
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
              <div className="wallet-details flex-grow w-full sm:w-auto overflow-hidden">
                <h3 className="text-xl font-bold text-white">{wallet.name}</h3>
                <motion.button
                  className="connect-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-green-800 bg-[linear-gradient(110deg,#012700,45%,#065800,55%,#012700)] bg-[length:200%_100%] px-6 font-medium text-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                  onClick={() => handleConnect(wallet.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                >
                  Connect
                </motion.button>
              </div>
            </motion.div>
          ))}

          {/* Manual Wallet */}
          <motion.div
            className="manual-wallet-section bg-gray-800 p-4 rounded-lg shadow-md flex flex-col space-y-4 border border-gray-700 animate-border"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, mass: 0.75 }}
          >
            <div className="flex items-center space-x-4">
              <Image
                src={manualWalletIcon}
                alt="Manual wallet icon"
                className="wallet-icon w-12 h-12"
                width={48}
                height={48}
              />
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-white">Manual Wallet</h3>
                <div className="manual-wallet-form space-y-2">
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={handleManualAddressChange}
                    placeholder="Enter wallet address"
                    className="w-full bg-gray-700 text-white rounded-md p-2"
                  />
                  {manualWalletError && <p className="text-red-500 text-sm">{manualWalletError}</p>}
                  <motion.button
                    className="add-wallet-btn inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-blue-800 bg-[linear-gradient(110deg,#00244b,45%,#00487d,55%,#00244b)] bg-[length:200%_100%] px-6 font-medium text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                    onClick={handleAddManualWallet}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                  >
                    Add Wallet
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default WalletButton;
