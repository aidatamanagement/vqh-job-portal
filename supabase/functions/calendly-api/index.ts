
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log(`=== Calendly API Function Called at ${new Date().toISOString()} ===`);
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Environment check:");
    console.log("- CALENDLY_API_TOKEN exists:", !!Deno.env.get('CALENDLY_API_TOKEN'));
    console.log("- CALENDLY_API_TOKEN length:", Deno.env.get('CALENDLY_API_TOKEN')?.length || 0);

    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);
    
    const body = JSON.parse(rawBody);
    console.log("Parsed request body:", JSON.stringify(body, null, 2));

    const { action } = body;
    console.log("Action requested:", action);

    const apiToken = Deno.env.get('CALENDLY_API_TOKEN');
    if (!apiToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CALENDLY_API_TOKEN not configured' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    };

    let apiUrl: string;
    let response: Response;

    switch (action) {
      case 'testConnection':
      case 'getUser':
        apiUrl = 'https://api.calendly.com/users/me';
        break;
        
      case 'getEventTypes':
        const { organizationUri } = body;
        console.log("Organization URI:", organizationUri);
        apiUrl = `https://api.calendly.com/event_types?organization=${encodeURIComponent(organizationUri)}`;
        break;

      case 'getEventType':
        const { eventTypeUri } = body;
        console.log("Event Type URI:", eventTypeUri);
        apiUrl = eventTypeUri;
        break;
        
      case 'getEvents':
        const { organizationUri: orgUri } = body;
        console.log("Organization URI:", orgUri);
        // Get events from the last 2 months to 2 months in the future
        const minStartTime = new Date();
        minStartTime.setMonth(minStartTime.getMonth() - 2);
        const maxStartTime = new Date();
        maxStartTime.setMonth(maxStartTime.getMonth() + 2);
        
        apiUrl = `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(orgUri)}&min_start_time=${minStartTime.toISOString()}&max_start_time=${maxStartTime.toISOString()}`;
        break;

      case 'getInvitees':
        const { eventUri } = body;
        console.log("Event URI:", eventUri);
        apiUrl = `${eventUri}/invitees`;
        break;
        
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Unknown action: ${action}` 
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
    }

    console.log("Making Calendly API call to:", apiUrl);
    
    response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    console.log("Calendly API response status:", response.status);
    console.log("Calendly API response status text:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Calendly API error response:", errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Calendly API error: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const data = await response.json();
    console.log(`Successfully retrieved ${action} data from Calendly API`);
    console.log("Response data keys:", Object.keys(data));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in Calendly API function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
