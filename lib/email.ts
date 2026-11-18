import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  code: string;
}

interface SendResetPasswordEmailParams {
  to: string;
  name: string;
  code: string;
}

interface SendProActivationEmailParams {
  to: string;
  name: string;
  licenseKey: string;
  isNewUser: boolean;
  tempPassword?: string;
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"FinFlo" <noreply@finflo.app>';

  if (!host || !user || !pass) {
    return { isConfigured: false, transporter: null, from };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return { isConfigured: true, transporter, from };
}

export async function sendVerificationEmail({ to, name, code }: SendVerificationEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  error?: string;
}> {
  const { isConfigured, transporter, from } = getMailTransporter();

  if (!isConfigured || !transporter) {
    console.log('\n=========================================');
    console.log('[FINFLO DEV EMAIL] Verifikasi Email');
    console.log(`Tujuan: ${name} <${to}>`);
    console.log(`Kode OTP: ${code}`);
    console.log('Berlaku: 15 menit');
    console.log('=========================================\n');
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Email FinFlo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Fin<span style="color: #38bdf8;">Flo</span>
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Verifikasi Akun Finansial Anda</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Gunakan kode verifikasi berikut untuk mengonfirmasi akun FinFlo Anda. Kode ini berlaku selama <strong>15 menit</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px 0 24px 0;">
              <div style="display: inline-block; background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 14px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #38bdf8;">
                ${code}
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #334155; padding-top: 20px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Jangan berikan kode ini kepada siapa pun. Jika Anda tidak merasa mendaftar di FinFlo, abaikan email ini.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #475569; text-align: center;">
          &copy; ${new Date().getFullYear()} FinFlo. Solusi Pembukuan Finansial Terpadu.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `${code} adalah kode verifikasi FinFlo Anda`,
      text: `Halo ${name},\n\nKode verifikasi FinFlo Anda adalah: ${code}\nKode berlaku selama 15 menit.\n\nJangan berikan kode ini kepada siapa pun.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Gagal mengirim email verifikasi:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengirim email verifikasi.',
    };
  }
}

export async function sendResetPasswordEmail({ to, name, code }: SendResetPasswordEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  error?: string;
}> {
  const { isConfigured, transporter, from } = getMailTransporter();

  if (!isConfigured || !transporter) {
    console.log('\n=========================================');
    console.log('[FINFLO DEV EMAIL] Reset Kata Sandi');
    console.log(`Tujuan: ${name} <${to}>`);
    console.log(`Kode OTP: ${code}`);
    console.log('Berlaku: 15 menit');
    console.log('=========================================\n');
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi FinFlo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Fin<span style="color: #38bdf8;">Flo</span>
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Permintaan Pemulihan Kata Sandi</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Kami menerima permintaan untuk mereset kata sandi akun FinFlo Anda. Masukkan kode verifikasi berikut di halaman login:
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 16px 0 24px 0;">
              <div style="display: inline-block; background-color: #0f172a; border: 1px solid #f59e0b; border-radius: 12px; padding: 14px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #fbbf24;">
                ${code}
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #334155; padding-top: 20px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Kode ini berlaku selama 15 menit. Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dan akun Anda tetap aman.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #475569; text-align: center;">
          &copy; ${new Date().getFullYear()} FinFlo. Solusi Pembukuan Finansial Terpadu.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `${code} adalah kode reset kata sandi FinFlo Anda`,
      text: `Halo ${name},\n\nKode reset kata sandi FinFlo Anda adalah: ${code}\nKode berlaku selama 15 menit.\n\nJangan berikan kode ini kepada siapa pun.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Gagal mengirim email reset kata sandi:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengirim email reset kata sandi.',
    };
  }
}

