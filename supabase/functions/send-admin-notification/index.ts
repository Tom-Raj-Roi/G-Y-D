import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-webhook-secret",
  "Access-Control-Max-Age": "86400",
};

const recipient = "ottatyre120421@gmail.com";

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret && request.headers.get("x-webhook-secret") !== webhookSecret) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await request.json();
    const record = payload.record ?? payload;
    const title = payload.subject ?? record.title ?? "New website submission";
    const rawSummary = payload.message ?? record.summary ?? "Open the GYD admin dashboard to review it.";
    const summary = typeof rawSummary === "string" ? rawSummary.replace(/<[^>]*>/g, "") : String(rawSummary);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");

    if (!resendKey || !from) {
      return new Response(JSON.stringify({ error: "Email provider is not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `[GYD] ${title}`,
        text: `${summary}\n\nOpen the Admin Dashboard to review the full submission.`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ delivered: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

