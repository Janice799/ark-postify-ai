import { runCommitCraftPipeline } from '../../../../engines/ai/pipeline';

export const runtime = 'edge';

const jsonError = (message, status = 400) => (
  Response.json({ error: message }, { status })
);

export async function POST(req) {
  try {
    const payload = await req.json();

    // Check if it's a GitHub push event
    if (!payload.commits || !Array.isArray(payload.commits) || payload.commits.length === 0) {
      return Response.json({ success: true, message: 'No commits in payload.' });
    }

    const repoName = payload.repository?.full_name || 'unnamed-repo';
    const parsedCommits = payload.commits.map(c => ({
      hash: c.id,
      message: c.message,
      author: c.author?.name || c.committer?.name || 'Unknown',
      date: c.timestamp
    }));

    // Check if Telegram and Gemini keys are set in Env for webhook automation
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!botToken || !chatId || !geminiKey) {
      return Response.json({
        success: true,
        message: 'Push recorded, but automated Telegram alerting is not configured in Env variables (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, GEMINI_API_KEY).'
      });
    }

    // Run AI pipeline to generate post
    const result = await runCommitCraftPipeline(parsedCommits, {
      provider: 'gemini',
      repoName,
      geminiKey
    });

    const parts = result.split('---');
    const twitterPost = parts[0] ? parts[0].trim() : '';
    const linkedinPost = parts[1] ? parts[1].trim() : '';

    // Send to Telegram
    const telegramMessage = `🚀 <b>CommitCraft Autodevlog</b> for <b>${repoName}</b>\n\n` + 
      `<b>[Twitter/X Draft]</b>\n${twitterPost}\n\n` +
      `<b>[LinkedIn Draft]</b>\n${linkedinPost}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    return Response.json({ success: true, message: 'Alert dispatched to Telegram.' });
  } catch (error) {
    return jsonError(error.message || 'Webhook parsing failed.', 500);
  }
}
