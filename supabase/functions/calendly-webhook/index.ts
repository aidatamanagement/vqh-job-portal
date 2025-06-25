
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendlyWebhookPayload {
  event: string;
  payload: {
    event_type: string;
    name: string;
    email: string;
    text_reminder_number?: string;
    created_at: string;
    updated_at: string;
    event: {
      uuid: string;
      assigned_to: string[];
      extended_assigned_to: Array<{
        name: string;
        email: string;
        primary: boolean;
      }>;
      start_time: string;
      end_time: string;
      event_type: {
        uuid: string;
        name: string;
        duration: number;
        slug: string;
        scheduling_url: string;
      };
      location: {
        type: string;
        location?: string;
        join_url?: string;
      };
      invitees_counter: {
        total: number;
        active: number;
        limit: number;
      };
      created_at: string;
      updated_at: string;
      event_memberships: Array<{
        user: string;
        user_email: string;
        user_name: string;
      }>;
      event_guests: any[];
      uri: string;
      name: string;
      status: string;
      booking_method: string;
      invitees: Array<{
        uuid: string;
        first_name?: string;
        last_name?: string;
        name: string;
        email: string;
        text_reminder_number?: string;
        timezone: string;
        created_at: string;
        updated_at: string;
        canceled: boolean;
        cancellation: any;
        payment: any;
        no_show: any;
        reconfirmation: any;
        uri: string;
        routing_form_submission: any;
        questions_and_answers: any[];
        tracking: {
          utm_campaign?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_content?: string;
          utm_term?: string;
          salesforce_uuid?: string;
        };
      }>;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: CalendlyWebhookPayload = await req.json();
    console.log("Received Calendly webhook:", JSON.stringify(payload, null, 2));

    if (payload.event === "invitee.created") {
      const eventData = payload.payload.event;
      const invitee = eventData.invitees[0]; // Get the first invitee
      
      if (!invitee) {
        console.error("No invitee found in webhook payload");
        return new Response("No invitee found", { status: 400, headers: corsHeaders });
      }

      // Find the job application by email
      const { data: applications, error: appError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("email", invitee.email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (appError) {
        console.error("Error finding application:", appError);
        return new Response("Database error", { status: 500, headers: corsHeaders });
      }

      if (!applications || applications.length === 0) {
        console.log(`No application found for email: ${invitee.email}`);
        return new Response("Application not found", { status: 404, headers: corsHeaders });
      }

      const application = applications[0];

      // Get interviewer email from event memberships
      const interviewer = eventData.event_memberships[0];
      const interviewerEmail = interviewer ? interviewer.user_email : null;

      // Create interview record
      const { data: interview, error: interviewError } = await supabase
        .from("interviews")
        .insert({
          application_id: application.id,
          calendly_event_id: eventData.uuid,
          calendly_event_uri: eventData.uri,
          candidate_email: invitee.email,
          interviewer_email: interviewerEmail,
          scheduled_time: eventData.start_time,
          meeting_url: eventData.location?.join_url || null,
          status: "scheduled",
        })
        .select()
        .single();

      if (interviewError) {
        console.error("Error creating interview:", interviewError);
        return new Response("Failed to create interview", { status: 500, headers: corsHeaders });
      }

      console.log("Created interview:", interview);

      // Update application status to 'interview_scheduled'
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({ 
          status: "interview_scheduled",
          updated_at: new Date().toISOString()
        })
        .eq("id", application.id);

      if (updateError) {
        console.error("Error updating application status:", updateError);
        return new Response("Failed to update application", { status: 500, headers: corsHeaders });
      }

      console.log(`Updated application ${application.id} status to interview_scheduled`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          interview: interview,
          application_updated: true 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle other event types if needed
    console.log(`Unhandled event type: ${payload.event}`);
    return new Response(
      JSON.stringify({ success: true, message: "Event received but not processed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
