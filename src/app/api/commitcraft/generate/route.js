import { runCommitCraftPipeline } from '../../../../engines/ai/pipeline';

const jsonError = (message, status = 400, code = 'BAD_REQUEST') => (
  Response.json({ error: { code, message } }, { status })
);

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body.', 400, 'INVALID_JSON');
    }

    const commits = body.commits;
    const repoName = body.repoName || '';
    const provider = body.provider || 'openai';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const geminiKey = typeof body.geminiKey === 'string' ? body.geminiKey.trim() : '';
    const localModelPath = typeof body.localModelPath === 'string' ? body.localModelPath.trim() : '';
    const persona = typeof body.persona === 'string' ? body.persona.trim() : '';

    if (!Array.isArray(commits) || commits.length === 0) {
      return jsonError('A non-empty commits array is required.', 400, 'MISSING_COMMITS');
    }

    let result;
    if (provider === 'local') {
      const { runLocalCommitCraftPipeline } = await import('../../../../engines/ai/localPipeline');
      result = await runLocalCommitCraftPipeline(commits, { provider, repoName, apiKey, geminiKey, persona, localModelPath });
    } else {
      result = await runCommitCraftPipeline(commits, { provider, repoName, apiKey, geminiKey, persona, localModelPath });
    }

    // Split result by divider line
    const parts = result.split('---');
    const twitterPost = parts[0] ? parts[0].trim() : '';
    const linkedinPost = parts[1] ? parts[1].trim() : '';

    return Response.json({
      raw: result,
      twitter: twitterPost,
      linkedin: linkedinPost
    });
  } catch (error) {
    return jsonError(error.message || 'CommitCraft generation failed.', 500, 'COMMIT_CRAFT_ERROR');
  }
}
