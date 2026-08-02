import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return new Response(JSON.stringify({ success: false, message: "Subject and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");
    const to = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

    if (!resendKey || !from || !to) {
      console.error("Email provider (Resend) or admin email is not configured in environment variables.");
      // We don't want to block the user flow if admin notifications fail, so we return success.
      return new Response(JSON.stringify({ success: true, message: "Submission received, but admin notification is not configured." }), { status: 200 });
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html: message }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    // Again, don't block user flow.
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Unexpected error" }), { status: 500 });
  }
});