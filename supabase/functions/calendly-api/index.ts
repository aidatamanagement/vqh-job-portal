
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendlyApiRequest {
  action: 'getUser' | 'getEventTypes' | 'getEvents' | 'testConnection';
  organizationUri?: string;
  eventTypeUri?: string;
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

    const calendlyToken = Deno.env.get("CALENDLY_API_TOKEN");
    if (!calendlyToken) {
      return new Response(
        JSON.stringify({ error: "Calendly API token not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { action, organizationUri, eventTypeUri }: CalendlyApiRequest = await req.json();

    const calendlyHeaders = {
      'Authorization': `Bearer ${calendlyToken}`,
      'Content-Type': 'application/json',
    };

    let apiUrl = '';
    let response;

    switch (action) {
      case 'testConnection':
      case 'getUser':
        apiUrl = 'https://api.calendly.com/users/me';
        break;
      
      case 'getEventTypes':
        if (!organizationUri) {
          return new Response(
            JSON.stringify({ error: "Organization URI required for getting event types" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        apiUrl = `https://api.calendly.com/event_types?organization=${encodeURIComponent(organizationUri)}`;
        break;
      
      case 'getEvents':
        if (!organizationUri) {
          return new Response(
            JSON.stringify({ error: "Organization URI required for getting events" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - 30); // Last 30 days
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 30); // Next 30 days
        
        apiUrl = `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(organizationUri)}&min_start_time=${startTime.toISOString()}&max_start_time=${endTime.toISOString()}`;
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    console.log(`Making Calendly API call to: ${apiUrl}`);
    
    const calendlyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: calendlyHeaders,
    });

    if (!calendlyResponse.ok) {
      const errorText = await calendlyResponse.text();
      console.error(`Calendly API error: ${calendlyResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          error: `Calendly API error: ${calendlyResponse.status}`,
          details: errorText 
        }),
        { status: calendlyResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await calendlyResponse.json();
    console.log(`Calendly API response for ${action}:`, data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in calendly-api function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
