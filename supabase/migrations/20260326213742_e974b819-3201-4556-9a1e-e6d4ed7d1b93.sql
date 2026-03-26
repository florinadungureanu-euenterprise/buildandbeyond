
CREATE TABLE public.scraped_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  description text,
  features text[] DEFAULT '{}',
  pricing text,
  cost_savings text,
  time_savings text,
  efficiency_gain text,
  relevant_stages text[] DEFAULT '{}',
  use_cases text[] DEFAULT '{}',
  url text,
  source text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, url)
);

ALTER TABLE public.scraped_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read tools" ON public.scraped_tools
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage tools" ON public.scraped_tools
  FOR ALL TO service_role USING (true) WITH CHECK (true);
