
-- Extend proposal_requests for the founder→expert request flow
ALTER TABLE public.proposal_requests
  ADD COLUMN IF NOT EXISTS expert_id uuid REFERENCES public.experts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS selected_milestones jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS founder_message text,
  ADD COLUMN IF NOT EXISTS timeframe text,
  ADD COLUMN IF NOT EXISTS budget_hint text,
  ADD COLUMN IF NOT EXISTS founder_email text,
  ADD COLUMN IF NOT EXISTS founder_name text,
  ADD COLUMN IF NOT EXISTS expert_response_note text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_proposal_requests_expert_id ON public.proposal_requests(expert_id);
CREATE INDEX IF NOT EXISTS idx_proposal_requests_user_id ON public.proposal_requests(user_id);

-- Allow the targeted expert to read requests addressed to them
DROP POLICY IF EXISTS "Targeted expert can read own requests" ON public.proposal_requests;
CREATE POLICY "Targeted expert can read own requests"
ON public.proposal_requests
FOR SELECT
TO authenticated
USING (
  expert_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.experts ex
    WHERE ex.id = proposal_requests.expert_id
      AND ex.user_id = auth.uid()
  )
);

-- Allow the targeted expert to update (approve/decline) requests addressed to them
DROP POLICY IF EXISTS "Targeted expert can update own requests" ON public.proposal_requests;
CREATE POLICY "Targeted expert can update own requests"
ON public.proposal_requests
FOR UPDATE
TO authenticated
USING (
  expert_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.experts ex
    WHERE ex.id = proposal_requests.expert_id
      AND ex.user_id = auth.uid()
  )
)
WITH CHECK (
  expert_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.experts ex
    WHERE ex.id = proposal_requests.expert_id
      AND ex.user_id = auth.uid()
  )
);
