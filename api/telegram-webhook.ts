/**
 * Serverless Telegram Webhook Endpoint
 * 
 * Works on: Vercel Serverless, Cloudflare Workers, Netlify Functions, or Node.js
 * 
 * Setup:
 * 1. Create a Telegram Bot via @BotFather and copy your BOT_TOKEN.
 * 2. Set Webhook: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_URL>/api/telegram-webhook
 * 3. Add TELEGRAM_SECRET_KEY & SUPABASE_URL / SUPABASE_KEY in your env vars.
 */

export interface TelegramMessage {
  message?: {
    chat?: { id: number };
    text?: string;
    from?: { id: number; username?: string };
    date?: number;
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: TelegramMessage = req.body;
    const text = body?.message?.text?.trim();
    const chatId = body?.message?.chat?.id;

    if (!text || !chatId) {
      return res.status(200).json({ ok: true });
    }

    // Command: /book Title | Author | Year | Note | HexColor
    if (text.startsWith('/book')) {
      const payload = text.replace('/book', '').trim();
      const parts = payload.split('|').map((p) => p.trim());
      
      const newBook = {
        type: 'book',
        title: parts[0] || 'Untitled Book',
        author: parts[1] || 'Unknown Author',
        year: parts[2] || String(new Date().getFullYear()),
        note: parts[3] || 'Recommended read.',
        c: parts[4] || '#18181b',
        fg: '#ffffff',
      };

      // Push to Supabase / Database / GitHub JSON
      // e.g., await supabase.from('books').insert(newBook);

      return res.status(200).json({
        ok: true,
        message: `Saved book: ${newBook.title}`,
        data: newBook,
      });
    }

    // Command: /read Title | URL | Source | Type | CoverImage
    if (text.startsWith('/read') || text.startsWith('/essay')) {
      const payload = text.replace(/^\/(?:read|essay)/, '').trim();
      const parts = payload.split('|').map((p) => p.trim());

      const newEssay = {
        type: 'essay',
        title: parts[0] || 'Untitled Article',
        url: parts[1] || '#',
        source: parts[2] || 'Web Archive',
        type_label: parts[3] || 'Essay',
        img: parts[4] || undefined,
        year: String(new Date().getFullYear()),
      };

      // Push to Supabase / Database / GitHub JSON
      // e.g., await supabase.from('essays').insert(newEssay);

      return res.status(200).json({
        ok: true,
        message: `Saved reading: ${newEssay.title}`,
        data: newEssay,
      });
    }

    return res.status(200).json({ ok: true, note: 'Unrecognized command. Use /book or /read' });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
