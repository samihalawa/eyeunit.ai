// Vercel Serverless Function for /api/config endpoint
// This function securely provides the Huggingface API key from environment variables

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

  // Log request information
  console.log('API config request received in Vercel Serverless Function');
  
  try {
    // Get API key from Vercel environment variable
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!huggingfaceApiKey) {
      console.error('HUGGINGFACE_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Return the API key in the response
    return res.status(200).json({ huggingfaceApiKey });
  } catch (error) {
    console.error('Error in Vercel Serverless Function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 