// API Configuration endpoint
// Returns configuration for client-side features

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    const apiKeyConfigured = !!process.env.HUGGINGFACE_API_KEY;

    // Return configuration
    res.status(200).json({
      apiKeyConfigured,
      features: {
        chatbot: apiKeyConfigured
      }
    });
  } catch (error) {
    console.error('Configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 