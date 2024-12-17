import { createRequestHandler } from '@cloudflare/next-on-pages';

export default createRequestHandler({
  // Required: Specify the location of your .next directory
  distDir: '.next',
});
