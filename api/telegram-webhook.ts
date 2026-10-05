import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8980359347:AAGaK5wAforV3BqUBw7wN8CDgjQ7GoPv77Q';
const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://euzkujcpumwlyhpokkjp.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1emt1amNwdW13bHlocG9ra2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTA0MTAsImV4cCI6MjEwNjY4NjQxMH0.zwTra2QeTA3OiJ7J7x63pHm_0lPwl59bgKMwrP1iK1M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// Helper: Strip redundant prefixes like "Title:", "Author:", "Year:", "Note:"
function cleanField(val: string): string {
  return val
    .replace(/^(title|author|year|note|link|color|text|category|source|url):\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let update = req.body;
    if (typeof update === 'string') {
      try {
        update = JSON.parse(update);
      } catch {
        update = {};
      }
    }
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
            read_time: `${Math.max(1, Math.ceil(rawContent.split(/\s+/).length / 200))} min read`,
            category: 'Essays & Writings',
            excerpt,
            content: bodyLines.join('\n'),
          };

          await supabase.from('writings').upsert(newArticle);

          await sendTelegramReply(
            chatId,
            `✅ *Successfully published Markdown essay to Writings!*\n\n` +
            `*Title:* ${newArticle.title}\n` +
            `*Read Time:* ${newArticle.read_time}\n` +
            `*Slug:* /writings#${newArticle.slug}\n\n` +
            `_File processed: ${fileName}_`
          );

          return res.status(200).json({ ok: true, action: 'publish_article', data: newArticle });
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. /help or /start COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text === '/help' || text === '/start') {
      const helpMessage =
        `✨ *Vansh Portfolio Admin Bot*\n\n` +
        `*Commands:*\n` +
        `📚 */addbook* - Add a book to 2.5D bookshelf\n` +
        `📑 */addessay* - Add essay, report, or video link\n` +
        `🚀 */addproject* - Add completed portfolio project\n` +
        `📄 *Attach any .md or .txt file* to publish articles directly!\n\n` +
        `*Examples:*\n` +
        `\`/addbook Sapiens | Yuval Noah Harari | 2011 | Cognitive revolutions shaped civilization\`\n\n` +
        `\`/addessay The Bitter Lesson | https://incompleteideas.net | Article | Rich Sutton\`\n\n` +
        `\`/addproject Sahi Rasta | Full Stack Web | Career guidance platform built and acquired | https://sahirasta.com | https://github.com\``;

      await sendTelegramReply(chatId, helpMessage);
      return res.status(200).json({ ok: true });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. /addbook or /book COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text.startsWith('/addbook') || text.startsWith('/book')) {
      const payload = text.replace(/^\/(?:addbook|book)/, '').trim();

      let title = 'Untitled Book';
      let author = 'Unknown Author';
      let year = String(new Date().getFullYear());
      let note = 'Personal library collection.';
      let link = '';
      let c = '#18181b';
      let fg = '#ffffff';

      if (payload.includes('|')) {
        const parts = payload.split('|').map((p) => p.trim());
        if (parts[0]) title = cleanField(parts[0]);
        if (parts[1]) author = cleanField(parts[1]);
        if (parts[2]) year = cleanField(parts[2]);
        if (parts[3]) note = cleanField(parts[3]);
        if (parts[4]) link = cleanField(parts[4]);
      } else {
        const lines = payload.split('\n');
        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.startsWith('title:')) title = cleanField(line);
          else if (lower.startsWith('author:')) author = cleanField(line);
          else if (lower.startsWith('year:')) year = cleanField(line);
          else if (lower.startsWith('note:')) note = cleanField(line);
          else if (lower.startsWith('link:')) link = cleanField(line);
          else if (lower.startsWith('color:')) c = cleanField(line);
          else if (lower.startsWith('text:')) fg = cleanField(line);
        }
      }

      const newBook = {
        id: `b-${Date.now()}`,
        title,
        author,
        year,
        note,
        link: link || null,
        h: Math.floor(Math.random() * 35 + 205),
        w: Math.floor(Math.random() * 10 + 36),
        c,
        fg,
      };

      // Write directly to Supabase
      const { error: dbError } = await supabase.from('books').upsert(newBook);
      if (dbError) {
        console.error('Supabase insert error:', dbError);
      }

      await sendTelegramReply(
        chatId,
        `📚 *Book Added to Bookshelf!*\n\n` +
        `*Title:* ${newBook.title}\n` +
        `*Author:* ${newBook.author} (${newBook.year})\n` +
        `*Note:* "${newBook.note}"\n` +
        (newBook.link ? `*Link:* [Amazon Link](${newBook.link})\n` : '') +
        `\n_Saved in Supabase & synced live across portfolio._`
      );

      return res.status(200).json({ ok: true, action: 'add_book', data: newBook });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. /addessay or /essay COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text.startsWith('/addessay') || text.startsWith('/essay') || text.startsWith('/addvideo')) {
      const payload = text.replace(/^\/(?:addessay|essay|addvideo)/, '').trim();
      const parts = payload.split('|').map((p) => p.trim());

      const title = cleanField(parts[0] || 'Untitled Essay');
      const url = cleanField(parts[1] || 'https://github.com');
      const type = cleanField(parts[2] || (text.startsWith('/addvideo') ? 'Video' : 'Essay'));
      const source = cleanField(parts[3] || 'Web Archive');
      const cap = cleanField(parts[4] || source);

      const newEssay = {
        id: `e-${Date.now()}`,
        title,
        url,
        type,
        source,
        year: String(new Date().getFullYear()),
        cap,
      };

      await supabase.from('essays').upsert(newEssay);

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

    // ─────────────────────────────────────────────────────────────
    // 5. /addproject or /project COMMAND
    // ─────────────────────────────────────────────────────────────
    if (text.startsWith('/addproject') || text.startsWith('/project')) {
      const payload = text.replace(/^\/(?:addproject|project)/, '').trim();
      const parts = payload.split('|').map((p) => p.trim());

      const title = cleanField(parts[0] || 'Untitled Project');
      const category = cleanField(parts[1] || 'Web Development');
      const description = cleanField(parts[2] || 'Project description and overview.');
      const live_url = cleanField(parts[3] || '');
      const github_url = cleanField(parts[4] || '');
      const video_url = cleanField(parts[5] || '');
      const image_url = cleanField(parts[6] || '');

      const newProj = {
        id: `proj-${Date.now()}`,
        title,
        category,
        description,
        live_url: live_url || null,
        github_url: github_url || null,
        video_url: video_url || null,
        image_url: image_url || null,
        tags: [category, 'Web', 'Design'],
        status: 'Completed',
        sort_order: 0,
      };

      await supabase.from('portfolio_projects').upsert(newProj);

      await sendTelegramReply(
        chatId,
        `🚀 *Portfolio Project Added!*\n\n` +
        `*Title:* ${newProj.title}\n` +
        `*Category:* ${newProj.category}\n` +
        `*Description:* ${newProj.description}\n` +
        (newProj.live_url ? `*Live:* ${newProj.live_url}\n` : '') +
        (newProj.video_url ? `*Video:* ${newProj.video_url}\n` : '') +
        `\n_Saved in Supabase and published on portfolio!_`
      );

      return res.status(200).json({ ok: true, action: 'add_project', data: newProj });
    }

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
