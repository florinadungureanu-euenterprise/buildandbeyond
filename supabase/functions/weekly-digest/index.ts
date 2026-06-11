import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface DigestEvent {
  id: string;
  user_id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

function renderEmail(name: string, eventsByType: Record<string, DigestEvent[]>): string {
  const sections = Object.entries(eventsByType)
    .map(([type, items]) => {
      const list = items
        .map((e) => {
          const title =
            (e.payload?.title as string) ||
            (e.payload?.name as string) ||
            (e.payload?.proposal_request_id as string) ||
            "Update";
          return `<li>${escapeHtml(String(title))}</li>`;
        })
        .join("");
      return `<h3 style="font-size:14px;text-transform:uppercase;color:#6b7280;margin:24px 0 8px;letter-spacing:0.05em;">${escapeHtml(type.replace(/_/g, " "))}</h3><ul style="padding-left:20px;font-size:14px;color:#374151;">${list}</ul>`;
    })
    .join("");

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;padding:24px;color:#111827;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h1 style="margin:0 0 4px;font-size:22px;">Your weekly digest</h1>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">Hi ${escapeHtml(name)}, here's what happened on EU Enterprise this week.</p>
    ${sections || "<p>No updates this week.</p>"}
    <p style="margin-top:32px;color:#9ca3af;font-size:12px;">You can change your digest frequency in Settings.</p>
  </div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profiles, error: pErr } = await admin
      .from("profiles")
      .select("id, full_name, digest_frequency")
      .neq("digest_frequency", "off");
    if (pErr) throw pErr;

    let totalSent = 0;
    let totalSkipped = 0;

    for (const profile of profiles || []) {
      const { data: events } = await admin
        .from("digest_events")
        .select("id, user_id, event_type, payload")
        .eq("user_id", profile.id)
        .is("consumed_at", null);

      if (!events || events.length === 0) {
        totalSkipped++;
        continue;
      }

      const { data: userRecord } = await admin.auth.admin.getUserById(profile.id);
      const email = userRecord?.user?.email;
      if (!email) {
        totalSkipped++;
        continue;
      }

      const grouped: Record<string, DigestEvent[]> = {};
      for (const ev of events as DigestEvent[]) {
        (grouped[ev.event_type] ||= []).push(ev);
      }

      const name = profile.full_name?.split(" ")[0] || email.split("@")[0];
      const html = renderEmail(name, grouped);

      if (RESEND_API_KEY) {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EU Enterprise <onboarding@resend.dev>",
            to: [email],
            subject: "Your weekly EU Enterprise digest",
            html,
          }),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.error("Resend error for", email, resp.status, txt);
          continue;
        }
      } else {
        console.log("Would send digest to", email);
      }

      const ids = events.map((e) => e.id);
      await admin
        .from("digest_events")
        .update({ consumed_at: new Date().toISOString() })
        .in("id", ids);

      totalSent++;
    }

    return new Response(JSON.stringify({ success: true, totalSent, totalSkipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("weekly-digest error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
