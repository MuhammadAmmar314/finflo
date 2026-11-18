import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendProActivationEmail } from '@/lib/email';

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomSegment(length: number): string {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

function generateLicenseCode(): string {
  const p1 = generateRandomSegment(4);
  const p2 = generateRandomSegment(4);
  const p3 = generateRandomSegment(4);
  return `FINFLO-${p1}-${p2}-${p3}`;
}

function generateTempPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ!@#$';
  let pass = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'FinFlo Lynk.id Webhook Service is ready to receive events.',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ success: false, error: 'Empty payload' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    console.log('[Webhook Lynk.id] Received payload:', JSON.stringify(payload, null, 2));

    const messageAction = payload?.data?.message_action || payload?.event;
    const messageData = payload?.data?.message_data || payload?.data || payload;

    const customer = messageData?.customer;
    const rawEmail =
      customer?.email ||
      payload?.email ||
      payload?.customer_email ||
      messageData?.email;

    const customerName =
      customer?.name ||
      payload?.name ||
      customer?.full_name ||
      'Pengguna FinFlo';

    const orderId =
      messageData?.refId ||
      messageData?.orderId ||
      payload?.order_id ||
      payload?.data?.message_id ||
      'LYNK-' + Date.now();

    const isSuccess =
      messageAction === 'SUCCESS' ||
      messageAction === 'payment.received' ||
      payload?.status === 'success' ||
      payload?.status === 'paid' ||
      !messageAction;

    if (!isSuccess) {
      console.log(`[Webhook Lynk.id] Ignored event: ${messageAction}`);
      return NextResponse.json({
        success: true,
        message: `Event ${messageAction} recorded but ignored (not a success event).`,
      });
    }

    if (!rawEmail || typeof rawEmail !== 'string') {
      console.warn('[Webhook Lynk.id] Missing customer email in payload.');
      return NextResponse.json(
        { success: false, error: 'Customer email not found in webhook payload.' },
        { status: 400 }
      );
    }

    const cleanEmail = rawEmail.trim().toLowerCase();
    const licenseKey = generateLicenseCode();

    // Check existing user in PostgreSQL
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          plan: 'pro',
        },
      });

      // Record license key if table exists
      try {
        await (prisma as any).licenseKey?.create({
          data: {
            code: licenseKey,
            tier: 'pro',
            isUsed: true,
            usedAt: new Date(),
            usedByUserId: existingUser.id,
            channel: 'lynkid',
          },
        });
      } catch (err) {
        console.warn('[Webhook Lynk.id] Could not save to LicenseKey table:', err);
      }

      // Send Pro Activation Email
      const emailResult = await sendProActivationEmail({
        to: cleanEmail,
        name: existingUser.name || customerName,
        licenseKey,
        isNewUser: false,
      });

      console.log(
        `[Webhook Lynk.id] SUKSES: Akun ${cleanEmail} di-upgrade ke Pro. Email dikirim (simulated: ${emailResult.simulated}).`
      );

      return NextResponse.json({
        success: true,
        message: `Akun ${cleanEmail} berhasil ditingkatkan ke FinFlo Pro Lifetime.`,
        data: {
          email: cleanEmail,
          plan: 'pro',
          licenseKey,
          orderId,
        },
      });
    } else {
      // User doesn't have an account yet: generate random password
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: customerName,
          password: hashedPassword,
          plan: 'pro',
          emailVerified: new Date(),
          memberSince: new Date().toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          }),
        },
      });

      // Record license key
      try {
        await (prisma as any).licenseKey?.create({
          data: {
            code: licenseKey,
            tier: 'pro',
            isUsed: true,
            usedAt: new Date(),
            usedByUserId: newUser.id,
            channel: 'lynkid',
          },
        });
      } catch (err) {
        console.warn('[Webhook Lynk.id] Could not save to LicenseKey table:', err);
      }

      // Send Pro Activation Email with login credentials
      const emailResult = await sendProActivationEmail({
        to: cleanEmail,
        name: customerName,
        licenseKey,
        isNewUser: true,
        tempPassword,
      });

      console.log(
        `[Webhook Lynk.id] SUKSES: Akun baru dibuat untuk ${cleanEmail} dengan password acak & status Pro. Email dikirim (simulated: ${emailResult.simulated}).`
      );

      return NextResponse.json({
        success: true,
        message: `Akun baru ${cleanEmail} telah dibuat dengan akses FinFlo Pro Lifetime.`,
        data: {
          id: newUser.id,
          email: cleanEmail,
          plan: 'pro',
          licenseKey,
          orderId,
        },
      });
    }
  } catch (error: any) {
    console.error('[Webhook Lynk.id Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing webhook',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
