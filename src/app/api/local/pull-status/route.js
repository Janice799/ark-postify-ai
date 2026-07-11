import fs from 'fs';
import path from 'path';

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

global.pullingModels = global.pullingModels || new Map();

export async function GET(req) {
  try {
    // 1. Get pulling status
    const pulling = Array.from(global.pullingModels.values());

    // 2. Scan downloaded models
    const modelsDir = path.join(process.cwd(), 'models');
    let installed = [];
    
    if (fs.existsSync(modelsDir)) {
      const files = fs.readdirSync(modelsDir);
      installed = files
        .filter(f => f.endsWith('.gguf'))
        .map(f => {
          const stats = fs.statSync(path.join(modelsDir, f));
          return {
            name: f,
            path: path.join(modelsDir, f),
            sizeGb: (stats.size / (1024 * 1024 * 1024)).toFixed(2)
          };
        });
    }

    return Response.json({ pulling, installed }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
