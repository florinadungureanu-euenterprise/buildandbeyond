CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IN (
    '90cee2ce-d88e-417f-bfd7-d692d008b346'::uuid,
    '734591d1-ea79-41b4-ab50-8724e983d41c'::uuid
  )
$function$;