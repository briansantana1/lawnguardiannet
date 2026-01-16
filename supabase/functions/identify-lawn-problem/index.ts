const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: 'This feature is currently disabled. Please use the Plant.id identification service instead.',
      message: 'The Lovable API integration has been disabled. All lawn problem identification now uses Plant.id.'
    }),
    {
      status: 503,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
});
