export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY; const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error('Email delivery is not configured.');
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject: 'Reset your ArenaOps password', html: `<p>Use this link to reset your password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p>` }) });
  if (!response.ok) throw new Error(`Resend rejected the email (${response.status}).`);
}
