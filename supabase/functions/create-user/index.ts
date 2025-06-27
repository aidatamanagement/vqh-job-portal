
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, fullName, role } = await req.json();

    console.log('Creating user:', { email, fullName, role });

    // Validate input
    if (!email || !password || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate the site URL for email confirmation
    const siteUrl = supabaseUrl.replace('.supabase.co', '.supabase.co');
    const confirmUrl = `${siteUrl}/auth/confirm`;

    // Create user using admin client with email confirmation required
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        display_name: fullName,
        admin_name: fullName,
        role: role,
        full_name: fullName
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User created successfully:', authData.user.id);

    // Update the user's profile with role and name
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: role,
        admin_name: fullName,
        display_name: fullName,
        email_confirmed: false
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the request if profile update fails, just log it
    } else {
      console.log('Profile updated successfully');
    }

    // Send welcome email with login instructions
    try {
      const loginUrl = `${siteUrl.replace('supabase.co', 'supabase.co')}/admin/login`;
      
      const { error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
        body: {
          templateSlug: 'new-user-welcome',
          recipientEmail: email,
          variables: {
            fullName: fullName,
            email: email,
            role: role,
            temporaryPassword: 'Please check your email for login instructions',
            loginUrl: loginUrl
          }
        }
      });

      if (emailError) {
        console.error('Welcome email error:', emailError);
        // Continue even if email fails
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role,
          fullName: fullName,
          emailConfirmed: false,
          requiresConfirmation: true
        },
        message: 'User created successfully. They will receive an email confirmation link.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
