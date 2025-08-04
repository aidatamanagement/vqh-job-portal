
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the request body
    const { email, password, user_metadata } = await req.json()

    console.log('=== ADMIN CREATE USER FUNCTION DEBUG ===')
    console.log('Received request body:', { email, password: '***', user_metadata })
    console.log('Received user_metadata:', user_metadata)
    console.log('Location from metadata:', user_metadata?.location)
    console.log('Role from metadata:', user_metadata?.role)
    console.log('Location type:', typeof user_metadata?.location)
    console.log('Location === null:', user_metadata?.location === null)
    console.log('Location === "none":', user_metadata?.location === 'none')

    // Validate required fields
    if (!email || !password) {
      console.log('ERROR: Missing email or password')
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate role is one of the allowed values
    const allowedRoles = ['admin', 'branch_manager', 'hr', 'trainer', 'content_manager'];
    const role = user_metadata?.role || 'branch_manager';
    console.log('Validating role:', role)
    console.log('Allowed roles:', allowedRoles)
    console.log('Role is allowed:', allowedRoles.includes(role))
    
    if (!allowedRoles.includes(role)) {
      console.log('ERROR: Invalid role specified:', role)
      return new Response(
        JSON.stringify({ error: 'Invalid role specified: ' + role }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user using admin API
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: user_metadata || {},
      email_confirm: true // Auto-confirm email
    })

    if (createError) {
      console.log('ERROR: Failed to create user:', createError.message)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User created successfully:', user?.user?.id)

    // Create or update the user's profile with role and other metadata
    if (user?.user && user_metadata) {
      const finalLocation = user_metadata.location === 'none' ? null : user_metadata.location || null;
      console.log('Creating profile with location:', user_metadata.location)
      console.log('Final location value:', finalLocation)
      console.log('Final location type:', typeof finalLocation)
      console.log('Profile data to insert:', {
        id: user.user.id,
        email: user.user.email,
        role: role,
        admin_name: user_metadata.admin_name,
        display_name: user_metadata.display_name,
        location: finalLocation
      })
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.user.id,
          email: user.user.email,
          role: role,
          admin_name: user_metadata.admin_name,
          display_name: user_metadata.display_name,
          location: finalLocation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)

      if (profileError) {
        console.error('ERROR: Failed to create/update profile:', profileError)
        console.error('Profile error details:', profileError.message)
        console.error('Profile error code:', profileError.code)
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile: ' + profileError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      console.log('Profile created/updated successfully')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: user?.user,
        message: 'User created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating user:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
