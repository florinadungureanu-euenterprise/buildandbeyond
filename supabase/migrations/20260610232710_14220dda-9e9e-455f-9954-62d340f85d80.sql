
-- 1. app_role enum + user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Seed existing hardcoded admins into user_roles
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('90cee2ce-d88e-417f-bfd7-d692d008b346'::uuid, 'admin'),
  ('734591d1-ea79-41b4-ab50-8724e983d41c'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Replace is_admin() to use has_role (no hardcoded UUIDs)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 5. Lock down handle_new_user (trigger-only, no caller execute)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 6. Tighten engagement_updates INSERT policy
DROP POLICY IF EXISTS "Members insert engagement updates" ON public.engagement_updates;
CREATE POLICY "Members insert engagement updates" ON public.engagement_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.engagements e
      WHERE e.id = engagement_updates.engagement_id
        AND (e.founder_id = auth.uid() OR e.expert_id = auth.uid())
    )
  );

-- 7. Add scoped UPDATE policy for digest_events (mark consumed_at)
DROP POLICY IF EXISTS "Users update own digest events" ON public.digest_events;
CREATE POLICY "Users update own digest events" ON public.digest_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Replace permissive WITH CHECK (true) on partner_submissions with explicit field validation
DROP POLICY IF EXISTS "Anyone can insert partner submissions" ON public.partner_submissions;
CREATE POLICY "Anyone can insert partner submissions" ON public.partner_submissions
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND length(email) > 3
    AND length(email) < 320
    AND contact_name IS NOT NULL
    AND length(contact_name) > 0
    AND length(contact_name) < 200
  );
