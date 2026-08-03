import { serve } from "std/http/server.ts";

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
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
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
      return jsonResponse({ success: false, message: "Email provider is not configured" }, 503);
    }

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
        text: `Your verification code is: ${otp}\n\nEnter this 8-digit code on the website to verify your email.`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse({ success: false, message: errorText }, 502);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse(
      { success: false, message: error instanceof Error ? error.message : "Unexpected error" },
      500,
    );
  }
});
