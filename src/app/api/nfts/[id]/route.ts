import { NextRequest, NextResponse } from 'next/server';

interface HeliusNFTResponse {
  jsonrpc: string;
  result: HeliusNFTResult;
  id: number | string;
  error: any;
}

export interface HeliusNFTResult {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: Array<{
      uri: string;
      cdn_uri?: string;
      mime?: string;
    }>;
    metadata: {
      description: string;
      name: string;
      symbol: string;
      token_standard: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    };
    links: {
      image: string;
      external_url?: string;
    };
  };
  authorities: Array<{
    address: string;
    scopes: string[];
  }>;
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  royalty: {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  supply: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number;
  };
  mutable: boolean;
  burnt: boolean;
}

interface NFT {
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

type Data = {
  success: boolean;
  message: string;
  nft?: NFT;
  error?: string;
};

async function fetchNFTById(id: string): Promise<HeliusNFTResponse> {
  const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error('Helius API key is not set in environment variables.');
  }

  const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: {
        id: id,
        options: {
          // showFungible: false,
          // showInscription: false,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error fetching NFT from Helius: ${errorText}`);
  }

  const data = (await response.json()) as HeliusNFTResponse;

  if (data.error) {
    throw new Error(`Helius API Error: ${data.error.message}`);
  }

  return data;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // id from url

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, message: 'NFT ID is required and must be a string' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchNFTById(id);

    if (data.result) {
      const result = data.result;

      const collectionGrouping = result.grouping?.find(
        (group) => group.group_key === 'collection'
      );

      const nft: NFT = {
        id: result.id,
        title: result.content.metadata.name || 'Untitled',
        description: result.content.metadata.description || 'No description available.',
        imageUrl: result.content.links.image || '',
        attributes: result.content.metadata.attributes || [],
        collection: {
          name: result.content.metadata.symbol || 'Unknown Collection',
          address: collectionGrouping?.group_value || 'Unknown Address',
        },
        royalty: {
          model: result.royalty.royalty_model || 'Unknown',
          percent: result.royalty.percent || 0,
          primarySaleHappened: result.royalty.primary_sale_happened || false,
          locked: result.royalty.locked || false,
        },
        owner: result.ownership.owner || 'Unknown Owner',
        mutable: result.mutable,
        burnt: result.burnt,
        externalUrl: result.content.links.external_url || '',
        symbol: result.content.metadata.symbol || '',
        tokenStandard: result.content.metadata.token_standard || '',
        compression: {
          eligible: result.compression.eligible,
          compressed: result.compression.compressed,
        },
      };

      return NextResponse.json({
        success: true,
        message: 'NFT fetched successfully',
        nft,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response structure from Helius',
          error: 'No NFT data found',
        },
        { status: 500 }
      );
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error fetching NFT:', error.message);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
