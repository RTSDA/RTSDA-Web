export default {
  async fetch(request, env, ctx) {
    try {
      // First try static assets
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }

      // If not found, try server-side rendering
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle API routes
      if (path.startsWith('/api/')) {
        return new Response('API routes not supported in preview deployments', { status: 500 });
      }

      // Try to serve index.html for all other routes
      return env.ASSETS.fetch(new Request(new URL('/', request.url)));
    } catch (e) {
      return new Response(`Server error: ${e.message}`, { status: 500 });
    }
  }
}
