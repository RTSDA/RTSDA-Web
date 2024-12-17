export default {
  async fetch(request, env, ctx) {
    try {
      // Get the static assets from KV or serve the app
      const url = new URL(request.url);
      
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        // TODO: Implement API routes
        return new Response('API not implemented', { status: 501 });
      }

      // Serve static files
      if (url.pathname.startsWith('/_next/') || url.pathname.includes('.')) {
        const response = await fetch(request);
        if (response.ok) {
          return response;
        }
      }

      // Default: serve the app
      const response = await fetch(request);
      return response;
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
