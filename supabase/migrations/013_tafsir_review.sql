-- 013_tafsir_review.sql
-- Human review workflow for the AI-written "Reflection" rows in tafsir
-- (scholar = 'Reflection'). Until now those rows have been labelled
-- "Reflection — pending scholarly review" on web and in the app. This
-- migration records a real human review decision per row so the label can
-- drop the "pending" qualifier only for rows a reviewer actually approved.
--
-- NOT run automatically. Shakeel runs this in the Supabase SQL editor.
-- Until it runs, production tafsir has NO review_status column: all display
-- code treats a missing/undefined review_status as 'pending', and the admin
-- API falls back to the pre-migration query (see app/api/admin/reflections).
--
-- Existing rows default to 'pending', so nothing changes label until a
-- reviewer approves it through /admin/reflections.

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'needs_edit'));

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS reviewed_by text;

ALTER TABLE tafsir
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
