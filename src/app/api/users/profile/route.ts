import { NextResponse } from 'next/server';
import prisma from '@/app/prisma/client';

export async function GET(request: Request) {
  const walletAddress = request.headers.get('wallet-address');

  if (!walletAddress) {
    return NextResponse.json({ message: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: walletAddress },
    });

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { username, bio } = await request.json();
  const walletAddress = request.headers.get('wallet-address');

  if (!walletAddress || !username) {
    return NextResponse.json({ message: 'Wallet address and username are required' }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        userId: walletAddress,
        username,
        bio,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// For PUT requests
export async function PUT(request: Request) {
  const { username, bio } = await request.json();
  const walletAddress = request.headers.get('wallet-address');

  if (!walletAddress || !username) {
    return NextResponse.json({ message: 'Wallet address and username are required' }, { status: 400 });
  }

  try {
    const profile = await prisma.profile.update({
      where: { userId: walletAddress },
      data: {
        username,
        bio,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// For DELETE requests
export async function DELETE(request: Request) {
  const walletAddress = request.headers.get('wallet-address');

  if (!walletAddress) {
    return NextResponse.json({ message: 'Wallet address is required' }, { status: 400 });
  }

  try {
    await prisma.profile.delete({
      where: { userId: walletAddress },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
