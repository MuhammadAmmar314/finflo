import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email dan kode verifikasi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Find valid, non-expired verification code
    const validRecord = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.',
        },
        { status: 400 }
      );
    }

    // Mark user email as verified
    const user = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        emailVerified: new Date(),
      },
      include: {
        wallets: true,
        expenseCategories: true,
        incomeCategories: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        debts: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    // Delete all verification codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    });

    // Safely load savings goals
    let userSavingsGoals: any[] = [];
    try {
      if ((prisma as any).savingsGoal) {
        userSavingsGoals = await (prisma as any).savingsGoal.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      userSavingsGoals = [];
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      data: {
        ...safeUser,
        savingsGoals: userSavingsGoals,
      },
      message: 'Email berhasil diverifikasi.',
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memverifikasi kode.' },
      { status: 500 }
    );
  }
}
