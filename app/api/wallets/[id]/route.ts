import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, type, balance, color, icon } = body;

    const wallet = await prisma.wallet.update({
      where: { id },
      data: {
        name: name || undefined,
        type: type || undefined,
        balance: typeof balance === 'number' ? balance : undefined,
        color: color || undefined,
        icon: icon !== undefined ? icon : undefined,
      },
    });

    return NextResponse.json({ success: true, data: wallet });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.wallet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Wallet deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete wallet' },
      { status: 500 }
    );
  }
}
