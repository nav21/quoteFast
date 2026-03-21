import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'QuoteFast <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function sendVerificationEmail(to, rawToken) {
  if (!resend) {
    throw new Error('Email service not configured — set RESEND_API_KEY');
  }

  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${rawToken}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Verify your email — QuoteFast',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FDFBF7;">
        <h1 style="font-size: 24px; color: #1B2A4A; margin: 0 0 8px;">QuoteFast</h1>
        <p style="font-size: 14px; color: #1B2A4A; opacity: 0.6; margin: 0 0 32px;">Professional quotes in under 60 seconds</p>
        <p style="font-size: 15px; color: #1B2A4A; line-height: 1.6; margin: 0 0 24px;">
          Thanks for signing up! Please verify your email address to get started.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #D4A843; color: #1B2A4A; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 8px;">
          Verify Email
        </a>
        <p style="font-size: 12px; color: #1B2A4A; opacity: 0.4; margin: 32px 0 0; line-height: 1.5;">
          This link expires in 24 hours.<br/>
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
