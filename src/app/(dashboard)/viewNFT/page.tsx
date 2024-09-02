"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardTitle, CardDescription } from '@/components/ui/card-hover-effect';
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button, Input, Box, Text, VStack } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";

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

const SearchNFTPage = () => {
  const [nftId, setNftId] = useState<string>('');
  const [nft, setNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSearch = useCallback(async () => {
    if (!nftId) {
      setError("Please enter a valid NFT ID.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`/api/nfts/${nftId}`);
      const data = await response.json();
  
      if (data.success) {
        setNFT(data.nft);
        setNftId(''); // Clear the placeholder after a successful search
      } else {
        setError(data.message || "Failed to fetch NFT data.");
      }
    } catch (err) {
      console.error("Error fetching NFT:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching the NFT.");
      }
    } finally {
      setLoading(false);
    }
  }, [nftId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-32 p-8">
      {/* Search Box */}
      <VStack spacing={6} align="center">
        <Box w="full" maxW="md">
          <Input
            placeholder="Enter NFT ID"
            value={nftId}
            onChange={(e) => setNftId(e.target.value)}
            bg="gray.800"
            borderColor="gray.700"
            _placeholder={{ color: "gray.400" }}
            p={4}
          />
        </Box>
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          size="md"
          variant="solid"
          _hover={{ bg: "blue.600" }}
          w="auto"
          mt={4} // Margin top to create space between the button and search box
        >
          View NFT
        </Button>
      </VStack>

      {/* Display NFT or Error */}
      {loading && <LoadingSpinner />}
      {error && (
        <motion.div
          className="flex items-center justify-center h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Text fontSize="xl" color="red.500">{error}</Text>
        </motion.div>
      )}
      {nft && !loading && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Section */}
          <div className="flex justify-center md:justify-start">
            {nft.imageUrl && (
              <img
                src={nft.imageUrl}
                alt={nft.title}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
            )}
          </div>

          {/* Details Section */}
          <div>
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
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchNFTPage;
