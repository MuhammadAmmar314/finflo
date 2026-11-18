import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.debt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Debt deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete debt' },
      { status: 500 }
    );
  }
}
