import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if (!auth.ok) return auth.response!;

  try {
    const { formData } = await req.json();
    const userId = auth.userId!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase env vars not configured');

    console.log('Mapping intake form for user:', userId);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: experts, error: expertsError } = await supabaseAdmin
      .from('experts')
      .select('id, name, title, scaleit_buckets, expertise_keywords, services, stakeholder_types')
      .eq('is_active', true);

    if (expertsError) console.error('Failed to fetch experts:', expertsError);

    const expertsContext = experts?.length
      ? `\n\nAVAILABLE EXPERTS FOR ROUTING:\n${JSON.stringify(experts, null, 2)}`
      : '';

    const formSummary = `
INTAKE FORM DATA:
- Name: ${formData.fullName}
- Company: ${formData.companyName}
- Industry: ${formData.industry}
- Stage: ${formData.currentStage}
- Location: ${formData.companyLocation}
- Stakeholder type: ${formData.stakeholder_type || 'founder'}
- Selected priorities: ${(formData.selected_priorities || []).join(', ') || 'N/A'}
- Venture: ${formData.ventureOneSentence}
- Why this idea: ${formData.whyThisIdea}
- Why now: ${formData.whyNow}
- Revenue model: ${formData.revenueModel}
- Market size: ${formData.marketSize}
- Competitors: ${formData.competitors}
- Unique insight: ${formData.uniqueInsight}
- Impact: ${formData.impact}
- 6-month deadline: ${formData.deadline}
- Who builds: ${formData.whoBuilds}
- Tech stack: ${formData.techStack}
- Has product: ${formData.hasProduct}
- Traction: ${formData.traction}
- Proof points: ${formData.proofPoints}
- Fundraising status: ${formData.fundraisingStatus}
- Raise amount: ${formData.raiseAmount}
- Funding types: ${(formData.fundingTypes || []).join(', ')}
- Funding use: ${formData.fundingUse}
- Runway: ${formData.currentRunway}
- Build priorities: ${(formData.buildPriorities || []).join(', ')}
- GTM priorities: ${(formData.gtmPriorities || []).join(', ')}
- Biggest blockers: ${formData.biggestBlockers}
- Desired outcome: ${formData.desiredOutcome}
- Strategic questions: ${formData.strategicQuestions}
`;

    const systemPrompt = `You are a startup advisor AI for Scaleit, a consulting collective of four experts. Given an intake form, generate structured platform data: passport, signals, applications, milestones, and expert recommendations.

Be specific and grounded in the actual data provided. Do not hallucinate.

EXPERT ROUTING INSTRUCTIONS:
- Review selected_priorities, stage, biggest blockers, fundraising status, and stakeholder_type
- Recommend 1–3 experts from the list who are the strongest match
- why_recommended: one sentence referencing something specific from THIS person's data
- match_score: 0–100 alignment with their top priorities
- booking_cta: short action phrase e.g. "Book a 30-min EU grant strategy call"${expertsContext}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: formSummary + '\n\nGenerate the platform data.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_platform_data',
            description: 'Generate structured platform data from intake form',
            parameters: {
              type: 'object',
              properties: {
                passport: {
                  type: 'object',
                  properties: {
                    startupName: { type: 'string' },
                    tagline: { type: 'string' },
                    summary: { type: 'string' },
                    validationSummary: { type: 'string' },
                    competitorSnapshot: { type: 'array', items: { type: 'string' } },
                    marketData: { type: 'array', items: { type: 'string' } },
                    roadmapSnapshot: { type: 'string' },
                    industry: { type: 'string' },
                    trl: { type: 'number' },
                  },
                  required: ['startupName', 'tagline', 'summary', 'validationSummary', 'competitorSnapshot', 'marketData', 'roadmapSnapshot']
                },
                signals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['competitor', 'trend', 'regulatory', 'funding', 'opportunity'] },
                      title: { type: 'string' },
                      message: { type: 'string' },
                      suggestedAction: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                    required: ['type', 'title', 'message', 'suggestedAction', 'priority']
                  }
                },
                applications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['grant', 'accelerator', 'competition & hackathons'] },
                      description: { type: 'string' },
                      benefits: { type: 'array', items: { type: 'string' } },
                      eligibility: { type: 'array', items: { type: 'string' } },
                      matchScore: { type: 'number' },
                    },
                    required: ['name', 'type', 'description', 'benefits', 'matchScore']
                  }
                },
                milestones: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      targetDate: { type: 'string' },
                      category: { type: 'string', enum: ['product', 'market', 'team', 'funding'] },
                    },
                    required: ['title', 'description', 'targetDate', 'category']
                  }
                },
                expert_recommendations: {
                  type: 'array',
                  description: '1-3 expert recommendations ranked by match score',
                  items: {
                    type: 'object',
                    properties: {
                      expert_name: { type: 'string' },
                      expert_id: { type: 'string', description: 'UUID from the experts list' },
                      service_area: { type: 'string' },
                      scaleit_bucket: { type: 'string' },
                      why_recommended: { type: 'string', description: 'One sentence specific to this person' },
                      booking_cta: { type: 'string' },
                      match_score: { type: 'number' },
                    },
                    required: ['expert_name', 'expert_id', 'service_area', 'scaleit_bucket', 'why_recommended', 'booking_cta', 'match_score']
                  }
                },
              },
              required: ['passport', 'signals', 'applications', 'milestones', 'expert_recommendations']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_platform_data' } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service unavailable');
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error('No structured output from AI');

    const platformData = JSON.parse(toolCall.function.arguments);
    console.log('Generated platform data:', JSON.stringify(platformData).slice(0, 500));

    if (userId && platformData.expert_recommendations?.length) {
      const { data: existing } = await supabaseAdmin.from('user_data').select('applications').eq('user_id', userId).single();
      const currentApps = (existing?.applications as Record<string, unknown>) || {};
      const { error: updateError } = await supabaseAdmin.from('user_data').update({
        applications: { ...currentApps, expert_recommendations: platformData.expert_recommendations },
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      if (updateError) console.error('Failed to persist expert_recommendations:', updateError);
    }

    return new Response(JSON.stringify({ success: true, ...platformData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Map intake form error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
