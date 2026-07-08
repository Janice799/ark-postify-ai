export const runtime = 'edge';

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

    const { botToken, chatId, message } = body;

    if (!botToken || !chatId || !message) {
      return jsonError('botToken, chatId, and message are required.', 400, 'MISSING_FIELDS');
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      return jsonError(resData.description || 'Telegram API request failed.', response.status, 'TELEGRAM_ERROR');
    }

    return Response.json({ success: true, result: resData.result });
  } catch (error) {
    return jsonError(error.message || 'Failed to send Telegram message.', 500, 'TELEGRAM_FAILED');
  }
}
