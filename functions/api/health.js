// Cloudflare Function for /api/health endpoint
// Used for monitoring and debugging the deployment

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

  try {
    // Check if API key is configured
    const hasApiKey = !!context.env.HUGGINGFACE_API_KEY;
    
    // Return deployment status
    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: 'cloudflare',
        apiKeyConfigured: hasApiKey,
        runtime: 'cloudflare_function'
      }),
      { 
        status: 200, 
        headers 
      }
    );
  } catch (error) {
    console.error('Error in health check:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers 
      }
    );
  }
} 