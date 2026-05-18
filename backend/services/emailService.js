import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM || 'StudentHub <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function getResendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  const resend = getResendClient();
  if (!resend) {
    console.log(`[ŞİFRE SIFIRLAMA] Token: ${token} — Kullanıcı: ${email}`);
    console.log(`[ŞİFRE SIFIRLAMA] Link: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'StudentHub — Şifre Sıfırlama',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#4f46e5;font-size:1.5rem;margin-bottom:0.5rem;">Şifre Sıfırlama</h2>
        <p style="color:#475569;margin-bottom:1.5rem;">
          Aşağıdaki butona tıklayarak şifreni sıfırlayabilirsin.
          Bu bağlantı <strong>1 saat</strong> geçerlidir.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;">
          Şifremi Sıfırla
        </a>
        <p style="color:#94a3b8;font-size:0.8rem;margin-top:1.5rem;">
          Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0;">
        <p style="color:#cbd5e1;font-size:0.75rem;">StudentHub &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
  });
}
