import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Module {
  title: string;
  objective: string;
  deliverables: string[];
  timeline: string;
  priority: string;
  assigned_expert_name: string;
}

interface Proposal {
  executive_summary: string;
  modules: Module[];
  total_timeline: string;
  estimated_investment_range: string;
  next_steps: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(name: string, proposal: Proposal): string {
  const modulesHtml = (proposal.modules || [])
    .map(
      (m) => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="margin:0;color:#111827;font-size:16px;">${escapeHtml(m.title)}</h3>
          <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:#eff6ff;color:#1d4ed8;text-transform:uppercase;">${escapeHtml(m.priority)}</span>
        </div>
        <p style="margin:0 0 8px;color:#4b5563;font-size:14px;">${escapeHtml(m.objective)}</p>
        ${(m.deliverables || []).length
          ? `<ul style="margin:8px 0;padding-left:20px;color:#4b5563;font-size:13px;">${(m.deliverables || []).map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
          : ""}
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Timeline: ${escapeHtml(m.timeline)} &middot; Expert: ${escapeHtml(m.assigned_expert_name)}</p>
      </div>`,
    )
    .join("");

  const nextStepsHtml = (proposal.next_steps || [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;padding:24px;color:#111827;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h1 style="margin:0 0 4px;font-size:22px;">Your personalised Scaleit proposal</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi ${escapeHtml(name)}, here is your tailored plan.</p>

    <h2 style="font-size:14px;text-transform:uppercase;color:#6b7280;margin:0 0 8px;letter-spacing:0.05em;">Executive summary</h2>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">${escapeHtml(proposal.executive_summary || "")}</p>

    <h2 style="font-size:14px;text-transform:uppercase;color:#6b7280;margin:0 0 8px;letter-spacing:0.05em;">Modules</h2>
    ${modulesHtml}

    <div style="display:flex;gap:16px;margin:24px 0;padding:16px;background:#f3f4f6;border-radius:8px;font-size:13px;">
      <div><strong>Total timeline:</strong> ${escapeHtml(proposal.total_timeline || "TBD")}</div>
      <div><strong>Investment:</strong> ${escapeHtml(proposal.estimated_investment_range || "TBD")}</div>
    </div>

    ${nextStepsHtml ? `<h2 style="font-size:14px;text-transform:uppercase;color:#6b7280;margin:0 0 8px;letter-spacing:0.05em;">Next steps</h2><ol style="padding-left:20px;font-size:14px;color:#374151;">${nextStepsHtml}</ol>` : ""}

    <p style="margin-top:32px;color:#9ca3af;font-size:12px;">Sent from the Scaleit team via EU Enterprise.</p>
  </div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireAdmin(req, corsHeaders);
  if (!auth.ok) return auth.response!;

  try {
    const { proposal_request_id } = await req.json();
    if (!proposal_request_id) throw new Error("proposal_request_id required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: request, error: reqErr } = await admin
      .from("proposal_requests")
      .select("*")
      .eq("id", proposal_request_id)
      .single();
    if (reqErr || !request) throw new Error("proposal_request not found");

    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", request.user_id)
      .maybeSingle();

    const { data: userRecord } = await admin.auth.admin.getUserById(request.user_id);
    const email = userRecord?.user?.email;
    const name = profile?.full_name || email?.split("@")[0] || "there";

    let emailSent = false;
    if (RESEND_API_KEY && email) {
      const html = buildHtml(name, (request.generated_modules || {}) as Proposal);
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Scaleit Team <onboarding@resend.dev>",
          to: [email],
          subject: "Your personalised Scaleit proposal is ready",
          html,
        }),
      });
      if (!resendResp.ok) {
        const txt = await resendResp.text();
        console.error("Resend error:", resendResp.status, txt);
      } else {
        emailSent = true;
      }
    } else {
      console.log("RESEND_API_KEY or email missing; skipping send");
    }

    const { error: updErr } = await admin
      .from("proposal_requests")
      .update({ status: "proposal_sent", sent_at: new Date().toISOString() })
      .eq("id", proposal_request_id);
    if (updErr) console.error("Status update error:", updErr);

    // Add a digest event for the founder so weekly digest picks it up
    await admin.from("digest_events").insert({
      user_id: request.user_id,
      event_type: "proposal_sent",
      payload: { proposal_request_id },
    });

    return new Response(JSON.stringify({ success: true, emailSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-proposal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
