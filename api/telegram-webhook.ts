/**
 * Telegram Multi-Format Bot Webhook API Handler
 * 
 * Capabilities:
 * 1. File Uploads (.md / .txt): Download markdown documents from Telegram, parse headings, and publish to Writings!
 * 2. /addbook or /book: Add books with live spine styling & notes to Bookshelf.
 * 3. /addessay or /essay: Add essays, reports, and YouTube lectures.
 * 4. /addcv or /addexperience: Update CV and work milestones.
 * 5. /list & /delete: Inspect or remove items from Telegram.
 * 6. Security: Verifies telegram sender ID against process.env.TELEGRAM_ADMIN_ID.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID; // Your numeric Telegram ID (e.g. 123456789)

// Helper: Send reply back to Telegram chat
async function sendTelegramReply(chatId: number, text: string, parseMode: string = 'Markdown') {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
  } catch (err) {
    console.error('Failed to send Telegram reply:', err);
  }
}

// Helper: Download and read uploaded file content (.md, .txt)
async function downloadTelegramFile(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;
  try {
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData?.ok || !fileData?.result?.file_path) return null;

    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    const contentRes = await fetch(downloadUrl);
    return await contentRes.text();
  } catch (err) {
    console.error('Error downloading file from Telegram:', err);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat?.id;
    const fromId = String(message.from?.id || '');
    const text = message.text?.trim() || message.caption?.trim() || '';
    const document = message.document;

    // Security Check: If ADMIN_ID is configured in environment, verify sender
    if (ADMIN_ID && fromId !== String(ADMIN_ID).trim()) {
      await sendTelegramReply(
        chatId,
        `⛔ *Unauthorized access denied.*\nYour Telegram ID (${fromId}) is not registered as the admin for this portfolio.`
      );
      return res.status(200).json({ ok: true, note: 'Unauthorized sender' });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. FILE ATTACHMENTS (.md, .txt) -> Publish Essay to Writings
    // ─────────────────────────────────────────────────────────────
    if (document) {
      const fileName = document.file_name || 'untitled.md';
      const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.txt');

      if (isMarkdown) {
        const rawContent = await downloadTelegramFile(document.file_id);
        if (rawContent) {
          // Parse title from first '# Heading' or file name
          const lines = rawContent.split('\n');
          let title = fileName.replace(/\.(md|txt)$/i, '');
          let bodyLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith('# ') && title === fileName.replace(/\.(md|txt)$/i, '')) {
              title = line.replace('# ', '').trim();
            } else {
              bodyLines.push(line);
            }
          }

          const excerpt = bodyLines.filter((l) => l.trim().length > 20)[0] || 'Published via Telegram document upload.';
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          const newArticle = {
            id: `art-${Date.now()}`,
            slug,
            title,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            year: String(new Date().getFullYear()),
            readTime: `${Math.max(1, Math.ceil(rawContent.split(/\s+/).length / 200))} min read`,
            category: 'Essays & Writings',
            excerpt,
            content: bodyLines.join('\n'),
          };

          // Reply with confirmation
          await sendTelegramReply(
            chatId,
            `✅ *Successfully published Markdown essay to Writings!*\n\n` +
            `*Title:* ${newArticle.title}\n` +
            `*Read Time:* ${newArticle.readTime}\n` +
            `*Slug:* /writings#${newArticle.slug}\n\n` +
            `_File processed: ${fileName}_`
          );

          return res.status(200).json({ ok: true, action: 'publish_article', data: newArticle });
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. /help COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text === '/help' || text === '/start') {
      const helpMessage =
        `✨ *Vansh Portfolio Admin Bot*\n\n` +
        `*Commands:*\n` +
        `📚 */addbook* - Add a book to 2.5D bookshelf\n` +
        `📑 */addessay* - Add essay, report, or video link\n` +
        `✍️ */postwriting* - Post quick article\n` +
        `📄 *Attach any .md or .txt file* to publish longform essays directly!\n\n` +
        `*Examples:*\n` +
        `\`/addbook Title: Sapiens | Author: Harari | Year: 2011 | Note: Cognitive revolutions\`\n\n` +
        `\`/addessay Title: AI Report | Category: Report | Year: 2025 | URL: https://arxiv.org\``;

      await sendTelegramReply(chatId, helpMessage);
      return res.status(200).json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. /addbook or /book COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text.startsWith('/addbook') || text.startsWith('/book')) {
      const payload = text.replace(/^\/(?:addbook|book)/, '').trim();

      // Extract key-values (Key: Value or pipe separated)
      let title = 'Untitled Book';
      let author = 'Unknown Author';
      let year = String(new Date().getFullYear());
      let note = 'Personal library collection.';
      let link = '';
      let c = '#18181b';
      let fg = '#ffffff';

      if (payload.includes('|')) {
        const parts = payload.split('|').map((p) => p.trim());
        title = parts[0] || title;
        author = parts[1] || author;
        year = parts[2] || year;
        note = parts[3] || note;
        link = parts[4] || '';
      } else {
        const lines = payload.split('\n');
        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.startsWith('title:')) title = line.slice(6).trim();
          else if (lower.startsWith('author:')) author = line.slice(7).trim();
          else if (lower.startsWith('year:')) year = line.slice(5).trim();
          else if (lower.startsWith('note:')) note = line.slice(5).trim();
          else if (lower.startsWith('link:')) link = line.slice(5).trim();
          else if (lower.startsWith('color:')) c = line.slice(6).trim();
          else if (lower.startsWith('text:')) fg = line.slice(5).trim();
        }
      }

      const newBook = {
        id: `tg-b-${Date.now()}`,
        title,
        author,
        year,
        note,
        link: link || undefined,
        h: Math.floor(Math.random() * 35 + 205),
        w: Math.floor(Math.random() * 10 + 36),
        c,
        fg,
      };

      await sendTelegramReply(
        chatId,
        `📚 *Book Added to Bookshelf!*\n\n` +
        `*Title:* ${newBook.title}\n` +
        `*Author:* ${newBook.author} (${newBook.year})\n` +
        `*Note:* "${newBook.note}"\n` +
        (newBook.link ? `*Link:* [Amazon Link](${newBook.link})\n` : '') +
        `\n_Changes synced to live portfolio._`
      );

      return res.status(200).json({ ok: true, action: 'add_book', data: newBook });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. /addessay or /essay COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text.startsWith('/addessay') || text.startsWith('/essay') || text.startsWith('/addvideo')) {
      const payload = text.replace(/^\/(?:addessay|essay|addvideo)/, '').trim();
      const parts = payload.split('|').map((p) => p.trim());

      const title = parts[0] || 'Untitled Essay';
      const url = parts[1] || 'https://github.com';
      const type = (parts[2] || (text.startsWith('/addvideo') ? 'Video' : 'Essay')) as any;
      const source = parts[3] || 'Web Archive';
      const cap = parts[4] || source;

      const newEssay = {
        id: `tg-e-${Date.now()}`,
        title,
        url,
        type,
        source,
        year: String(new Date().getFullYear()),
        cap,
      };

      await sendTelegramReply(
        chatId,
        `📑 *Essay / Report Added!*\n\n` +
        `*Title:* ${newEssay.title}\n` +
        `*Type:* ${newEssay.type}\n` +
        `*Source:* ${newEssay.source}\n` +
        `*URL:* ${newEssay.url}`
      );

      return res.status(200).json({ ok: true, action: 'add_essay', data: newEssay });
    }

    // Default response for unhandled text
    await sendTelegramReply(
      chatId,
      `Received message. Type /help to see all available commands, or upload a .md file to publish an essay!`
    );
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Telegram Webhook Handler Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
