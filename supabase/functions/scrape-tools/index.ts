import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOOL_SEARCH_QUERIES = [
  'best AI tools for startups 2025 2026',
  'AI productivity tools for entrepreneurs',
  'startup automation tools SaaS',
  'AI marketing tools for small business',
  'AI sales tools startup',
  'AI design tools for founders',
  'AI analytics tools business intelligence',
  'AI customer support tools startup',
  'AI coding development tools',
  'AI finance accounting tools startup',
  'AI HR recruiting tools',
  'AI legal compliance tools startup',
  'no-code low-code tools for startups',
  'AI writing content creation tools',
  'AI project management tools',
];

const CATEGORY_MAP: Record<string, string> = {
  'marketing': 'Marketing',
  'sales': 'Sales',
  'design': 'Design',
  'analytics': 'Analytics',
  'customer': 'Customer Support',
  'support': 'Customer Support',
  'coding': 'Development',
  'development': 'Development',
  'dev': 'Development',
  'finance': 'Finance',
  'accounting': 'Finance',
  'hr': 'HR & Recruiting',
  'recruiting': 'HR & Recruiting',
  'legal': 'Legal & Compliance',
  'compliance': 'Legal & Compliance',
  'writing': 'Content Creation',
  'content': 'Content Creation',
  'project': 'Project Management',
  'management': 'Project Management',
  'automation': 'Automation',
  'no-code': 'No-Code / Low-Code',
  'low-code': 'No-Code / Low-Code',
  'productivity': 'Productivity',
  'data': 'Data & Research',
  'research': 'Data & Research',
};

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'General';
}

interface ParsedTool {
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing: string;
  cost_savings: string;
  time_savings: string;
  efficiency_gain: string;
  url: string;
  source: string;
}

function parseToolsFromSearchResults(results: any[], queryContext: string): ParsedTool[] {
  const tools: ParsedTool[] = [];

  for (const result of results) {
    if (!result.title || !result.url) continue;

    // Skip aggregator/list pages themselves
    const skipDomains = ['google.com', 'youtube.com', 'reddit.com', 'twitter.com', 'facebook.com'];
    if (skipDomains.some(d => result.url.includes(d))) continue;

    const name = result.title
      .replace(/\s*[-|:].*/g, '')
      .replace(/\s*\(.*\)/, '')
      .trim()
      .substring(0, 60);

    if (name.length < 2 || name.split(' ').length > 5) continue;

    const category = inferCategory(queryContext + ' ' + (result.description || ''));

    tools.push({
      name,
      category,
      description: (result.description || `${name} - AI-powered tool for startups`).substring(0, 300),
      features: [],
      pricing: '',
      cost_savings: '',
      time_savings: '',
      efficiency_gain: '',
      url: result.url,
      source: 'firecrawl-search',
    });
  }

  return tools;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional body for selective queries
    let queriesToRun = TOOL_SEARCH_QUERIES;
    try {
      const body = await req.json();
      if (body?.queries && Array.isArray(body.queries)) {
        queriesToRun = body.queries;
      }
    } catch {
      // No body, use defaults
    }

    let totalInserted = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Process queries sequentially to avoid rate limits
    for (const query of queriesToRun) {
      try {
        console.log(`Searching: ${query}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: 10,
          }),
        });

        if (!searchResponse.ok) {
          const errData = await searchResponse.json();
          errors.push(`Search "${query}" failed: ${errData.error || searchResponse.status}`);
          continue;
        }

        const searchData = await searchResponse.json();
        const results = searchData.data || [];
        const parsedTools = parseToolsFromSearchResults(results, query);

        for (const tool of parsedTools) {
          const { error } = await supabase.from('scraped_tools').upsert(
            {
              name: tool.name,
              category: tool.category,
              description: tool.description,
              features: tool.features,
              pricing: tool.pricing,
              cost_savings: tool.cost_savings,
              time_savings: tool.time_savings,
              efficiency_gain: tool.efficiency_gain,
              url: tool.url,
              source: tool.source,
              scraped_at: new Date().toISOString(),
            },
            { onConflict: 'name,url', ignoreDuplicates: true }
          );

          if (error) {
            totalSkipped++;
          } else {
            totalInserted++;
          }
        }

        // Small delay between queries to be respectful
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        errors.push(`Query "${query}" error: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    console.log(`Scrape complete: ${totalInserted} inserted, ${totalSkipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: totalInserted,
        skipped: totalSkipped,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape tools error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
