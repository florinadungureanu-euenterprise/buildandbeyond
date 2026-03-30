
CREATE TABLE public.proposal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  onboarding_answers jsonb DEFAULT '{}'::jsonb,
  generated_modules jsonb DEFAULT NULL,
  status text NOT NULL DEFAULT 'new',
  notes text DEFAULT NULL
);

ALTER TABLE public.proposal_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own request
CREATE POLICY "Users can insert own proposal request"
  ON public.proposal_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

-- Users can read their own requests
CREATE POLICY "Users can read own proposal requests"
  ON public.proposal_requests FOR SELECT
  TO authenticated
  USING (user_id = (auth.uid())::text);

-- Admin can read all
CREATE POLICY "Admin can read all proposal requests"
  ON public.proposal_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin can update all
CREATE POLICY "Admin can update all proposal requests"
  ON public.proposal_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin());
