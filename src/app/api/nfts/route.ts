import { NextRequest, NextResponse } from 'next/server';

interface NFT {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface HeliusNFTResponse {
  result: {
    items: Array<{
      id: string;
      content: {
        metadata: {
          name: string;
          description: string;
          attributes?: Array<{ trait_type: string; value: string }>;
        };
        links: {
          image: string;
        };
      };
    }>;
  };
}

type Data = {
  success: boolean;
  message: string;
  nfts?: NFT[];
  error?: string;
};

async function fetchNonFungibleAssetsByOwner(address: string, page: number = 1, limit: number = 1000) {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: address,
        page: page,
        limit: limit,
        displayOptions: {
          showFungible: false
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text(); 
    throw new Error(`Error fetching NFTs from Helius: ${errorText}`);
  }

  return await response.json() as HeliusNFTResponse;
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ success: false, message: 'Wallet address is required and must be a string' }, { status: 400 });
  }

  try {
    const data = await fetchNonFungibleAssetsByOwner(address);

    const nfts: NFT[] = data.result.items.map((item) => ({
      id: item.id,
      title: item.content.metadata.name || 'Untitled',
      description: item.content.metadata.description || 'No description available.',
      imageUrl: item.content.links.image || '',
      attributes: item.content.metadata.attributes || [],
    }));

    return NextResponse.json({
      success: true,
      message: 'NFTs fetched successfully',
      nfts,
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching NFTs:', error.message);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
