import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });

serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed" }, 405);
  }

  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim()?.toLowerCase();
    const otp = body?.otp?.trim();

    if (!email || !otp) {
      return jsonResponse({ success: false, message: "Email and OTP are required" }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ success: false, message: "Invalid email address format" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!resendKey || !from) {
      console.error(
        "[send-otp-email] Missing required secrets: RESEND_API_KEY or NOTIFICATION_FROM_EMAIL"
      );
      return jsonResponse(
        {
          success: false,
          message: "Email provider credentials are not configured on the server.",
        },
        503
      );
    }

    const textBody =
      `Your verification code is: ${otp}\n\n` +
      `Enter this 8-digit code on the website to verify your email.\n\n` +
      `This code will expire in 10 minutes.\n\n` +
      `If you did not request this code, please ignore this email.`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
    .subtitle { font-size: 14px; color: #64748b; margin: 0; }
    .code-box { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; text-align: center; margin: 28px 0; padding: 18px 24px; background-color: #eff6ff; border-radius: 10px; border: 1px solid #bfdbfe; font-mono: monospace; }
    .info { font-size: 14px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 24px; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Email Verification</h1>
      <p class="subtitle">Get Your Dreams Security</p>
    </div>
    <div class="info">
      Use the verification code below to confirm your email address. This code will expire in <strong>10 minutes</strong>.
    </div>
    <div class="code-box">${otp}</div>
    <div class="info">
      If you did not request this verification code, no further action is required.
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Get Your Dreams. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout to Resend API

    console.log(`[send-otp-email] Sending OTP to ${email}...`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `${otp} is your verification code`,
        text: textBody,
        html: htmlBody,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[send-otp-email] Resend API error (${response.status}) in ${duration}ms: ${errorText}`
      );
      return jsonResponse(
        {
          success: false,
          message: `Email delivery failed (${response.status}): ${errorText}`,
        },
        502
      );
    }

    const responseData = await response.json().catch(() => ({}));
    console.log(`[send-otp-email] OTP successfully sent to ${email} in ${duration}ms (id: ${responseData?.id})`);

    return jsonResponse({ success: true, id: responseData?.id, durationMs: duration });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const isAbort = error?.name === "AbortError";
    const errorMessage = isAbort
      ? "Email provider request timed out after 8s"
      : error instanceof Error
      ? error.message
      : String(error);

    console.error(`[send-otp-email] Failed after ${duration}ms: ${errorMessage}`);

    return jsonResponse(
      {
        success: false,
        message: errorMessage,
      },
      500
    );
  }
});
