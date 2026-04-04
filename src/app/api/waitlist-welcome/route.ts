import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'QuitFree <onboarding@resend.dev>';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping welcome email');
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "You're on the list — QuitFree.ai",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">You're on the list!</h1>
          </div>
          <p style="color: #444; line-height: 1.7; font-size: 16px;">
            Thanks for signing up for <strong>QuitFree</strong> — a gentle digital program
            to help you get ready to quit smoking.
          </p>
          <p style="color: #444; line-height: 1.7; font-size: 16px;">
            We'll email you when we launch with the first gentle exercises
            and simple guidance.
          </p>
          <div style="margin: 32px 0; padding: 20px; background: #f8f8f8; border-radius: 12px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              No pressure &bull; At your own pace &bull; You can leave anytime
            </p>
          </div>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">
            — The QuitFree team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Welcome email failed:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
