
ALTER TABLE public.experts
  ADD COLUMN IF NOT EXISTS notable_projects text,
  ADD COLUMN IF NOT EXISTS achievements text,
  ADD COLUMN IF NOT EXISTS companies text,
  ADD COLUMN IF NOT EXISTS what_makes_you_happy text;
