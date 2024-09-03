"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardTitle, CardDescription } from '@/components/ui/card-hover-effect';
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

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
          setError(data.message || "Failed to fetch NFT data.");
        }
      } catch (err) {
        console.error("Error fetching NFT:", err);
        setError("An error occurred while fetching the NFT.");
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
      setError("No NFT ID provided.");
      setLoading(false);
    }
  }, [id, debouncedFetchNFT, throttledFetchNFT]);

  if (loading) {
    return <LoadingSpinner />;
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
        <p className="text-xl text-white">No NFT found.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-black via-gray-900 to-black text-white"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* This div pushes content down to avoid being hidden behind the navbar */}
      <div className="pt-32">
        {/* Responsive Layout Container */}
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Image Section */}
            <motion.div
              className="flex justify-center md:justify-start"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {nft.imageUrl && (
                <img
                  src={nft.imageUrl}
                  alt={nft.title}
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              )}
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Card className="mb-4">
                <CardTitle>{nft.title}</CardTitle>
                <CardDescription>{nft.description}</CardDescription>

                {/* Attributes Section */}
                <CardTitle className="mt-6">Attributes</CardTitle>
                {nft.attributes.length > 0 ? (
                  <ul className="list-disc list-inside pl-5">
                    {nft.attributes.map((attr, index) => (
                      <li key={index} className="text-zinc-100">
                        <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <CardDescription>No attributes available.</CardDescription>
                )}

                {/* Collection Information */}
                <CardTitle className="mt-6">Collection</CardTitle>
                <CardDescription>
                  <span className="font-medium text-zinc-100">Name:</span> {nft.collection.name}
                  <br />
                  <span className="font-medium text-zinc-100">Address:</span> {nft.collection.address}
                </CardDescription>

                {/* Royalty Information */}
                <CardTitle className="mt-6">Royalty Information</CardTitle>
                <CardDescription>
                  <span className="font-medium text-zinc-100">Model:</span> {nft.royalty.model}
                  <br />
                  <span className="font-medium text-zinc-100">Percent:</span> {nft.royalty.percent}%
                  <br />
                  <span className="font-medium text-zinc-100">Primary Sale Happened:</span> {nft.royalty.primarySaleHappened ? "Yes" : "No"}
                  <br />
                  <span className="font-medium text-zinc-100">Locked:</span> {nft.royalty.locked ? "Yes" : "No"}
                </CardDescription>

                {/* Ownership Information */}
                <CardTitle className="mt-6">Ownership</CardTitle>
                <CardDescription>
                  <span className="font-medium text-zinc-100">Owner Address:</span> {nft.owner}
                  <br />
                  <span className="font-medium text-zinc-100">Mutable:</span> {nft.mutable ? "Yes" : "No"}
                  <br />
                  <span className="font-medium text-zinc-100">Burnt:</span> {nft.burnt ? "Yes" : "No"}
                </CardDescription>

                {/* Additional Information */}
                <CardTitle className="mt-6">Additional Information</CardTitle>
                <CardDescription>
                  <span className="font-medium text-zinc-100">Symbol:</span> {nft.symbol}
                  <br />
                  <span className="font-medium text-zinc-100">Token Standard:</span> {nft.tokenStandard}
                  <br />
                  <span className="font-medium text-zinc-100">Compression Eligible:</span> {nft.compression.eligible ? "Yes" : "No"}
                  <br />
                  <span className="font-medium text-zinc-100">Compressed:</span> {nft.compression.compressed ? "Yes" : "No"}
                  {nft.externalUrl && (
                    <>
                      <br />
                      <span className="font-medium text-zinc-100">External URL:</span>{" "}
                      <a href={nft.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {nft.externalUrl}
                      </a>
                    </>
                  )}
                </CardDescription>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTDetailPage;
