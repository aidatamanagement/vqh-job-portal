
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendlyWebhookEvent {
  created_at: string;
  created_by: string;
  event: string;
  payload: {
    event: {
      uri: string;
      name: string;
      meeting_url: string;
      status: string;
      start_time: string;
      end_time: string;
      event_type: {
        uri: string;
        name: string;
      };
      event_memberships: Array<{
        user: {
          name: string;
          email: string;
        };
      }>;
      event_guests: Array<{
        email: string;
        name: string;
      }>;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: CalendlyWebhookEvent = await req.json();
    console.log('Received Calendly webhook:', webhookData);

    const { event, payload } = webhookData;
    const calendlyEvent = payload.event;

    // Extract candidate email from event guests
    const candidateEmail = calendlyEvent.event_guests.length > 0 
      ? calendlyEvent.event_guests[0].email 
      : '';

    // Extract interviewer email from event memberships
    const interviewerEmail = calendlyEvent.event_memberships.length > 0 
      ? calendlyEvent.event_memberships[0].user.email 
      : '';

    if (event === 'invitee.created') {
      // Find the application by candidate email
      const { data: application, error: appError } = await supabase
        .from('job_applications')
        .select('id')
        .eq('email', candidateEmail)
        .single();

      if (appError || !application) {
        console.error('Application not found for email:', candidateEmail);
        return new Response(JSON.stringify({ error: 'Application not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create interview record
      const { error: interviewError } = await supabase
        .from('interviews')
        .insert({
          application_id: application.id,
          calendly_event_uri: calendlyEvent.uri,
          calendly_event_id: calendlyEvent.uri.split('/').pop(),
          scheduled_time: calendlyEvent.start_time,
          candidate_email: candidateEmail,
          interviewer_email: interviewerEmail,
          meeting_url: calendlyEvent.meeting_url,
          status: 'scheduled'
        });

      if (interviewError) {
        console.error('Error creating interview:', interviewError);
        return new Response(JSON.stringify({ error: 'Failed to create interview' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update application status to interview_scheduled
      const { error: statusError } = await supabase
        .from('job_applications')
        .update({ 
          status: 'interview_scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (statusError) {
        console.error('Error updating application status:', statusError);
      }

      console.log('Interview scheduled successfully');
    } else if (event === 'invitee.canceled') {
      // Update interview status to cancelled
      const { error: updateError } = await supabase
        .from('interviews')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('calendly_event_uri', calendlyEvent.uri);

      if (updateError) {
        console.error('Error updating interview status:', updateError);
      }

      console.log('Interview cancelled successfully');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Calendly webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
