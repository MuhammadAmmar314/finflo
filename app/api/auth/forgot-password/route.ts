import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Pengguna dengan email ini tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete existing verification codes for this email
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

    // Send reset password email
    const emailResult = await sendResetPasswordEmail({
      to: cleanEmail,
      name: user.name,
      code: verificationCode,
    });

    return NextResponse.json({
      success: true,
      simulated: emailResult.simulated,
      devCode: emailResult.simulated ? verificationCode : undefined,
      message: 'Kode verifikasi reset kata sandi telah dikirim ke email Anda.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses permintaan reset kata sandi.' },
      { status: 500 }
    );
  }
}
