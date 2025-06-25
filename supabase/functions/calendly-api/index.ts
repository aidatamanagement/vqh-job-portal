
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  console.log(`=== Calendly API Function Called at ${new Date().toISOString()} ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log(`Invalid method: ${req.method}`);
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }), 
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    // Check environment variables
    const calendlyToken = Deno.env.get("CALENDLY_API_TOKEN");
    console.log("Environment check:");
    console.log("- CALENDLY_API_TOKEN exists:", !!calendlyToken);
    console.log("- CALENDLY_API_TOKEN length:", calendlyToken?.length || 0);
    
    if (!calendlyToken) {
      console.error("CALENDLY_API_TOKEN environment variable not found");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Calendly API token not configured. Please check your Supabase secrets." 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      requestBody = JSON.parse(bodyText);
      console.log("Parsed request body:", requestBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid JSON in request body" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { action, organizationUri }: CalendlyApiRequest = requestBody;
    console.log("Action requested:", action);
    console.log("Organization URI:", organizationUri);

    // Validate action
    const validActions = ['getUser', 'getEventTypes', 'getEvents', 'testConnection'];
    if (!validActions.includes(action)) {
      console.error("Invalid action:", action);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

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
              error: "Organization URI is required for getting event types" 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json", ...corsHeaders } 
            }
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
              error: "Organization URI is required for getting events" 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json", ...corsHeaders } 
            }
          );
        }
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - 30);
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 30);
        
        apiUrl = `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(organizationUri)}&min_start_time=${startTime.toISOString()}&max_start_time=${endTime.toISOString()}`;
        break;
    }

    console.log(`Making Calendly API call to: ${apiUrl}`);
    
    const calendlyResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: calendlyHeaders,
    });

    console.log(`Calendly API response status: ${calendlyResponse.status}`);
    console.log(`Calendly API response status text: ${calendlyResponse.statusText}`);

    if (!calendlyResponse.ok) {
      const errorText = await calendlyResponse.text();
      console.error(`Calendly API error: ${calendlyResponse.status} - ${errorText}`);
      
      let errorMessage = `Calendly API error: ${calendlyResponse.status}`;
      
      switch (calendlyResponse.status) {
        case 401:
          errorMessage = "Invalid Calendly API token. Please verify your API token in Supabase secrets.";
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
          errorMessage = `Calendly API error: ${calendlyResponse.status} - ${calendlyResponse.statusText}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          details: errorText,
          status: calendlyResponse.status
        }),
        { 
          status: 200, // Return 200 to client but indicate error in body
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const data = await calendlyResponse.json();
    console.log(`Successfully retrieved ${action} data from Calendly API`);
    console.log("Response data keys:", Object.keys(data));

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("=== EDGE FUNCTION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error occurred in Edge Function", 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
