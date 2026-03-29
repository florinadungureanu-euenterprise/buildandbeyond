
-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = '90cee2ce-d88e-417f-bfd7-d692d008b346'::uuid
$$;

-- Allow admin to read all partner submissions
CREATE POLICY "Admin can read all partner submissions"
ON public.partner_submissions
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Allow admin to read all profiles
CREATE POLICY "Admin can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());
