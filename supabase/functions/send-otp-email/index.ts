import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
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

  try {
    const body = await request.json();
    const email = body?.email;
    const otp = body?.otp;

    if (!email || !otp) {
      return jsonResponse({ success: false, message: "Email and OTP are required" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!resendKey || !from) {
      console.error(
        "send-otp-email: Missing required environment secrets. " +
          "Set RESEND_API_KEY and NOTIFICATION_FROM_EMAIL in Supabase secrets.",
      );
      return jsonResponse(
        { success: false, message: "Email provider is not configured on the server." },
        503
      );
    }

    // Build both text and HTML versions of the email for better
    // deliverability and a richer user experience.
    const textBody =
      `Your verification code is: ${otp}\n\n` +
      `Enter this 8-digit code on the website to verify your email.\n\n` +
      `This code will expire in 10 minutes.`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb; text-align: center; margin: 30px 0; padding: 16px 24px; background-color: #f0f4ff; border-radius: 8px; display: inline-block; }
    .label { font-size: 14px; color: #6b7280; }
    h1 { font-size: 20px; color: #1f2937; margin-bottom: 8px; }
    p { color: #4b5563; line-height: 1.6; }
    .footer { margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Verification Code</h1>
    <p>Please enter the following code on the website to verify your email address:</p>
    <div class="code">${otp}</div>
    <p class="label">This code will expire in 10 minutes.</p>
    <p>If you did not request this code, please ignore this email.</p>
    <div class="footer">
      This email was sent by Get Your Dreams.
    </div>
  </div>
</body>
</html>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your verification code",
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `send-otp-email: Resend API returned ${response.status}: ${errorText}`,
      );
      return jsonResponse(
        {
          success: false,
          message: `Resend API error (${response.status}): ${errorText}`,
        },
        502,
      );
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(
      "send-otp-email: Unexpected error:",
      error instanceof Error ? error.message : String(error),
    );
    return jsonResponse(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      500,
    );
  }
});
