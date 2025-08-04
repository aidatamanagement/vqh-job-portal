// Test Edge Function directly
// Run this in your browser console or Node.js

const testEdgeFunction = async () => {
  const SUPABASE_URL = 'https://dtmwyzrleyevcgtfwrnr.supabase.co';
  const SUPABASE_ANON_KEY = 'your-anon-key'; // Get this from your Supabase dashboard
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: 'test-edge-function@example.com',
        password: 'testpassword123',
        user_metadata: {
          display_name: 'Test Edge Function User',
          admin_name: 'Test Edge Function User',
          role: 'branch_manager',
          location: null
        }
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error:', data.error);
      console.error('Status:', response.status);
    } else {
      console.log('Success:', data);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Run the test
testEdgeFunction(); 