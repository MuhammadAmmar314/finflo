import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        savingsGoals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: user.savingsGoals });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data target tabungan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      targetAmount,
      currentAmount = 0,
      targetDate,
      category,
      color = '#10b981',
      email = defaultUser.email,
    } = body;

    const targetNum = Number(targetAmount);
    if (!title || !targetNum || targetNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Judul dan nominal target tabungan wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const newGoal = await prisma.savingsGoal.create({
      data: {
        title: title.trim(),
        targetAmount: targetNum,
        currentAmount: Number(currentAmount) || 0,
        targetDate: targetDate || null,
        category: category || 'Target Tabungan',
        color: color || '#10b981',
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: newGoal });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal membuat target tabungan' },
      { status: 500 }
    );
  }
}
