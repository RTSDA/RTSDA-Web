// @ts-check
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        const response = await fetch(request);
        if (!response.ok) {
          return new Response('API Error', { status: response.status });
        }
        return response;
      }

      // Serve static files and the app
      const response = await fetch(request);
      if (!response.ok) {
        return new Response('Not Found', { status: 404 });
      }
      return response;
    } catch (e) {
      console.error('Worker Error:', e);
      return new Response('Internal Error: ' + e.message, { status: 500 });
    }
  }
};
