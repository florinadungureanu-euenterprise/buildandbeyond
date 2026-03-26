import { supabase } from '@/integrations/supabase/client';

export interface ResearchProfile {
  industry?: string;
  region?: string;
  solution?: string;
  customer?: string;
  companyName?: string;
  linkedinUrl?: string;
  stage?: string;
  fundraisingType?: string;
  url?: string;
}

export interface MarketSignal {
  type: 'competitor' | 'trend' | 'regulatory' | 'funding' | 'opportunity';
  title: string;
  message: string;
  suggestedAction: string;
  priority: 'high' | 'medium' | 'low';
  source?: string;
}

export interface Opportunity {
  name: string;
  type: 'grant' | 'accelerator' | 'competition' | 'vc' | 'angel';
  description: string;
  benefits: string[];
  eligibility?: string[];
  deadline?: string;
  matchScore?: number;
  url?: string;
}

export interface PassportEnrichment {
  marketSize?: string;
  competitorCount?: number;
  topCompetitors?: string[];
  marketGrowthRate?: string;
  fundingLandscape?: string;
  regulatoryNotes?: string;
  suggestedPositioning?: string;
  keyInsights?: string[];
}

export const researchAgent = {
  async researchMarket(profile: ResearchProfile, userId: string): Promise<{
    success: boolean;
    signals?: MarketSignal[];
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('research-agent', {
      body: { action: 'research-market', profile, userId },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async enrichPassport(profile: ResearchProfile, userId: string): Promise<{
    success: boolean;
    passport?: PassportEnrichment;
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('research-agent', {
      body: { action: 'enrich-passport', profile, userId },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async findOpportunities(profile: ResearchProfile, userId: string): Promise<{
    success: boolean;
    opportunities?: Opportunity[];
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('research-agent', {
      body: { action: 'find-opportunities', profile, userId },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async scrapeProfile(url: string, userId: string): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('research-agent', {
      body: { action: 'scrape-profile', profile: { url }, userId },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },
};
