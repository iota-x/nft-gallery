import { useState } from 'react';

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  [key: string]: any;
}

interface UseFavNFTResult {
  favoriteNFTs: NFT[];
  addFavorite: (nft: NFT) => void;
  removeFavorite: (nftId: string) => void;
  isFavorite: (nftId: string) => boolean;
}

const useFavNFT = (): UseFavNFTResult => {
  const [favoriteNFTs, setFavoriteNFTs] = useState<NFT[]>([]);

  const addFavorite = (nft: NFT) => {
    setFavoriteNFTs((prevFavs) => [...prevFavs, nft]);
  };

  const removeFavorite = (nftId: string) => {
    setFavoriteNFTs((prevFavs) => prevFavs.filter((nft) => nft.id !== nftId));
  };

  const isFavorite = (nftId: string) => {
    return favoriteNFTs.some((nft) => nft.id === nftId);
  };

  return { favoriteNFTs, addFavorite, removeFavorite, isFavorite };
};

export default useFavNFT;
