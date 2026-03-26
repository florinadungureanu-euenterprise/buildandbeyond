
CREATE TABLE public.event_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  location text NOT NULL,
  type text NOT NULL DEFAULT 'meetup',
  url text,
  organizer text,
  tags text[] DEFAULT '{}',
  submitted_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert event submissions" ON public.event_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can read own submissions" ON public.event_submissions FOR SELECT TO authenticated USING (submitted_by = (auth.uid())::text);

CREATE TABLE public.partner_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  website text,
  services_offered text,
  target_stages text,
  investment_range text,
  geographic_coverage text,
  pricing_model text,
  description text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert partner submissions" ON public.partner_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
