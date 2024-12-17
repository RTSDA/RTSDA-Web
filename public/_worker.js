export default {
  async fetch(request, env, ctx) {
    // Forward the request to the Node.js server
    return env.ASSETS.fetch(request);
  }
}
