import React from 'react';
import Link from 'next/link';
import WalletButton from '@/components/WalletButton';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white pt-20 p-8">
      {/* Added pt-24 to push content below the navbar */}
      <div className="w-full max-w-7xl bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center md:text-left mb-6 md:mb-0 p-4 md:p-8">
            Welcome to Your NFT Dashboard
          </h1>
          <WalletButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <Link href="/nfts" passHref>
            <div className="flex flex-col items-center justify-center p-6 border border-transparent rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition duration-300">
              <h2 className="text-2xl font-bold mb-4 text-center">View owned NFTs</h2>
              <p className="text-lg text-center">Browse all your NFTs in one place.</p>
            </div>
          </Link>
          <Link href="/viewNFT" passHref>
            <div className="flex flex-col items-center justify-center p-6 border border-transparent rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition duration-300">
              <h2 className="text-2xl font-bold mb-4 text-center">Browse all NFTs</h2>
              <p className="text-lg text-center">View details of other NFTs by a simple quick search.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
