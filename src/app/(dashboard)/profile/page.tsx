"use client";
import React, { useEffect, useState } from 'react';
import { useWalletContext } from '@/context/WalletContext'; 
import Button from '@/components/Button';
import { PublicKey } from '@solana/web3.js';

const ProfilePage: React.FC = () => {
  const { wallets, connectWallet, disconnectWallet, selectAccount } = useWalletContext(); 
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const connectedWallet = wallets.find((wallet) => wallet.isConnected);

  useEffect(() => {
    if (connectedWallet) {
      setSelectedWallet(connectedWallet.name);
    }
  }, [connectedWallet]);

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
  };

  const handleSelectAccount = (walletName: string, account: string) => {
    try {
      const accountPublicKey = new PublicKey(account);
      selectAccount(walletName, accountPublicKey);
    } catch (err) {
      setError(`Failed to select account: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      {connectedWallet ? (
        <div className="wallet-info">
          <h2>Connected Wallet: {connectedWallet.name}</h2>
          <p>Public Key: {connectedWallet.publicKey?.toString()}</p>

          {connectedWallet.accounts.length > 1 && (
            <div className="account-selection">
              <label>Select Account:</label>
              <select
                onChange={(e) => handleSelectAccount(connectedWallet.name, e.target.value)}
                value={connectedWallet.publicKey?.toString()}
              >
                {connectedWallet.accounts.map((account) => (
                  <option key={account.toString()} value={account.toString()}>
                    {account.toString()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button variant="primary" onClick={() => handleDisconnect(connectedWallet.name)}>
            Disconnect {connectedWallet.name}
          </Button>
        </div>
      ) : (
        <div>
          <h2>No wallet connected</h2>
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="primary"
              onClick={() => handleConnect(wallet.name)}
              disabled={loading && selectedWallet === wallet.name}
            >
              {loading && selectedWallet === wallet.name ? 'Connecting...' : `Connect ${wallet.name}`}
            </Button>
          ))}
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ProfilePage;
