import { NextRequest, NextResponse } from 'next/server';

// Define interfaces for the NFT structure
interface NFT {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface HeliusNFTResponse {
  result: {
    item: {
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
    };
  };
}

type Data = {
  success: boolean;
  message: string;
  nft?: NFT;
  error?: string;
};

// Helper function to call the Helius API to get asset details by ID
async function fetchNFTById(id: string) {
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
      method: 'getAsset',
      params: {
        assetId: id
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text(); // Get the response text for debugging
    throw new Error(`Error fetching NFT from Helius: ${errorText}`);
  }

  return await response.json() as HeliusNFTResponse;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from the URL path

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ success: false, message: 'NFT ID is required and must be a string' }, { status: 400 });
  }

  try {
    const data = await fetchNFTById(id);

    const nft: NFT = {
      id: data.result.item.id,
      title: data.result.item.content.metadata.name || 'Untitled',
      description: data.result.item.content.metadata.description || 'No description available.',
      imageUrl: data.result.item.content.links.image || '',
      attributes: data.result.item.content.metadata.attributes || [],
    };

    return NextResponse.json({
      success: true,
      message: 'NFT fetched successfully',
      nft,
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching NFT:', error.message);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
