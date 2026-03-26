import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store';
import type { Tool } from '@/types';

export function useScrapedTools() {
  const staticTools = useStore((s) => s.tools);
  const [scrapedTools, setScrapedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('scraped_tools')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        const mapped: Tool[] = data.map((t: any) => ({
          id: `scraped-${t.id}`,
          name: t.name,
          category: t.category || 'General',
          description: t.description || '',
          features: t.features || [],
          pricing: t.pricing || '',
          metrics: {
            cost_savings: t.cost_savings || 'N/A',
            time_savings: t.time_savings || 'N/A',
            efficiency_gain: t.efficiency_gain || 'N/A',
          },
          relevant_stages: t.relevant_stages || [],
          use_cases: t.use_cases || [],
          url: t.url || undefined,
        }));
        setScrapedTools(mapped);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  // Merge: static tools first, then scraped (deduplicated by name)
  const seenNames = new Set(staticTools.map((t) => t.name.toLowerCase()));
  const unique = scrapedTools.filter((t) => !seenNames.has(t.name.toLowerCase()));
  const allTools = [...staticTools, ...unique];

  return { tools: allTools, loading };
}
