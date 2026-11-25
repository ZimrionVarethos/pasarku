import crypto from 'node:crypto';
import tls from 'node:tls';
import type { OtpPurpose } from '@/lib/types/user';

export function generateSixDigitOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function isGmailSmtpConfigured(): boolean {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  return Boolean(user && pass);
}

function sendSmtpCommand(
  socket: tls.TLSSocket,
  command: string,
  expectedPrefix: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      if (!buffer.endsWith('\r\n')) return;
      const lines = buffer.split('\r\n').filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(lastLine)) {
        cleanup();
        if (lastLine.startsWith(expectedPrefix)) {
          resolve(buffer);
        } else {
          reject(new Error(`SMTP error: ${lastLine}`));
        }
      }
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error('SMTP timeout'));
    };
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
      socket.off('timeout', onTimeout);
    };
    socket.on('data', onData);
    socket.on('error', onError);
    socket.on('timeout', onTimeout);
    if (command) socket.write(`${command}\r\n`);
  });
}

async function sendViaGmailSmtps(params: {
  from: string;
  appPassword: string;
  to: string;
  subject: string;
  textBody: string;
}): Promise<void> {
  const socket = tls.connect({
    host: 'smtp.gmail.com',
    port: 465,
    servername: 'smtp.gmail.com',
  });
  socket.setTimeout(8000);

  try {
    await sendSmtpCommand(socket, '', '220');
    await sendSmtpCommand(socket, 'EHLO pasarku-idn.vercel.app', '250');
    await sendSmtpCommand(socket, 'AUTH LOGIN', '334');
    await sendSmtpCommand(socket, Buffer.from(params.from).toString('base64'), '334');
    await sendSmtpCommand(
      socket,
      Buffer.from(params.appPassword.replace(/\s+/g, '')).toString('base64'),
      '235'
    );
    await sendSmtpCommand(socket, `MAIL FROM:<${params.from}>`, '250');
    await sendSmtpCommand(socket, `RCPT TO:<${params.to}>`, '250');
    await sendSmtpCommand(socket, 'DATA', '354');

    const safeTo = params.to.replace(/[\r\n]/g, '');
    const safeSubject = params.subject.replace(/[\r\n]/g, '');
    const mimeMessage = [
      `From: PasarKu Verifikasi <${params.from}>`,
      `To: <${safeTo}>`,
      `Subject: ${safeSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      params.textBody,
      '.',
    ].join('\r\n');

    await sendSmtpCommand(socket, mimeMessage, '250');
    await sendSmtpCommand(socket, 'QUIT', '221').catch(() => '');
  } finally {
    socket.end();
  }
}

export async function dispatchGmailOtpEmail(params: {
  to: string;
  code: string;
  purpose: OtpPurpose;
  recipientName?: string;
}): Promise<{ deliveryMode: 'gmail_smtp' | 'demo_simulation' }> {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!gmailUser || !gmailPass) {
    return { deliveryMode: 'demo_simulation' };
  }

  const actionLabel = params.purpose === 'REGISTER' ? 'Pendaftaran Akun' : 'Masuk Akun';
  const greeting = params.recipientName ? `Halo ${params.recipientName},` : 'Halo Warga PasarKu,';
  const textBody = [
    greeting,
    '',
    `Kode OTP verifikasi ${actionLabel} PasarKu Anda adalah: ${params.code}`,
    '',
    'Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.',
    '',
    'Salam transparansi pangan,',
    'Tim PasarKu Indonesia',
  ].join('\r\n');

  try {
    await sendViaGmailSmtps({
      from: gmailUser,
      appPassword: gmailPass,
      to: params.to,
      subject: `[PasarKu] Kode OTP ${actionLabel}: ${params.code}`,
      textBody,
    });
    return { deliveryMode: 'gmail_smtp' };
  } catch {
    return { deliveryMode: 'demo_simulation' };
  }
}
