
-- User data table: stores all app state as JSONB (prototype-friendly)
CREATE TABLE public.user_data (
  user_id TEXT PRIMARY KEY,
  passport JSONB DEFAULT '{}'::jsonb,
  user_inputs JSONB DEFAULT '{}'::jsonb,
  validation JSONB DEFAULT '{}'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  applications JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  funding_data JSONB DEFAULT '{}'::jsonb,
  tool_activation_count INTEGER DEFAULT 0,
  subscribed_tools TEXT[] DEFAULT '{}',
  applied_applications TEXT[] DEFAULT '{}',
  applied_funding_routes TEXT[] DEFAULT '{}',
  onboarding_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded documents table
CREATE TABLE public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS - prototype with no auth, uses localStorage user IDs
-- Enable public access
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (no auth in this prototype)
CREATE POLICY "Allow all for user_data" ON public.user_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for uploaded_documents" ON public.uploaded_documents FOR ALL USING (true) WITH CHECK (true);
