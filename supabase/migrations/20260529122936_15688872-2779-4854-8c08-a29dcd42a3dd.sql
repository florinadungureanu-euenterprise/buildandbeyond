
-- 7.1 proposal sent_at
ALTER TABLE public.proposal_requests ADD COLUMN IF NOT EXISTS sent_at timestamptz;

-- 8.1 engagements + engagement_updates
CREATE TABLE IF NOT EXISTS public.engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  proposal_id uuid REFERENCES public.proposal_requests(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  started_at timestamptz DEFAULT now(),
  scaleit_bucket text,
  current_milestone text,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagements TO authenticated;
GRANT ALL ON public.engagements TO service_role;

ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders see own engagements" ON public.engagements
  FOR SELECT TO authenticated USING (auth.uid() = founder_id);
CREATE POLICY "Experts see their engagements" ON public.engagements
  FOR SELECT TO authenticated USING (auth.uid() = expert_id);
CREATE POLICY "Admins manage engagements" ON public.engagements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.engagement_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid REFERENCES public.engagements(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_role text CHECK (author_role IN ('founder','expert','admin')),
  type text CHECK (type IN ('note','deliverable','milestone_completed','next_step')),
  content text NOT NULL,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement_updates TO authenticated;
GRANT ALL ON public.engagement_updates TO service_role;

ALTER TABLE public.engagement_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see engagement updates" ON public.engagement_updates
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.engagements e
      WHERE e.id = engagement_id
        AND (e.founder_id = auth.uid() OR e.expert_id = auth.uid())
    )
    OR public.is_admin()
  );
CREATE POLICY "Members insert engagement updates" ON public.engagement_updates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins manage engagement updates" ON public.engagement_updates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9.1 digest events + profiles.digest_frequency
CREATE TABLE IF NOT EXISTS public.digest_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}',
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.digest_events TO authenticated;
GRANT ALL ON public.digest_events TO service_role;

ALTER TABLE public.digest_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own digest events" ON public.digest_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own digest events" ON public.digest_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage digest events" ON public.digest_events
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS digest_frequency text DEFAULT 'weekly';

-- 10.1 webhook url on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS webhook_url text;

-- 10.2 connector waitlist
CREATE TABLE IF NOT EXISTS public.connector_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  connector_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.connector_waitlist TO authenticated;
GRANT INSERT ON public.connector_waitlist TO anon;
GRANT ALL ON public.connector_waitlist TO service_role;

ALTER TABLE public.connector_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON public.connector_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users see own waitlist signups" ON public.connector_waitlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage waitlist" ON public.connector_waitlist
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
