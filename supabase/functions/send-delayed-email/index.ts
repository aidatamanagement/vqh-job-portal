import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DelayedEmailRequest {
  templateSlug: string;
  recipientEmail: string;
  variables: Record<string, any>;
  scheduledFor: string; // ISO string
  applicationId?: string;
  status?: string;
}

interface BrevoEmailData {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for database access to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { templateSlug, recipientEmail, variables, scheduledFor, applicationId, status }: DelayedEmailRequest = await req.json();

    console.log('Processing delayed email request:', { 
      templateSlug, 
      recipientEmail, 
      scheduledFor, 
      applicationId, 
      status 
    });

    // Validate scheduled time
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return new Response(
        JSON.stringify({ error: 'Scheduled time must be in the future' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get email template from database
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(
        JSON.stringify({ error: 'Email template not found', details: templateError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Template found:', template.subject);

    // Replace template variables
    let subject = template.subject;
    let htmlContent = template.html_body;

    // Add backward compatibility for trackingUrl if trackingURL exists
    if (variables.trackingURL && !variables.trackingUrl) {
      variables.trackingUrl = variables.trackingURL;
    }
    if (variables.trackingUrl && !variables.trackingURL) {
      variables.trackingURL = variables.trackingUrl;
    }

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Prevent duplicate active schedules for same application
    if (applicationId) {
      const { data: existingActive, error: existingErr } = await supabaseClient
        .from('delayed_emails')
        .select('id, scheduled_for, status')
        .eq('application_id', applicationId)
        .in('status', ['scheduled', 'processing'])
        .limit(1)
        .maybeSingle();

      if (existingErr) {
        console.error('Error checking existing delayed emails:', existingErr);
      }

      if (existingActive) {
        return new Response(
          JSON.stringify({
            error: 'An active scheduled email already exists for this application',
            code: 'ALREADY_SCHEDULED',
            existing: existingActive
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Store delayed email in database
    const { data: delayedEmail, error: insertError } = await supabaseClient
      .from('delayed_emails')
      .insert({
        template_slug: templateSlug,
        recipient_email: recipientEmail,
        subject,
        html_content: htmlContent,
        variables_used: variables,
        scheduled_for: scheduledFor,
        status: 'scheduled',
        application_id: applicationId,
        status_type: status
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating delayed email record:', insertError);
      // Handle unique index violation gracefully
      const message = String(insertError?.message || '').toLowerCase();
      const isUniqueViolation = message.includes('duplicate key') || message.includes('unique') || insertError?.code === '23505';
      if (isUniqueViolation) {
        return new Response(
          JSON.stringify({
            error: 'An active scheduled email already exists for this application',
            code: 'ALREADY_SCHEDULED'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to schedule email', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Delayed email scheduled successfully:', delayedEmail.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        delayedEmailId: delayedEmail.id,
        scheduledFor: scheduledFor,
        message: 'Email scheduled successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-delayed-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
