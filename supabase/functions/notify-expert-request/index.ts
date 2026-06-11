// Edge function: notify-expert-request
// Sends emails for the founder → expert request flow.
// Actions:
//   - new_request: founder just sent a request → email the targeted expert
//   - approved:    expert approved → email the founder
//   - declined:    expert declined → email the founder
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("FROM_EMAIL") || "EU Enterprise <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") || "https://euenterprise.org";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing — skipping email send.");
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Resend error:", res.status, txt);
    return { skipped: false, error: txt };
  }
  return { skipped: false };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req, corsHeaders);
    if (!auth.ok) return auth.response!;
    const callerId = auth.userId!;

    const body = await req.json();
    const action = body?.action as "new_request" | "approved" | "declined";
    const requestId = body?.requestId as string;
    if (!action || !requestId || !["new_request", "approved", "declined"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Fetch the request + expert + auth.users email for the expert
    const { data: row, error: rowErr } = await admin
      .from("proposal_requests")
      .select("id, user_id, expert_id, founder_name, founder_email, founder_message, expert_response_note, selected_milestones, timeframe, budget_hint")
      .eq("id", requestId)
      .maybeSingle();
    if (rowErr || !row) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: expert } = await admin
      .from("experts")
      .select("id, user_id, name, title, booking_url")
      .eq("id", row.expert_id!)
      .maybeSingle();
    if (!expert) {
      return new Response(JSON.stringify({ error: "Expert not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: only the founder may trigger new_request; only the expert (owner) may trigger approved/declined
    if (action === "new_request" && row.user_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if ((action === "approved" || action === "declined") && expert.user_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Resolve target email
    let toEmail = "";
    let subject = "";
    let html = "";
    const founderName = row.founder_name || row.founder_email || "A founder";
    const milestonesList = (Array.isArray(row.selected_milestones) ? row.selected_milestones : []) as Array<{ title: string; category?: string }>;
    const msHtml = milestonesList.length
      ? `<ul>${milestonesList.map((m) => `<li>${escapeHtml(m.title)}${m.category ? ` <em>(${escapeHtml(m.category)})</em>` : ""}</li>`).join("")}</ul>`
      : "";

    if (action === "new_request") {
      // Email the expert
      const { data: expertUser } = await admin.auth.admin.getUserById(expert.user_id!);
      toEmail = expertUser?.user?.email || "";
      subject = `New consulting request from ${founderName}`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px">You have a new consulting request</h2>
          <p>${escapeHtml(founderName)} just asked you for help via EU Enterprise.</p>
          ${msHtml ? `<h3 style="margin-top:20px">Milestones they want help with</h3>${msHtml}` : ""}
          ${row.founder_message ? `<h3 style="margin-top:20px">What they're trying to solve</h3><p style="white-space:pre-wrap">${escapeHtml(row.founder_message)}</p>` : ""}
          ${row.timeframe ? `<p><strong>Timeframe:</strong> ${escapeHtml(row.timeframe)}</p>` : ""}
          ${row.budget_hint ? `<p><strong>Budget hint:</strong> ${escapeHtml(row.budget_hint)}</p>` : ""}
          <p style="margin-top:24px">
            <a href="${APP_URL}/expert-requests" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">
              Review and approve
            </a>
          </p>
          <p style="font-size:12px;color:#64748b;margin-top:24px">Sent by EU Enterprise.</p>
        </div>
      `;
    } else {
      // Email the founder
      toEmail = row.founder_email || "";
      if (!toEmail) {
        // Try to fetch the founder's email from auth.users
        const { data: founderUser } = await admin.auth.admin.getUserById(row.user_id);
        toEmail = founderUser?.user?.email || "";
      }
      if (action === "approved") {
        subject = `${expert.name} accepted your request`;
        html = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
            <h2 style="margin:0 0 12px">${escapeHtml(expert.name)} accepted your request</h2>
            <p>Good news — ${escapeHtml(expert.name)} is happy to help.</p>
            ${row.expert_response_note ? `<blockquote style="border-left:3px solid #2563eb;margin:16px 0;padding:8px 12px;color:#334155">${escapeHtml(row.expert_response_note)}</blockquote>` : ""}
            ${expert.booking_url ? `<p style="margin-top:20px"><a href="${expert.booking_url}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Book your session</a></p>` : ""}
            <p style="margin-top:20px"><a href="${APP_URL}/my-proposals">See it in your dashboard</a></p>
            <p style="font-size:12px;color:#64748b;margin-top:24px">Sent by EU Enterprise.</p>
          </div>
        `;
      } else {
        subject = `Update on your request to ${expert.name}`;
        html = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
            <h2 style="margin:0 0 12px">${escapeHtml(expert.name)} can't take this on right now</h2>
            <p>${escapeHtml(expert.name)} reviewed your request but isn't able to help at this moment.</p>
            ${row.expert_response_note ? `<blockquote style="border-left:3px solid #94a3b8;margin:16px 0;padding:8px 12px;color:#334155">${escapeHtml(row.expert_response_note)}</blockquote>` : ""}
            <p style="margin-top:20px">You can browse other experts on EU Enterprise.</p>
            <p style="margin-top:12px"><a href="${APP_URL}/team" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">Find another expert</a></p>
            <p style="font-size:12px;color:#64748b;margin-top:24px">Sent by EU Enterprise.</p>
          </div>
        `;
      }
    }

    if (!toEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: "no_recipient_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail(toEmail, subject, html);
    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
