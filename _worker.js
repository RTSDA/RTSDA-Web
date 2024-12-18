export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only use R2 for assetlinks.json
    if (url.pathname === '/.well-known/assetlinks.json') {
      try {
        const object = await env.ASSETS.get('.well-known/assetlinks.json');
        if (object === null) {
          return new Response('assetlinks.json not found', { status: 404 });
        }
        const data = await object.text();
        return new Response(data, {
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache',
            'access-control-allow-origin': '*',
            'x-content-type-options': 'nosniff'
          },
        });
      } catch (e) {
        return new Response(`Error serving assetlinks.json: ${e.message}`, { status: 500 });
      }
    }
    
    // Everything else just passes through to R2
    try {
      let path;
      if (url.pathname === '/') {
        path = '_next/server/app/index.html';
      } else if (url.pathname.startsWith('/_next/')) {
        // For _next paths, remove the leading slash
        path = url.pathname.substring(1);
      } else if (url.pathname.startsWith('/images/')) {
        // For image paths, look in public/images
        path = 'public' + url.pathname;
      } else if (url.pathname === '/manifest.json') {
        path = 'public/manifest.json';
      } else if (url.searchParams.has('_rsc')) {
        // For RSC routes, look in the server app directory
        const routePath = url.pathname.substring(1).split('?')[0]; // Remove leading slash and query
        path = `_next/server/app/${routePath}.html`;
      } else {
        // For normal page loads, serve the HTML from server/app
        const routePath = url.pathname.substring(1);
        path = `_next/server/app/${routePath}.html`;
      }

      console.log('Looking for path:', path);
      const object = await env.ASSETS.get(path);
      if (object === null) {
        return new Response(`${path} not found`, { status: 404 });
      }

      // Set correct content type and caching headers for different file types
      const headers = new Headers();
      
      // Default cache control for static assets
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      
      // Set content type based on file extension
      if (path.endsWith('.js')) {
        headers.set('content-type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        headers.set('content-type', 'text/css');
      } else if (path.endsWith('.webp')) {
        headers.set('content-type', 'image/webp');
      } else if (path.endsWith('.ico')) {
        headers.set('content-type', 'image/x-icon');
      } else if (path.endsWith('.woff2')) {
        headers.set('content-type', 'font/woff2');
      } else if (path.endsWith('.html')) {
        headers.set('content-type', 'text/html');
        // Don't cache HTML files
        headers.set('cache-control', 'no-cache');
      } else if (path.endsWith('.json')) {
        headers.set('content-type', 'application/json');
        // Don't cache JSON files like manifest.json
        headers.set('cache-control', 'no-cache');
      }

      return new Response(object.body, { headers });
    } catch (e) {
      return new Response(`Error fetching ${path}: ${e.message}`, { status: 404 });
    }
  }
}
