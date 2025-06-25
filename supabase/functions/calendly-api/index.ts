
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    // Get Calendly settings
    const { data: settings, error: settingsError } = await supabase
      .from('calendly_settings')
      .select('*')
      .single();

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: 'Calendly not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const calendlyHeaders = {
      'Authorization': `Bearer ${settings.api_token}`,
      'Content-Type': 'application/json',
    };

    let response;

    switch (action) {
      case 'getScheduledEvents':
        const eventsUrl = `https://api.calendly.com/scheduled_events?organization=${encodeURIComponent(settings.organization_uri)}`;
        response = await fetch(eventsUrl, { headers: calendlyHeaders });
        break;

      case 'getEventTypes':
        const eventTypesUrl = `https://api.calendly.com/event_types?organization=${encodeURIComponent(settings.organization_uri)}`;
        response = await fetch(eventTypesUrl, { headers: calendlyHeaders });
        break;

      case 'getCurrentUser':
        response = await fetch('https://api.calendly.com/users/me', { headers: calendlyHeaders });
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Calendly API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
