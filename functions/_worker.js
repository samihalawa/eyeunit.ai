export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve index.html for root path
    if (url.pathname === '/') {
      const response = await fetch('https://raw.githubusercontent.com/samihalawa/eyeunit.ai/main/index.html');
      return new Response(await response.text(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Serve other files directly from GitHub
    const response = await fetch(`https://raw.githubusercontent.com/samihalawa/eyeunit.ai/main${url.pathname}`);
    return response;
  }
} 