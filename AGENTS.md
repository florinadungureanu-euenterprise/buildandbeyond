# Project conventions
- Keep the curated event catalogue shared between the public landing section and in-app Events page, with timing and filtering in a pure helper so both surfaces classify events consistently.
- Event filter changes are presentation-only; preserve existing event submission fields and storage workflows.
- Catalogue imports use optional dates and formats with explicit pending labels when sources are uncertain; never invent exact dates or copy private outreach strategy into public listings.
- Images the app displays are imported from `src/assets` rather than externalized to CDN asset pointers, because the preview dev server answers `/__l5e/...` URLs with the app shell and such images render blank in the preview.