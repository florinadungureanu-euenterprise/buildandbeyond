import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, context, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat guidance request:', { userMessage, context, userId });

    const systemPrompt = `You are the "Entrepreneur Whisperer" - an expert startup advisor helping founders build their ventures from idea to scale. 

Your role is to:
1. Provide strategic guidance, market insights, and actionable advice
2. Ask clarifying questions to gather essential information
3. Challenge assumptions constructively
4. Share relevant frameworks, best practices, and real-world examples
5. Help founders think critically about their business

Context about the founder's journey:
- Stage: ${context.stage || 'Unknown'}
- Current question: ${context.currentQuestion || 'Starting onboarding'}

When responding:
- Be conversational, encouraging, and practical
- Provide 2-3 sentences of strategic value or insight
- If appropriate, include a brief example or framework
- Keep responses concise but valuable
- Focus on helping them make better decisions

Do NOT just acknowledge their answer - add strategic value to every response.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const guidance = data.choices[0]?.message?.content || '';

    console.log('Generated guidance:', guidance);

    return new Response(JSON.stringify({ guidance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-guidance function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});