import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid license vouchers for instant offline/store activation
const VALID_VOUCHERS = ['FINFLOPRO', 'FINFLOVIP', 'PROLIFETIME', 'VIP2026', 'FINFLO-PRO'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, licenseCode, paymentMethod } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email pengguna harus disertakan.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan dalam sistem.' },
        { status: 404 }
      );
    }

    // If using license code, validate voucher
    if (paymentMethod === 'voucher') {
      const normalizedCode = (licenseCode || '').trim().toUpperCase();
      const isValid = VALID_VOUCHERS.includes(normalizedCode) || normalizedCode.startsWith('PRO-');

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Kode lisensi / voucher tidak valid atau sudah kadaluarsa.' },
          { status: 400 }
        );
      }
    }

    // Upgrade user to pro
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        plan: 'pro',
      },
      include: {
        wallets: true,
        expenseCategories: true,
        incomeCategories: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        debts: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({
      success: true,
      message: '🎉 Akun berhasil di-upgrade ke FinFlo Pro Lifetime!',
      data: safeUser,
    });
  } catch (error) {
    console.error('Upgrade Pro Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses upgrade Pro pada database.' },
      { status: 500 }
    );
  }
}
