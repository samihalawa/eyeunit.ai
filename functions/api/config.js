// Cloudflare Function for /api/config endpoint
// This function securely provides the Huggingface API key from environment variables

export async function onRequest(context) {
  // Set appropriate CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  });

  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { 
      headers,
      status: 204
    });
  }

  // Log request information
  console.log('API config request received in Cloudflare Function');
  
  try {
    // Get API key from Cloudflare environment variable
    const huggingfaceApiKey = context.env.HUGGINGFACE_API_KEY;
    
    if (!huggingfaceApiKey) {
      console.error('HUGGINGFACE_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500, 
          headers 
        }
      );
    }
    
    // Return the API key in the response
    return new Response(
      JSON.stringify({ huggingfaceApiKey }),
      { 
        status: 200, 
        headers 
      }
    );
  } catch (error) {
    console.error('Error in Cloudflare Function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers 
      }
    );
  }
} 