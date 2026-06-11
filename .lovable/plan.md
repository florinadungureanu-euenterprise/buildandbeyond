## What changes

### 1. Expert card button
On every expert card (both public `/experts` and in-app `/team`):
- Rename "Tell us what you need" → **"Tell me what I can help you with"**
- Clicking it routes to `/request-expert/:expertId` (instead of opening a `mailto:`)

### 2. New page `/request-expert/:expertId` (in Layout, protected)
Flow when the founder lands:
- If not signed in → redirect to `/login?next=/request-expert/:expertId`
- If signed in but no roadmap items detected (passport empty / onboarding not completed) → redirect to `/onboarding?return=/request-expert/:expertId`
- Otherwise show the request form:
  - Header: expert avatar/name/title + their Scaleit buckets
  - Section A: **"Pick the milestones you want help with"** — checkboxes of the founder's roadmap milestones (pulled from `passport.roadmap` / 12-month roadmap state)
  - Section B: **"What you're trying to solve"** — free-text textarea (min 20 chars)
  - Optional: timeframe ("ASAP / next month / exploring") and budget hint
  - Submit → inserts a row into `proposal_requests` with status `pending_expert_approval` and the selected milestones + message

### 3. New backend pieces

**Migration: extend `proposal_requests`** (additive, non-breaking)
- `expert_id` (uuid, references `experts(id)`) — which expert the founder is asking
- `selected_milestones` (jsonb) — array of `{ id, title, month }` snapshots
- `founder_message` (text)
- Status flow uses the existing `status` column: `pending_expert_approval` → `approved` → `declined` / `accepted_by_founder`
- RLS policies: founder can read/insert their own; expert can read/update rows where `expert_id` matches their `experts.id`

**Edge Function: `notify-expert-request`**
- Triggered after insert (called from the client right after the insert succeeds)
- Sends email to the expert ("New consulting request from {founder}") with a deep link to `/expert-requests`
- Uses the existing email infrastructure (`send-transactional-email` template `expert-new-request`)

**Edge Function: `notify-founder-proposal-approved`**
- Called when the expert clicks Approve
- Sends email to the founder ("{Expert} accepted your request") with a deep link to `/my-proposals`
- Template `expert-proposal-approved`

### 4. Expert-side approval UI
New page `/expert-requests` (in sidebar for approved experts only):
- Lists all incoming `proposal_requests` for that expert
- Each row: founder name, selected milestones, message, submitted date
- Actions: **Approve & send** (status → `approved`, calls `notify-founder-proposal-approved`) or **Decline** (status → `declined`, optional note)

### 5. Founder-side visibility
- **Dashboard widget**: new "Your expert requests" card showing the most recent 3 with status badges (Pending review / Approved / Declined). Link to `/my-proposals`.
- **MyProposalsPage**: extend with the new requests + status; "Approved" rows show a CTA "Book a session" using the expert's `booking_url`.

## Files touched

- `src/pages/ExpertsPage.tsx` — button label + routing
- `src/pages/RequestExpertPage.tsx` — new
- `src/pages/ExpertRequestsPage.tsx` — new (expert inbox)
- `src/pages/MyProposalsPage.tsx` — show new request rows
- `src/pages/DashboardPage.tsx` — add widget
- `src/components/SidebarNav.tsx` — add "Expert Requests" entry for approved experts
- `src/App.tsx` — register `/request-expert/:expertId` and `/expert-requests`
- `supabase/migrations/...` — extend `proposal_requests`
- `supabase/functions/notify-expert-request/index.ts` — new
- `supabase/functions/notify-founder-proposal-approved/index.ts` — new
- Two new email templates under `_shared/transactional-email-templates/`

## Out of scope (flag, don't build)

- Payment/escrow for the engagement (manual booking via `booking_url` for now)
- Real-time chat between founder and expert (proposal lives in DB; emails carry the back-and-forth)
- AI-generated scope of work (the existing `generate-proposal` function isn't wired here; can be added later as an expert helper)
