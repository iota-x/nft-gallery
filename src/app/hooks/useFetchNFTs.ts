import { useEffect, useState } from 'react';

interface NFT {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

const useFetchNFTs = (address: string) => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addressRef = useState<string | null>(address)[0];

  const fetchNFTs = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nfts?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }

      const data = await response.json();
      setNFTs(data.nfts || []);

      localStorage.setItem(`nfts_${address}`, JSON.stringify(data.nfts || []));
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedNFTs = localStorage.getItem(`nfts_${address}`);
    if (cachedNFTs) {
      setNFTs(JSON.parse(cachedNFTs));
    } else {
      fetchNFTs();
    }
  }, [address]);

  return { nfts, loading, error, refetch: fetchNFTs };
};

export default useFetchNFTs;
