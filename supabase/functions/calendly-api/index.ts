
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
    console.log(`Invalid method: ${req.method}`);
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log("=== Calendly API Function Called ===");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const calendlyToken = Deno.env.get("CALENDLY_API_TOKEN");
    console.log("Calendly token exists:", !!calendlyToken);
    console.log("Calendly token length:", calendlyToken?.length || 0);
    
    if (!calendlyToken) {
      console.error("CALENDLY_API_TOKEN environment variable not found");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Calendly API token not configured in environment variables" 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { action, organizationUri, eventTypeUri }: CalendlyApiRequest = await req.json();
    console.log("Action requested:", action);
    console.log("Organization URI:", organizationUri);

    const calendlyHeaders = {
      'Authorization': `Bearer ${calendlyToken}`,
      'Content-Type': 'application/json',
    };

    let apiUrl = '';

    switch (action) {
      case 'testConnection':
      case 'getUser':
        apiUrl = 'https://api.calendly.com/users/me';
        break;
      
      case 'getEventTypes':
        if (!organizationUri) {
          console.error("Organization URI required for getting event types");
          return new Response(
            JSON.stringify({ 
              success: false,
              error: "Organization URI required for getting event types" 
            }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        apiUrl = `https://api.calendly.com/event_types?organization=${encodeURIComponent(organizationUri)}`;
        break;
      
      case 'getEvents':
        if (!organizationUri) {
          console.error("Organization URI required for getting events");
          return new Response(
            JSON.stringify({ 
              success: false,
              error: "Organization URI required for getting events" 
            }),
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
        console.error("Invalid action:", action);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Invalid action" 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    console.log(`Making Calendly API call to: ${apiUrl}`);
    console.log("Request headers:", { ...calendlyHeaders, 'Authorization': 'Bearer [REDACTED]' });
    
    const calendlyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: calendlyHeaders,
    });

    console.log(`Calendly API response status: ${calendlyResponse.status}`);
    console.log(`Calendly API response headers:`, Object.fromEntries(calendlyResponse.headers.entries()));

    if (!calendlyResponse.ok) {
      const errorText = await calendlyResponse.text();
      console.error(`Calendly API error: ${calendlyResponse.status} - ${errorText}`);
      
      let errorMessage = `Calendly API error: ${calendlyResponse.status}`;
      
      // Provide more specific error messages
      switch (calendlyResponse.status) {
        case 401:
          errorMessage = "Invalid Calendly API token. Please check your API token configuration.";
          break;
        case 403:
          errorMessage = "Access denied. Please verify your Calendly API token has the required permissions.";
          break;
        case 404:
          errorMessage = "Resource not found. Please check your Calendly organization URI.";
          break;
        case 429:
          errorMessage = "Rate limit exceeded. Please try again later.";
          break;
        default:
          errorMessage = `Calendly API error: ${calendlyResponse.status}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          details: errorText,
          status: calendlyResponse.status
        }),
        { status: calendlyResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await calendlyResponse.json();
    console.log(`Calendly API response for ${action}:`, JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in calendly-api function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
