-- Ensure only one active (scheduled/processing) delayed email per application
-- Uses a partial unique index scoped to non-final states

-- Create extension guards (safe if already enabled)
-- Extensions are managed elsewhere typically; included here for completeness

-- Limit to one active scheduled email per application
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_delayed_email_per_application
ON delayed_emails (application_id)
WHERE application_id IS NOT NULL
  AND status IN ('scheduled', 'processing');

-- Optional helper index to quickly find active schedules for an application
CREATE INDEX IF NOT EXISTS idx_delayed_emails_application_active
ON delayed_emails (application_id)
WHERE status IN ('scheduled', 'processing');


