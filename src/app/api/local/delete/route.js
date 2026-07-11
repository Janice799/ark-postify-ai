import fs from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(req) {
  try {
    const { fileName } = await req.json();
    if (!fileName) {
      return Response.json({ error: 'fileName is required' }, { status: 400, headers: corsHeaders });
    }

    const modelsDir = path.join(process.cwd(), 'models');
    const filePath = path.join(modelsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return Response.json({ error: 'Model file not found' }, { status: 404, headers: corsHeaders });
    }

    // Delete file
    fs.unlinkSync(filePath);
    console.log(`[Local LLM] Deleted model file: ${filePath}`);

    return Response.json({ success: true, message: `Model file ${fileName} deleted successfully.` }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
