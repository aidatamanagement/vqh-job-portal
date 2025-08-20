-- Create delayed_emails table for scheduling delayed email sending
CREATE TABLE IF NOT EXISTS delayed_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_slug TEXT NOT NULL REFERENCES email_templates(slug),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables_used JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'sent', 'failed', 'cancelled')),
  application_id UUID REFERENCES job_applications(id),
  status_type TEXT,
  brevo_message_id TEXT,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying of scheduled emails
CREATE INDEX IF NOT EXISTS idx_delayed_emails_status_scheduled_for ON delayed_emails(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_delayed_emails_application_id ON delayed_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_delayed_emails_recipient_email ON delayed_emails(recipient_email);

-- Add RLS policies for delayed_emails table
ALTER TABLE delayed_emails ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all delayed emails
CREATE POLICY "Admins can view all delayed emails" ON delayed_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to insert delayed emails
CREATE POLICY "Admins can insert delayed emails" ON delayed_emails
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update delayed emails
CREATE POLICY "Admins can update delayed emails" ON delayed_emails
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow service role to manage delayed emails (for Edge Functions)
CREATE POLICY "Service role can manage delayed emails" ON delayed_emails
  FOR ALL USING (auth.role() = 'service_role');

-- Add delayed_email_id column to email_logs for tracking
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS delayed_email_id UUID REFERENCES delayed_emails(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_delayed_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_delayed_emails_updated_at
  BEFORE UPDATE ON delayed_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_delayed_emails_updated_at();
