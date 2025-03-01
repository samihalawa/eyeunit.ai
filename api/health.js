// Vercel Serverless Function for /api/health endpoint
// Used for monitoring and debugging the deployment

module.exports = (req, res) => {
  // Set appropriate CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // Check if API key is configured
    const hasApiKey = !!process.env.HUGGINGFACE_API_KEY;
    
    // Return deployment status
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'vercel',
      apiKeyConfigured: hasApiKey,
      runtime: 'vercel_serverless'
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 