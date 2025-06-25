
-- Remove the unused 'application_approved' email template
DELETE FROM email_templates WHERE slug = 'application_approved';
