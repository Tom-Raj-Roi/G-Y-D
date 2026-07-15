import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const recipient = "ottatyre120421@gmail.com";

serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret && request.headers.get("x-webhook-secret") !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const record = payload.record ?? payload;
  const title = record.title ?? "New website submission";
  const summary = record.summary ?? "Open the GYD admin dashboard to review it.";
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");

  if (!resendKey || !from) {
    return new Response("Email provider is not configured", { status: 503 });
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

  if (!response.ok) return new Response(await response.text(), { status: 502 });
  return Response.json({ delivered: true });
});
