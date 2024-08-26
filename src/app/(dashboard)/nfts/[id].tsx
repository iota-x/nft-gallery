import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export interface NFT {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }

const NFTDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get ID from query parameter

  const [nft, setNFT] = useState<NFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchNFT = async () => {
        try {
          const response = await fetch(`/api/nfts/${id}`);
          const data = await response.json();
          
          if (data.success) {
            setNFT(data.nft);
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError('An error occurred while fetching the NFT.');
        } finally {
          setLoading(false);
        }
      };

      fetchNFT();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!nft) return <p>No NFT found</p>;

  return (
    <div>
      <h1>{nft.title}</h1>
      <img src={nft.imageUrl} alt={nft.title} />
      <p>{nft.description}</p>
      {nft.attributes && (
        <ul>
          {nft.attributes.map((attr, index) => (
            <li key={index}>{attr.trait_type}: {attr.value}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NFTDetailPage;
