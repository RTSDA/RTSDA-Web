import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { fetch } from '@whatwg-node/fetch'

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      
      // First try to get a static asset
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          },
        )
      } catch (e) {
        // If it's not a static asset, continue to API routes
        if (!(e instanceof NotFoundError)) {
          throw e
        }
      }

      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        return fetch(request)
      }

      // Try to get the page as a static asset again (for client-side navigation)
      return await getAssetFromKV(
        {
          request: new Request(new URL(request.url + '.html'), request),
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        },
      )
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
