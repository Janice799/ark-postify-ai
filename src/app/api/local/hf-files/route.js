const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const repoId = searchParams.get('repoId') || '';
  const token = searchParams.get('token') || '';
  
  if (!repoId) {
    return Response.json({ error: 'repoId is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    const url = `https://huggingface.co/api/models/${repoId}`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    const data = await response.json();
    const ggufFiles = (data.siblings || [])
      .map(s => s.rfilename)
      .filter(name => name.endsWith('.gguf'));
    return Response.json({ files: ggufFiles }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
