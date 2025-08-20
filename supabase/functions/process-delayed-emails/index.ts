import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('🕐 Processing delayed emails at:', new Date().toISOString());

    // Get all scheduled emails that are due to be sent
    const now = new Date().toISOString();
    const { data: delayedEmails, error: fetchError } = await supabaseClient
      .from('delayed_emails')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('❌ Error fetching delayed emails:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch delayed emails', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!delayedEmails || delayedEmails.length === 0) {
      console.log('✅ No delayed emails to process');
      return new Response(
        JSON.stringify({ success: true, message: 'No delayed emails to process', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Found ${delayedEmails.length} delayed emails to process`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const delayedEmail of delayedEmails) {
      try {
        console.log(`🔄 Processing email ID: ${delayedEmail.id} for ${delayedEmail.recipient_email}`);
        
        // Update status to processing
        await supabaseClient
          .from('delayed_emails')
          .update({ status: 'processing' })
          .eq('id', delayedEmail.id);

        // Prepare Brevo email data
        const emailData: BrevoEmailData = {
          sender: {
            name: "ViaQuest Hospice Careers",
            email: "careers@viaquesthospice.com"
          },
          to: [{ email: delayedEmail.recipient_email }],
          subject: delayedEmail.subject,
          htmlContent: delayedEmail.html_content
        };

        console.log(`📤 Sending delayed email via Brevo to: ${delayedEmail.recipient_email}`);

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
        
        if (brevoResponse.ok) {
          // Update status to sent
          await supabaseClient
            .from('delayed_emails')
            .update({
              status: 'sent',
              brevo_message_id: brevoResult.messageId,
              sent_at: new Date().toISOString()
            })
            .eq('id', delayedEmail.id);

          // Log in email_logs table
          await supabaseClient
            .from('email_logs')
            .insert({
              recipient_email: delayedEmail.recipient_email,
              template_slug: delayedEmail.template_slug,
              subject: delayedEmail.subject,
              variables_used: delayedEmail.variables_used,
              status: 'sent',
              brevo_message_id: brevoResult.messageId,
              sent_at: new Date().toISOString(),
              delayed_email_id: delayedEmail.id
            });

          console.log(`✅ Delayed email sent successfully: ${brevoResult.messageId}`);
          results.push({
            id: delayedEmail.id,
            status: 'sent',
            messageId: brevoResult.messageId,
            recipient: delayedEmail.recipient_email
          });
          successCount++;
        } else {
          throw new Error(`Brevo API error (${brevoResponse.status}): ${brevoResult.message || JSON.stringify(brevoResult)}`);
        }
      } catch (error) {
        console.error(`❌ Failed to send delayed email ${delayedEmail.id}:`, error);
        
        // Update status to failed
        await supabaseClient
          .from('delayed_emails')
          .update({
            status: 'failed',
            error_message: String(error)
          })
          .eq('id', delayedEmail.id);

        results.push({
          id: delayedEmail.id,
          status: 'failed',
          error: String(error),
          recipient: delayedEmail.recipient_email
        });
        failureCount++;
      }
    }

    console.log(`🎉 Delayed email processing completed: ${successCount} sent, ${failureCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        sent: successCount,
        failed: failureCount,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in process-delayed-emails function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
