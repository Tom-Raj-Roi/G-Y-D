import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Define CORS headers. For production, you should restrict the origin to your actual frontend URL
// for better security, e.g., "https://your-domain.com".
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or "https://your-frontend-domain.com"
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (request) => {
  // Immediately handle preflight OPTIONS requests.
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return new Response(JSON.stringify({ success: false, message: "Subject and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("NOTIFICATION_FROM_EMAIL");
    const to = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

    if (!resendKey || !from || !to) {
      console.error("Function not fully configured: Missing RESEND_API_KEY, NOTIFICATION_FROM_EMAIL, or ADMIN_NOTIFICATION_EMAIL environment variables.");
      // We don't want to block the user flow if admin notifications fail, so we return success.
      return new Response(JSON.stringify({ success: true, message: "Submission received, but admin notification is not configured." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html: message }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Resend API error: ${res.status} ${res.statusText}`, errorBody);
      throw new Error("Failed to send email via provider.");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("An unexpected error occurred in the edge function:", error);
    return new Response(JSON.stringify({ success: false, message: error instanceof Error ? error.message : "An internal server error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});