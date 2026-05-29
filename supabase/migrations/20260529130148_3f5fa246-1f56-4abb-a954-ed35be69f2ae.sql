
-- Experts can view & update proposal_requests for their engaged founders
CREATE POLICY "Experts read engaged founder proposals"
ON public.proposal_requests FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engagements e
    WHERE e.expert_id = auth.uid()
      AND (e.founder_id::text = proposal_requests.user_id OR e.proposal_id = proposal_requests.id)
  )
);

CREATE POLICY "Experts update engaged founder proposals"
ON public.proposal_requests FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engagements e
    WHERE e.expert_id = auth.uid()
      AND (e.founder_id::text = proposal_requests.user_id OR e.proposal_id = proposal_requests.id)
  )
);

-- Experts can read engaged founders' user_data (to review needs)
CREATE POLICY "Experts read engaged founder data"
ON public.user_data FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engagements e
    WHERE e.expert_id = auth.uid()
      AND e.founder_id::text = user_data.user_id
  )
);

-- Experts can read engaged founders' basic profile
CREATE POLICY "Experts read engaged founder profile"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engagements e
    WHERE e.expert_id = auth.uid()
      AND e.founder_id = profiles.id
  )
);
