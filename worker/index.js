import { createRequestHandler } from '@cloudflare/next-on-pages/edge';

export default createRequestHandler({
  // Required: Provide the build output directory that contains your built Next.js application
  buildOutputDirectory: '.next',
  
  // Optional: Customize how assets are served
  assetPrefix: '/_next',
  
  // Optional: Provide custom error handling
  onError: (error, request) => {
    console.error('Next.js Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
