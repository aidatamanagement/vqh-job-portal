
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  templateSlug: string;
  recipientEmail: string;
  variables: Record<string, any>;
  adminEmails?: string[];
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

    const { templateSlug, recipientEmail, variables, adminEmails }: EmailRequest = await req.json();

    console.log('Processing email request:', { templateSlug, recipientEmail, variables, adminEmails });

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

    // Replace template variables - ensure backward compatibility for trackingUrl/trackingURL
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

    // Use the recipient email provided in the request
    const recipients = [{ email: recipientEmail }];

    // Prepare Brevo email data
    const emailData: BrevoEmailData = {
      sender: {
        name: "ViaQuest Hospice Careers",
        email: "careers@viaquesthospice.com"
      },
      to: recipients,
      subject,
      htmlContent
    };

    console.log('Sending email via Brevo to:', recipients.map(r => r.email).join(', '));
    console.log('Email subject:', subject);

    // Log email attempt
    const { data: logData, error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        template_slug: templateSlug,
        subject,
        variables_used: variables,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating email log:', logError);
    }

    try {
      // Send email via Brevo
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': Deno.env.get('BREVO_API_KEY') || ''
        },
        body: JSON.stringify(emailData)
      });

      const brevoResult = await brevoResponse.json();
      
      console.log('Brevo API response status:', brevoResponse.status);
      console.log('Brevo API response:', brevoResult);
      
      if (brevoResponse.ok) {
        // Update log with success
        if (logData) {
          await supabaseClient
            .from('email_logs')
            .update({
              status: 'sent',
              brevo_message_id: brevoResult.messageId,
              sent_at: new Date().toISOString()
            })
            .eq('id', logData.id);
        }

        console.log('Email sent successfully:', brevoResult);

        return new Response(
          JSON.stringify({ success: true, messageId: brevoResult.messageId }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(`Brevo API error (${brevoResponse.status}): ${brevoResult.message || JSON.stringify(brevoResult)}`);
      }
    } catch (sendError) {
      console.error('Failed to send email:', sendError);
      
      // Update log with error
      if (logData) {
        await supabaseClient
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: String(sendError)
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: String(sendError) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
