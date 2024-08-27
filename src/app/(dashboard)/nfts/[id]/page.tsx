"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';

export interface NFT {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  attributes: Array<{ trait_type: string; value: string }>;
  collection: {
    name: string;
    address: string;
  };
  royalty: {
    model: string;
    percent: number;
    primarySaleHappened: boolean;
    locked: boolean;
  };
  owner: string;
  mutable: boolean;
  burnt: boolean;
  externalUrl?: string;
  symbol: string;
  tokenStandard: string;
  compression: {
    eligible: boolean;
    compressed: boolean;
  };
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return (...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const NFTDetailPage = () => {
  const { id } = useParams();

  const [nft, setNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFT = useCallback(
    async (nftId: string) => {
      try {
        const response = await fetch(`/api/nfts/${nftId}`);
        const data = await response.json();

        if (data.success) {
          setNFT(data.nft);
        } else {
          setError(data.message || 'Failed to fetch NFT data.');
        }
      } catch (err) {
        console.error('Error fetching NFT:', err);
        setError('An error occurred while fetching the NFT.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetchNFT = useMemo(() => debounce(fetchNFT, 300), [fetchNFT]);

  const throttledFetchNFT = useMemo(() => throttle(fetchNFT, 1000), [fetchNFT]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      throttledFetchNFT(id);
    } else {
      setError('No NFT ID provided.');
      setLoading(false);
    }
  }, [id, debouncedFetchNFT, throttledFetchNFT]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">No NFT found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{nft.title}</h1>
      <div className="flex flex-col md:flex-row">
        <img
          src={nft.imageUrl}
          alt={nft.title}
          className="w-full md:w-1/2 rounded-lg shadow-lg mb-4 md:mb-0 md:mr-4"
        />
        <div className="md:w-1/2">
          <p className="text-gray-700 mb-4">{nft.description}</p>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Attributes</h2>
            {nft.attributes.length > 0 ? (
              <ul className="list-disc list-inside">
                {nft.attributes.map((attr, index) => (
                  <li key={index}>
                    <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No attributes available.</p>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Collection</h2>
            <p>
              <span className="font-medium">Name:</span> {nft.collection.name}
            </p>
            <p>
              <span className="font-medium">Address:</span> {nft.collection.address}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Royalty Information</h2>
            <p>
              <span className="font-medium">Model:</span> {nft.royalty.model}
            </p>
            <p>
              <span className="font-medium">Percent:</span> {nft.royalty.percent}%
            </p>
            <p>
              <span className="font-medium">Primary Sale Happened:</span> {nft.royalty.primarySaleHappened ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-medium">Locked:</span> {nft.royalty.locked ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Ownership</h2>
            <p>
              <span className="font-medium">Owner Address:</span> {nft.owner}
            </p>
            <p>
              <span className="font-medium">Mutable:</span> {nft.mutable ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-medium">Burnt:</span> {nft.burnt ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
            <p>
              <span className="font-medium">Symbol:</span> {nft.symbol}
            </p>
            <p>
              <span className="font-medium">Token Standard:</span> {nft.tokenStandard}
            </p>
            <p>
              <span className="font-medium">Compression Eligible:</span> {nft.compression.eligible ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-medium">Compressed:</span> {nft.compression.compressed ? 'Yes' : 'No'}
            </p>
            {nft.externalUrl && (
              <p>
                <span className="font-medium">External URL:</span> 
                <a
                  href={nft.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {nft.externalUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailPage;
