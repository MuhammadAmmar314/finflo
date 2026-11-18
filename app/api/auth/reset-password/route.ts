import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, kode verifikasi, dan kata sandi baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi baru minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify OTP code
    const storedCode = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: cleanCode,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedCode) {
      return NextResponse.json(
        { success: false, error: 'Kode verifikasi salah atau tidak ditemukan.' },
        { status: 400 }
      );
    }

    if (new Date() > storedCode.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Kode verifikasi sudah kadaluarsa. Silakan minta kode baru.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and ensure emailVerified is set
    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // Delete used verification codes
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui kata sandi.' },
      { status: 500 }
    );
  }
}
