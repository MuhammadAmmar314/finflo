import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
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
        savingsGoals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akun dengan email ini tidak ditemukan. Silakan klik "Daftar Akun Baru" terlebih dahulu.' },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Akun ini belum memiliki kata sandi. Silakan gunakan fitur pendaftaran atau reset kata sandi.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Check email verification status
    if (!user.emailVerified) {
      if (cleanEmail === defaultUser.email.toLowerCase()) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
          include: {
            wallets: true,
            expenseCategories: true,
            incomeCategories: true,
            transactions: true,
            debts: true,
            savingsGoals: true,
          },
        });
      } else {
        // Send a fresh verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.verificationCode.deleteMany({
          where: { email: cleanEmail },
        });

        await prisma.verificationCode.create({
          data: {
            email: cleanEmail,
            code: verificationCode,
            expiresAt,
          },
        });

        const emailResult = await sendVerificationEmail({
          to: cleanEmail,
          name: user.name,
          code: verificationCode,
        });

        return NextResponse.json(
          {
            success: false,
            requiresVerification: true,
            email: cleanEmail,
            simulated: emailResult.simulated,
            devCode: emailResult.simulated ? verificationCode : undefined,
            error: 'Email Anda belum diverifikasi. Silakan masukkan kode verifikasi yang telah dikirim ke email Anda.',
          },
          { status: 403 }
        );
      }
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const isDbError =
      msg.includes("Can't reach database server") ||
      msg.includes('P1001') ||
      msg.includes('connect') ||
      msg.includes('database');

    return NextResponse.json(
      {
        success: false,
        isDatabaseError: isDbError,
        error: isDbError
          ? 'Tidak dapat terhubung ke database server (PostgreSQL localhost:5432). Pastikan layanan PostgreSQL di DraGon sudah dijalankan.'
          : 'Gagal memproses login.',
      },
      { status: 500 }
    );
  }
}
