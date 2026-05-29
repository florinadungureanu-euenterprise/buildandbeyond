import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { proposal_request_id } = await req.json();
    if (!proposal_request_id) throw new Error("proposal_request_id required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: request, error: reqErr } = await admin
      .from("proposal_requests")
      .select("*")
      .eq("id", proposal_request_id)
      .single();
    if (reqErr || !request) throw new Error("proposal_request not found");

    const { data: userData } = await admin
      .from("user_data")
      .select("onboarding_profile, applications")
      .eq("user_id", request.user_id)
      .maybeSingle();

    const onboarding = userData?.onboarding_profile || {};
    const apps = (userData?.applications as Record<string, unknown>) || {};
    const expertRecs = (apps.expert_recommendations as unknown[]) || [];

    const summary = `
FOUNDER ONBOARDING:
${JSON.stringify(onboarding, null, 2)}

EXPERT RECOMMENDATIONS:
${JSON.stringify(expertRecs, null, 2)}

ORIGINAL REQUEST ANSWERS:
${JSON.stringify(request.onboarding_answers || {}, null, 2)}
`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a senior consulting strategist for Scaleit. Based on this founder's onboarding data, expert recommendations, and selected priorities, generate a structured consulting proposal.",
          },
          { role: "user", content: summary + "\n\nGenerate the proposal." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_proposal",
            description: "Generate a structured consulting proposal",
            parameters: {
              type: "object",
              properties: {
                executive_summary: { type: "string" },
                modules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      objective: { type: "string" },
                      deliverables: { type: "array", items: { type: "string" } },
                      timeline: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      assigned_expert_name: { type: "string" },
                    },
                    required: ["title", "objective", "deliverables", "timeline", "priority", "assigned_expert_name"],
                  },
                },
                total_timeline: { type: "string" },
                estimated_investment_range: { type: "string" },
                next_steps: { type: "array", items: { type: "string" } },
              },
              required: ["executive_summary", "modules", "total_timeline", "estimated_investment_range", "next_steps"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_proposal" } },
        temperature: 0.4,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiResp.text();
      console.error("AI error:", aiResp.status, txt);
      throw new Error("AI service unavailable");
    }

    const ai = await aiResp.json();
    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured proposal from AI");
    const proposal = JSON.parse(toolCall.function.arguments);

    const { error: updErr } = await admin
      .from("proposal_requests")
      .update({ generated_modules: proposal, status: "proposal_generated" })
      .eq("id", proposal_request_id);
    if (updErr) console.error("Update error:", updErr);

    return new Response(JSON.stringify({ success: true, proposal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-proposal error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
