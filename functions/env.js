export async function onRequest(context) {
  // List of environment variables to expose
  const allowedVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID'
  ];

  // Create a filtered object with only allowed variables
  const filteredEnv = {};
  
  // Check both context.env and process.env
  const envSource = context.env || process.env;
  
  for (const key of allowedVars) {
    // Try both with and without CLOUDFLARE_ prefix
    const value = envSource[key] || envSource[`CLOUDFLARE_${key}`];
    if (value) {
      filteredEnv[key] = value;
    }
  }

  // Return the filtered environment variables with appropriate headers
  return new Response(JSON.stringify(filteredEnv), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
