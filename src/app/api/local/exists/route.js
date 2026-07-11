import fs from 'fs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path') || '';
    
    if (!filePath) {
      return Response.json({ exists: false, error: 'Path is required' }, { headers: corsHeaders });
    }

    const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    return Response.json({ exists }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ exists: false, error: err.message }, { headers: corsHeaders });
  }
}
