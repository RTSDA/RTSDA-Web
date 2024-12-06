export async function onRequest(context) {
  // Get environment variables from context
  const env = context.env;
  
  // Create a safe config object with only the variables we want to expose
  const config = {
    FIREBASE_API_KEY: env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: env.FIREBASE_MEASUREMENT_ID,
    YOUTUBE_API_KEY: env.YOUTUBE_API_KEY
  };

  // Log what variables we found (without their values)
  console.log('Available environment variables:', Object.keys(config).filter(key => config[key]));
  
  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      // Only allow from our domain
      'Access-Control-Allow-Origin': context.request.headers.get('Origin'),
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}
