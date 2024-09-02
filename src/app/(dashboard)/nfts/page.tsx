"use client";
import React, { useEffect, useState } from 'react';
import { useWalletContext } from '@/context/WalletContext';
import useFetchNFTs from '@/app/hooks/useFetchNFTs';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  attributes?: Attribute[];
  isFavorited?: boolean;
}

const NftsPage: React.FC = () => {
  const { wallets } = useWalletContext();
  const [manualAddress, setManualAddress] = useState<string | null>(null);

  // Fetch manual wallet address from local storage
  useEffect(() => {
    const storedAddress = localStorage.getItem('manualWalletAddress');
    if (storedAddress) {
      setManualAddress(storedAddress);
    }
  }, []);

  // Find the connected wallet or use manual address if available
  const connectedWallet = wallets.find(wallet => wallet.isConnected);
  const address = connectedWallet?.publicKey?.toString() || manualAddress || '';

  // Add a check here to prevent API call if the address is invalid
  const shouldFetchNFTs = address && address !== 'null';

  const { nfts, loading, error, refetch } = useFetchNFTs(shouldFetchNFTs ? address : '');

  // Display message if address is invalid
  if (!shouldFetchNFTs) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please connect your wallet or enter a manual wallet address to see your NFTs.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-black pt-[140px]">
      <h1 className="text-5xl font-bold mb-7 text-white">NFTs owned by the connected address</h1>
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}
      {nfts.length > 0 ? (
        <HoverEffect
          items={nfts.map((nft: NFT) => ({
            title: nft.title,
            description: nft.description || 'No description available',
            imageUrl: nft.imageUrl,
            link: `/nfts/${nft.id}`,
          }))}
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        />
      ) : (
        !loading && <p className="text-white">No NFTs found.</p>
      )}
      <button
        onClick={refetch}
        className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block mt-6"
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
          <span>Refetch NFTs</span>
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
  );
};

export default NftsPage;
