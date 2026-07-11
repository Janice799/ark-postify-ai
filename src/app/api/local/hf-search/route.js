export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  
  if (!query) {
    return Response.json({ models: [] });
  }

  try {
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=gguf&sort=downloads&direction=-1&limit=10`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }
    const data = await response.json();
    const models = data.map(m => ({
      id: m.id,
      downloads: m.downloads || 0,
      likes: m.likes || 0
    }));
    return Response.json({ models });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
