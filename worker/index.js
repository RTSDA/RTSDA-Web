// @ts-check
import manifest from '__next-on-pages-manifest__';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { createFetch } from '@whatwg-node/fetch';

/**
 * @param {Request} request
 * @param {any} env
 * @param {any} ctx
 */
export default async function handler(request, env, ctx) {
  try {
    const url = new URL(request.url);
    
    // First try to serve static assets
    if (url.pathname.startsWith('/_next/') || url.pathname.includes('.')) {
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: manifest,
          }
        );
      } catch (e) {
        // Fall through to the next handler if asset is not found
      }
    }

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const response = await fetch(request);
      if (!response.ok) {
        return new Response('API Error', { status: response.status });
      }
      return response;
    }

    // Serve the app
    const customFetch = createFetch({ mutableRequest: true });
    const response = await customFetch(request);
    return response;
  } catch (e) {
    return new Response('Internal Error: ' + e.message, { status: 500 });
  }
}
