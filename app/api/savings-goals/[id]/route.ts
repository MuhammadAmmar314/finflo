import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, targetAmount, currentAmount, targetDate, category, color } = body;

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (targetAmount !== undefined) data.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) data.currentAmount = Number(currentAmount);
    if (targetDate !== undefined) data.targetDate = targetDate;
    if (category !== undefined) data.category = category;
    if (color !== undefined) data.color = color;

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui target tabungan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.savingsGoal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Target tabungan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus target tabungan' },
      { status: 500 }
    );
  }
}
