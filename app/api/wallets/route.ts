import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallets: true },
    });

    return NextResponse.json({ success: true, data: user?.wallets ?? [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, balance, color, icon, email = defaultUser.email } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallets: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.plan !== 'pro' && user.wallets.length >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Batas kuota Free Tier tercapai (maksimal 3 dompet).',
          code: 'FREE_TIER_LIMIT',
        },
        { status: 403 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        name,
        type,
        balance: Number(balance) || 0,
        color: color || 'sky',
        icon: icon || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: wallet }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}
