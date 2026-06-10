
-- event_submissions: require non-empty required fields
DROP POLICY IF EXISTS "Anyone can insert event submissions" ON public.event_submissions;
CREATE POLICY "Anyone can insert event submissions" ON public.event_submissions
  FOR INSERT
  WITH CHECK (
    title IS NOT NULL AND length(title) BETWEEN 1 AND 300
    AND location IS NOT NULL AND length(location) BETWEEN 1 AND 300
    AND submitted_by IS NOT NULL AND length(submitted_by) BETWEEN 1 AND 300
    AND event_date IS NOT NULL
  );

-- connector_waitlist: require a plausible email and connector name
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.connector_waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.connector_waitlist
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL AND length(email) BETWEEN 4 AND 320 AND position('@' in email) > 1
    AND connector_name IS NOT NULL AND length(connector_name) BETWEEN 1 AND 200
  );

-- scraped_tools: restrict admin-style ALL policy to service_role
DROP POLICY IF EXISTS "Service role can manage tools" ON public.scraped_tools;
CREATE POLICY "Service role can manage tools" ON public.scraped_tools
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
