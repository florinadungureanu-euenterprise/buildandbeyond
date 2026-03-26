import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Helper: call Firecrawl search
async function firecrawlSearch(query: string, limit = 5): Promise<any[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.warn('FIRECRAWL_API_KEY not set, skipping web search');
    return [];
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return [];
  }
}

// Helper: call Firecrawl scrape
async function firecrawlScrape(url: string): Promise<string> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) return '';

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.data?.markdown || data.markdown || '';
  } catch {
    return '';
  }
}

// Helper: call Lovable AI for analysis
async function analyzeWithAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

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
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limited. Please try again shortly.');
    if (response.status === 402) throw new Error('AI credits exhausted.');
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Helper: structured extraction via tool calling
async function extractStructured(systemPrompt: string, userPrompt: string, toolDef: any): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

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
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'function', function: toolDef }],
      tool_choice: { type: 'function', function: { name: toolDef.name } },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limited. Please try again shortly.');
    if (response.status === 402) throw new Error('AI credits exhausted.');
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, profile, userId } = await req.json();

    console.log('Research agent action:', action, 'for user:', userId);

    // ACTION: research-market — Searches the web for market signals based on user profile
    if (action === 'research-market') {
      const { industry, region, solution, customer } = profile || {};
      if (!industry) {
        return new Response(JSON.stringify({ error: 'Industry is required in profile' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Step 1: Search for market signals
      const queries = [
        `${industry} startup trends ${new Date().getFullYear()} market growth`,
        `${industry} ${region || ''} competitor landscape funding`,
        `${industry} regulatory changes compliance ${region || 'EU'}`,
      ];

      const searchResults = await Promise.all(queries.map(q => firecrawlSearch(q, 3)));
      const allResults = searchResults.flat();

      // Step 2: Analyze with AI to extract structured signals
      const signalsTool = {
        name: 'extract_signals',
        description: 'Extract market signals from research data',
        parameters: {
          type: 'object',
          properties: {
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
                  source: { type: 'string' },
                },
                required: ['type', 'title', 'message', 'suggestedAction', 'priority'],
              },
            },
          },
          required: ['signals'],
        },
      };

      const researchContext = allResults.map(r =>
        `Source: ${r.url || 'unknown'}\nTitle: ${r.title || ''}\n${(r.markdown || r.description || '').slice(0, 500)}`
      ).join('\n---\n');

      const extracted = await extractStructured(
        `You are a startup market analyst. Extract actionable market signals from web research data for a ${industry} startup${region ? ` in ${region}` : ''}${solution ? ` building "${solution}"` : ''}.`,
        `Research data:\n${researchContext}\n\nExtract 3-6 real, specific market signals with actionable insights.`,
        signalsTool,
      );

      return new Response(JSON.stringify({
        success: true,
        signals: extracted?.signals || [],
        sourcesCount: allResults.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ACTION: enrich-passport — Enriches the startup passport with web research
    if (action === 'enrich-passport') {
      const { industry, solution, customer, companyName, linkedinUrl } = profile || {};

      // Scrape LinkedIn if provided
      let linkedinContent = '';
      if (linkedinUrl) {
        linkedinContent = await firecrawlScrape(linkedinUrl);
      }

      // Search for company/solution context
      const searchQuery = companyName
        ? `${companyName} ${industry || ''} startup`
        : `${solution || ''} ${industry || ''} market`;
      const searchResults = await firecrawlSearch(searchQuery, 3);

      const passportTool = {
        name: 'build_passport',
        description: 'Build enriched startup passport from research',
        parameters: {
          type: 'object',
          properties: {
            marketSize: { type: 'string' },
            competitorCount: { type: 'number' },
            topCompetitors: { type: 'array', items: { type: 'string' } },
            marketGrowthRate: { type: 'string' },
            fundingLandscape: { type: 'string' },
            regulatoryNotes: { type: 'string' },
            suggestedPositioning: { type: 'string' },
            keyInsights: { type: 'array', items: { type: 'string' } },
          },
          required: ['marketSize', 'competitorCount', 'topCompetitors', 'keyInsights'],
        },
      };

      const context = [
        linkedinContent ? `LinkedIn Profile:\n${linkedinContent.slice(0, 1000)}` : '',
        ...searchResults.map(r => `Source: ${r.url}\n${(r.markdown || r.description || '').slice(0, 500)}`),
      ].filter(Boolean).join('\n---\n');

      const enriched = await extractStructured(
        `You are a startup analyst. Enrich this startup's passport with real market data.`,
        `Startup: ${companyName || 'Unknown'}\nIndustry: ${industry || 'Unknown'}\nSolution: ${solution || 'Unknown'}\nCustomer: ${customer || 'Unknown'}\n\nResearch:\n${context}`,
        passportTool,
      );

      return new Response(JSON.stringify({
        success: true,
        passport: enriched || {},
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ACTION: find-opportunities — Find relevant grants, accelerators, competitions
    if (action === 'find-opportunities') {
      const { industry, region, stage, fundraisingType } = profile || {};

      const queries = [
        `${industry || 'startup'} ${fundraisingType || 'grants accelerators'} ${region || 'Europe'} ${new Date().getFullYear()}`,
        `${industry || 'startup'} competitions hackathons ${region || ''} open applications`,
      ];

      const searchResults = await Promise.all(queries.map(q => firecrawlSearch(q, 5)));
      const allResults = searchResults.flat();

      const opportunitiesTool = {
        name: 'extract_opportunities',
        description: 'Extract funding opportunities from research',
        parameters: {
          type: 'object',
          properties: {
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['grant', 'accelerator', 'competition', 'vc', 'angel'] },
                  description: { type: 'string' },
                  benefits: { type: 'array', items: { type: 'string' } },
                  eligibility: { type: 'array', items: { type: 'string' } },
                  deadline: { type: 'string' },
                  matchScore: { type: 'number' },
                  url: { type: 'string' },
                },
                required: ['name', 'type', 'description', 'benefits'],
              },
            },
          },
          required: ['opportunities'],
        },
      };

      const context = allResults.map(r =>
        `Source: ${r.url || 'unknown'}\nTitle: ${r.title || ''}\n${(r.markdown || r.description || '').slice(0, 600)}`
      ).join('\n---\n');

      const extracted = await extractStructured(
        `You are a startup funding expert. Find real, current funding opportunities for a ${stage || 'early-stage'} ${industry || ''} startup in ${region || 'Europe'}.`,
        `Research data:\n${context}\n\nExtract real opportunities with accurate details. Include match scores (0-100) based on relevance.`,
        opportunitiesTool,
      );

      return new Response(JSON.stringify({
        success: true,
        opportunities: extracted?.opportunities || [],
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ACTION: scrape-profile — Scrape a founder/company profile URL
    if (action === 'scrape-profile') {
      const { url } = profile || {};
      if (!url) {
        return new Response(JSON.stringify({ error: 'URL is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const content = await firecrawlScrape(url);

      const profileTool = {
        name: 'extract_profile',
        description: 'Extract structured profile data from scraped content',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            company: { type: 'string' },
            industry: { type: 'string' },
            location: { type: 'string' },
            experience: { type: 'array', items: { type: 'string' } },
            skills: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
          },
          required: ['name', 'summary'],
        },
      };

      const extracted = await extractStructured(
        'Extract structured profile information from the following web page content.',
        content.slice(0, 3000),
        profileTool,
      );

      return new Response(JSON.stringify({
        success: true,
        profile: extracted || {},
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Research agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
