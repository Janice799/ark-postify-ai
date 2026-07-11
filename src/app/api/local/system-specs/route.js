import os from 'os';

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

export async function GET() {
  try {
    const totalRamGB = os.totalmem() / (1024 ** 3);
    const freeRamGB = os.freemem() / (1024 ** 3);
    const cpus = os.cpus() || [];
    const cpuModel = (cpus[0]?.model || 'unknown').replace(/\s+/g, ' ').trim();
    const platform = os.platform();
    const arch = os.arch();
    
    // Apple Silicon detection: macOS arm64 + Apple M CPU prefix
    const isAppleSilicon = platform === 'darwin' && arch === 'arm64' && /Apple\s+M/i.test(cpuModel);
    
    // Calculate safe model loading memory budget (RAM ratio limit)
    const ratio = isAppleSilicon ? 0.65 : 0.5;
    const safeModelBudgetGB = Math.max(2, Math.floor(totalRamGB * ratio));
    
    const summary = `${platform === 'darwin' ? 'macOS' : platform} · ${arch}${isAppleSilicon ? ' (Apple Silicon)' : ''} · RAM ${totalRamGB.toFixed(0)}GB · CPU ${cpuModel.slice(0, 40)} (${cpus.length} cores)`;

    return Response.json({
      totalRamGB,
      freeRamGB,
      cpuModel,
      cpuCount: cpus.length,
      platform,
      arch,
      isAppleSilicon,
      safeModelBudgetGB,
      summary
    }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