export async function sendProActivationEmail({
  to,
  name,
  licenseKey,
  isNewUser,
  tempPassword,
}: SendProActivationEmailParams): Promise<{
  success: boolean;
  simulated?: boolean;
  error?: string;
}> {
  const { isConfigured, transporter, from } = getMailTransporter();

  if (!isConfigured || !transporter) {
    console.log('\n=========================================');
    console.log('[FINFLO DEV EMAIL] Aktivasi FinFlo Pro Lifetime');
    console.log(`Tujuan: ${name} <${to}>`);
    console.log(`Kode Lisensi: ${licenseKey}`);
    if (isNewUser) {
      console.log(`Status: Akun Baru Dibuat Otomatis`);
      console.log(`Password Sementara: ${tempPassword}`);
    } else {
      console.log(`Status: Akun Terdaftar Di-Upgrade`);
    }
    console.log('=========================================\n');
    return { success: true, simulated: true };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivasi FinFlo Pro Lifetime Berhasil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; padding: 32px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 20px; padding: 8px 16px; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight: 700; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase;">
                  FinFlo Pro Lifetime
                </span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
                Selamat Datang di FinFlo Pro!
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
                Pembayaran Anda telah diverifikasi. Akses seumur hidup Anda telah aktif.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Terima kasih atas kepercayaan Anda memilih FinFlo. Berikut adalah bukti kode lisensi digital dan data akses akun Anda:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 0 20px 0;">
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px 20px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px;">
                  Kode Lisensi Resmi:
                </div>
                <div style="margin-top: 4px; font-family: monospace; font-size: 18px; font-weight: 700; color: #38bdf8; letter-spacing: 2px;">
                  ${licenseKey}
                </div>
                <div style="margin-top: 12px; border-top: 1px solid #1e293b; padding-top: 12px;">
                  <span style="font-size: 12px; color: #94a3b8;">Email Akun: </span>
                  <strong style="font-size: 12px; color: #f8fafc;">${to}</strong>
                </div>
                ${
                  isNewUser && tempPassword
                    ? `
                <div style="margin-top: 8px;">
                  <span style="font-size: 12px; color: #94a3b8;">Kata Sandi Sementara: </span>
                  <strong style="font-size: 13px; font-family: monospace; color: #fbbf24; background-color: #1e293b; padding: 2px 8px; border-radius: 6px;">${tempPassword}</strong>
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: #f59e0b; line-height: 1.5;">
                  * Catatan: Akun Anda dibuatkan secara otomatis. Anda dapat langsung masuk dengan email dan kata sandi sementara di atas, lalu ubah kata sandi di halaman Profil.
                </div>
                `
                    : `
                <div style="margin-top: 6px; font-size: 11px; color: #10b981;">
                  * Akun yang terdaftar dengan email ini telah otomatis ditingkatkan ke paket Pro.
                </div>
                `
                }
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 24px;">
              <div style="background-color: #1e293b; border-radius: 12px; padding: 14px 16px; border: 1px solid #334155;">
                <div style="font-size: 12px; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">
                  Hak Akses Pro Anda:
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                  <li>Kelola dompet dan rekening tanpa batasan kuota</li>
                  <li>Kategori pengeluaran dan evaluasi anggaran adaptif</li>
                  <li>Modul pelacakan hutang, piutang, dan cicilan paylater</li>
                  <li>Analisis evaluasi kesehatan finansial dan audit anggaran</li>
                  <li>Simulasi target tabungan dan ekspor laporan PDF</li>
                </ul>
              </div>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #334155; padding-top: 20px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                Simpan email ini sebagai bukti kepemilikan lisensi digital Anda. Jika ada kendala, hubungi kami kapan saja.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #475569; text-align: center;">
          &copy; ${new Date().getFullYear()} FinFlo. Solusi Pembukuan Finansial Terpadu.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `Aktivasi FinFlo Pro Berhasil : Kode Lisensi ${licenseKey}`,
      text: `Halo ${name},\n\nPembayaran Anda telah kami terima.\nKode Lisensi FinFlo Pro Anda: ${licenseKey}\n${
        isNewUser ? `Kata sandi sementara akun Anda: ${tempPassword}\n` : ''
      }\nSilakan login ke FinFlo untuk menikmati seluruh fitur Pro seumur hidup.`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Gagal mengirim email aktivasi Pro:', err);
    return {
      success: false,
      error: err.message || 'Gagal mengirim email aktivasi Pro.',
    };
  }
}
