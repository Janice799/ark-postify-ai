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
  const query = searchParams.get('query') || '';
  const token = searchParams.get('token') || '';
  
  if (!query) {
    return Response.json({ models: [] }, { headers: corsHeaders });
  }

  try {
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=gguf&sort=downloads&direction=-1&limit=10`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    const data = await response.json();
    const models = data.map(m => {
      const licenseTag = Array.isArray(m.tags) ? m.tags.find(t => t.startsWith('license:')) : null;
      const license = licenseTag ? licenseTag.replace('license:', '') : 'unknown';
      return {
        id: m.id,
        downloads: m.downloads || 0,
        likes: m.likes || 0,
        license: license
      };
    });
    return Response.json({ models }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
