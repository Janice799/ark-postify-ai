import fs from 'fs';
import path from 'path';

global.pullingModels = global.pullingModels || new Map();

export async function POST(req) {
  try {
    const { repoId, fileName } = await req.json();
    if (!repoId || !fileName) {
      return Response.json({ error: 'repoId and fileName are required' }, { status: 400 });
    }

    const modelsDir = path.join(process.cwd(), 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    const localPath = path.join(modelsDir, fileName);
    
    if (global.pullingModels.has(fileName)) {
      return Response.json({ message: 'Already downloading this model' });
    }

    const downloadUrl = `https://huggingface.co/${repoId}/resolve/main/${fileName}`;
    global.pullingModels.set(fileName, { name: fileName, progress: 0, status: 'connecting' });

    // Background download process (non-blocking)
    (async () => {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`HuggingFace resolve error: ${response.statusText}`);
        }
        
        const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
        let downloadedBytes = 0;
        const fileStream = fs.createWriteStream(localPath);

        if (response.body.getReader) {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fileStream.write(value);
            downloadedBytes += value.length;
            
            if (totalBytes > 0) {
              const progress = Math.round((downloadedBytes / totalBytes) * 100);
              global.pullingModels.set(fileName, {
                name: fileName,
                progress,
                status: 'downloading',
                completed: downloadedBytes,
                total: totalBytes
              });
            }
          }
        } else {
          for await (const chunk of response.body) {
            fileStream.write(chunk);
            downloadedBytes += chunk.length;
            
            if (totalBytes > 0) {
              const progress = Math.round((downloadedBytes / totalBytes) * 100);
              global.pullingModels.set(fileName, {
                name: fileName,
                progress,
                status: 'downloading',
                completed: downloadedBytes,
                total: totalBytes
              });
            }
          }
        }
        
        fileStream.end();
        global.pullingModels.delete(fileName);
        console.log(`[Local LLM] Finished downloading model: ${fileName}`);
      } catch (err) {
        console.error(`[Local LLM] Error downloading model ${fileName}:`, err.message);
        global.pullingModels.delete(fileName);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
    })();

    return Response.json({ success: true, message: `Started pulling model ${fileName} in the background.` });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
