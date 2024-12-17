export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    console.log('[DEBUG] Request URL:', url.pathname)
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      console.log('[DEBUG] Handling API route:', url.pathname)
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }

      // Get auth token from request
      const authHeader = request.headers.get('Authorization');
      console.log('[DEBUG] Auth header:', authHeader);
      
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Bearer token required' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const token = authHeader.slice(7); // Remove 'Bearer ' prefix

      // Forward request to actual sermon API
      try {
        // Add /v1 to the path for the actual API
        const apiPath = url.pathname.replace('/api/', '/api/v1/');
        const apiUrl = `https://api.rockvilletollandsda.church${apiPath}`;
        console.log('[DEBUG] Forwarding to:', apiUrl);
        console.log('[DEBUG] With token:', token);

        const apiResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[DEBUG] API Response status:', apiResponse.status);
        const data = await apiResponse.text();
        console.log('[DEBUG] API Response data:', data);

        // Try to parse the response as JSON
        let jsonData;
        try {
          jsonData = JSON.parse(data || '[]'); // Default to empty array if response is empty
        } catch (e) {
          console.error('[DEBUG] Failed to parse JSON:', e);
          return new Response(JSON.stringify({ error: 'Invalid JSON response from API' }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        return new Response(JSON.stringify(jsonData), {
          status: apiResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        console.error('[DEBUG] API Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Handle static files
    try {
      let path = url.pathname
      let r2Key = ''
      let contentType = 'application/octet-stream' // default content type
      let cacheControl = 'public, max-age=0' // default no cache for HTML
      
      // Handle different path patterns
      if (path === '/') {
        // For root, serve index.html
        r2Key = '_next/server/app/index.html'
        contentType = 'text/html; charset=utf-8'
      } else if (!path.includes('.')) {
        // This is a page route, serve its HTML
        const pageName = path.endsWith('/') ? path.slice(0, -1) : path
        r2Key = `_next/server/app${pageName}.html`
        contentType = 'text/html; charset=utf-8'
      } else if (path.startsWith('/_next/')) {
        // Handle Next.js static files
        r2Key = path.slice(1) // Remove leading slash
        if (path.endsWith('.js')) {
          contentType = 'application/javascript'
          cacheControl = 'public, max-age=31536000, immutable'
        }
        else if (path.endsWith('.css')) {
          contentType = 'text/css'
          cacheControl = 'public, max-age=31536000, immutable'
        }
        else if (path.endsWith('.woff2')) {
          contentType = 'font/woff2'
          cacheControl = 'public, max-age=31536000, immutable'
        }
        else if (path.endsWith('.json')) {
          contentType = 'application/json'
          cacheControl = 'public, max-age=31536000, immutable'
        }
      } else if (path.startsWith('/images/') || path.startsWith('/public/images/')) {
        // Handle public images
        r2Key = path.startsWith('/public/') ? path.slice(1) : `public${path}`
        cacheControl = 'public, max-age=31536000, immutable'
        if (path.endsWith('.webp')) contentType = 'image/webp'
        else if (path.endsWith('.png')) contentType = 'image/png'
        else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) contentType = 'image/jpeg'
        
        console.log('[DEBUG] Image request:', { path, r2Key, contentType })
      } else if (path === '/manifest.json') {
        r2Key = 'public/manifest.json'
        contentType = 'application/json'
        cacheControl = 'public, max-age=31536000, immutable'
      } else {
        // Any other files in public directory
        r2Key = `public${path}`
        cacheControl = 'public, max-age=31536000, immutable'
      }

      console.log('[DEBUG] Looking for file:', path)
      console.log('[DEBUG] R2 key:', r2Key)
      console.log('[DEBUG] Content-Type:', contentType)
      
      const obj = await env.ASSETS.get(r2Key)
      
      if (obj === null) {
        console.log('[DEBUG] File not found in R2:', r2Key)
        // Try listing some files in the bucket for debugging
        const listedImages = await env.ASSETS.list({ prefix: 'public/images', limit: 10 })
        console.log('[DEBUG] Images in bucket:', listedImages.objects.map(o => o.key))
        
        const listedPublic = await env.ASSETS.list({ prefix: 'public', limit: 10 })
        console.log('[DEBUG] Public files in bucket:', listedPublic.objects.map(o => o.key))
        
        return new Response('Not found', { status: 404 })
      }

      console.log('[DEBUG] File found in R2:', r2Key)
      const headers = new Headers()
      obj.writeHttpMetadata(headers)
      headers.set('etag', obj.httpEtag)
      headers.set('Content-Type', contentType)
      headers.set('Cache-Control', cacheControl)
      headers.set('Access-Control-Allow-Origin', '*')
      
      return new Response(obj.body, {
        headers,
      })
    } catch (e) {
      console.error('[DEBUG] Error:', e.stack || e.message)
      return new Response('Server Error: ' + e.message, { status: 500 })
    }
  }
}
