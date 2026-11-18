import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // If user already verified, disallow re-registration
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar dan terverifikasi. Silakan masuk.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0ea5e9&color=fff`;
    const memberSince = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

    // Generate 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.$transaction(async (tx) => {
      let targetUser = existingUser;

      if (!targetUser) {
        targetUser = await tx.user.create({
          data: {
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            avatar,
            plan: 'free',
            memberSince,
            emailVerified: null,
          },
        });
      } else {
        // Update user credentials if unverified user registers again
        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            name: cleanName,
            password: hashedPassword,
            avatar,
          },
        });
      }

      // Remove any previous verification codes for this email
      await tx.verificationCode.deleteMany({
        where: { email: cleanEmail },
      });

      // Save new verification code
      await tx.verificationCode.create({
        data: {
          email: cleanEmail,
          code: verificationCode,
          expiresAt,
        },
      });
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      name: cleanName,
      code: verificationCode,
    });

    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        simulated: emailResult.simulated,
        devCode: emailResult.simulated ? verificationCode : undefined,
        message: 'Kode verifikasi telah dikirim ke email Anda.',
      },
      { status: 201 }
    );
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
          : 'Terjadi kesalahan pada server saat mendaftar.',
      },
      { status: 500 }
    );
  }
}
