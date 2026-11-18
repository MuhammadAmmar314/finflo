import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

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

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email ini sudah terverifikasi.' },
        { status: 400 }
      );
    }

    // Generate new 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Replace previous codes
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

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      code: verificationCode,
    });

    return NextResponse.json({
      success: true,
      simulated: emailResult.simulated,
      devCode: emailResult.simulated ? verificationCode : undefined,
      message: 'Kode verifikasi baru telah dikirim ke email Anda.',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim ulang kode verifikasi.' },
      { status: 500 }
    );
  }
}
