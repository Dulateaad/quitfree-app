import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineString } from 'firebase-functions/params';
import { Resend } from 'resend';

const resendApiKey = defineString('RESEND_API_KEY', { description: 'Resend API key for sending emails' });
const fromEmail = defineString('RESEND_FROM_EMAIL', {
  default: 'QuitFree <onboarding@resend.dev>',
  description: 'From email - verify domain at resend.com/domains',
});

export const onWaitlistSignup = onDocumentCreated('waitlist/{docId}', async (event) => {
  const snap = event.data;
  if (!snap) return;

  const data = snap.data();
  const email = data?.email;

  if (!email || typeof email !== 'string') return;

  const apiKey = resendApiKey.value();
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: fromEmail.value(),
    to: [email],
    subject: "You're on the list — QuitFree.ai",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">You're on the list!</h1>
        <p style="color: #444; line-height: 1.6;">
          Thanks for signing up for QuitFree — a gentle digital program to help you get ready to quit smoking.
        </p>
        <p style="color: #444; line-height: 1.6;">
          We'll email you when we launch with the first gentle exercises and simple guidance.
        </p>
        <p style="color: #888; font-size: 14px; margin-top: 24px;">
          No pressure. At your own pace. You can leave anytime.
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          — The QuitFree team
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send waitlist email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log(`Welcome email sent to ${email}`);
});
