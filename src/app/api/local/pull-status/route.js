import fs from 'fs';
import path from 'path';

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

    return Response.json({ pulling, installed });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
