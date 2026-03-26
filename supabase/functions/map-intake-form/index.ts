import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Mapping intake form for user:', userId);

    // Build a comprehensive prompt from the form data
    const formSummary = `
FOUNDER INTAKE FORM DATA:
- Name: ${formData.fullName}
- Company: ${formData.companyName}
- Industry: ${formData.industry}
- Stage: ${formData.currentStage}
- Location: ${formData.companyLocation}
- Website: ${formData.website || 'N/A'}
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
- Looking for co-founder: ${formData.lookingForCofounder} ${formData.cofounderRoles || ''}
- Tech stack: ${formData.techStack}
- Has product: ${formData.hasProduct}
- Traction: ${formData.traction}
- Proof points: ${formData.proofPoints}
- Fundraising status: ${formData.fundraisingStatus}
- Raise amount: ${formData.raiseAmount}
- Funding types: ${(formData.fundingTypes || []).join(', ')}
- Funding use: ${formData.fundingUse}
- Runway: ${formData.currentRunway}
- Ideal investor: ${formData.idealInvestor}
- Steps taken: ${formData.fundraisingStepsTaken}
- Investor feedback: ${formData.investorFeedback}
- Build priorities: ${(formData.buildPriorities || []).join(', ')}
- GTM priorities: ${(formData.gtmPriorities || []).join(', ')}
- Fundraising priorities: ${(formData.fundraisingPriorities || []).join(', ')}
- Team priorities: ${(formData.teamPriorities || []).join(', ')}
- Biggest blockers: ${formData.biggestBlockers}
- Desired outcome: ${formData.desiredOutcome}
- Introductions needed: ${(formData.introductions || []).join(', ')}
- Introduction details: ${formData.introductionDetails}
- Strategic questions: ${formData.strategicQuestions}
`;

    // Use tool calling to get structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a startup advisor AI. Given a founder's intake form data, generate structured platform data including a startup passport, personalized signals/recommendations, and matched opportunities. Be specific, actionable, and grounded in the actual data provided. Do not hallucinate information not present in the form.`
          },
          {
            role: 'user',
            content: formSummary + '\n\nGenerate the platform data for this founder.'
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_platform_data',
            description: 'Generate structured platform data from founder intake form',
            parameters: {
              type: 'object',
              properties: {
                passport: {
                  type: 'object',
                  properties: {
                    startupName: { type: 'string' },
                    tagline: { type: 'string' },
                    summary: { type: 'string', description: '2-3 sentence summary of the venture based on form data' },
                    validationSummary: { type: 'string', description: 'Assessment of validation status based on traction and proof points' },
                    competitorSnapshot: { type: 'array', items: { type: 'string' }, description: 'Key competitor insights' },
                    marketData: { type: 'array', items: { type: 'string' }, description: 'Market size, growth, and positioning data points' },
                    roadmapSnapshot: { type: 'string', description: '6-month roadmap summary based on priorities and deadlines' },
                    industry: { type: 'string' },
                    trl: { type: 'number', description: 'Technology Readiness Level 1-9 based on stage' },
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
                  },
                  description: '3-5 personalized signals/recommendations based on their priorities and blockers'
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
                  },
                  description: 'Relevant programs/grants matched to their stage, industry, and location'
                },
                milestones: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      targetDate: { type: 'string', description: 'ISO date string' },
                      category: { type: 'string', enum: ['product', 'market', 'team', 'funding'] },
                    },
                    required: ['title', 'description', 'targetDate', 'category']
                  },
                  description: '6-8 concrete milestones for the next 6-12 months based on their priorities and deadlines'
                },
              },
              required: ['passport', 'signals', 'applications', 'milestones']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_platform_data' } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error('No structured output from AI');
    }

    const platformData = JSON.parse(toolCall.function.arguments);
    console.log('Generated platform data:', JSON.stringify(platformData).slice(0, 500));

    return new Response(JSON.stringify({
      success: true,
      ...platformData,
    }), {
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
