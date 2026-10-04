import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://euzkujcpumwlyhpokkjp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// In-memory fallback cache for serverless lifetime
let cachedBooks: any[] = [];
let cachedEssays: any[] = [];
let cachedWritings: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Fetch live data from Supabase or server cache
    if (req.method === 'GET') {
      if (supabase) {
        const [booksRes, essaysRes, writingsRes] = await Promise.all([
          supabase.from('books').select('*').order('created_at', { ascending: false }),
          supabase.from('essays').select('*').order('created_at', { ascending: false }),
          supabase.from('writings').select('*').order('created_at', { ascending: false }),
        ]);

        return res.status(200).json({
          books: booksRes.data || cachedBooks,
          essays: essaysRes.data || cachedEssays,
          writings: writingsRes.data || cachedWritings,
        });
      }

      return res.status(200).json({
        books: cachedBooks,
        essays: cachedEssays,
        writings: cachedWritings,
      });
    }

    // POST: Add new item from Telegram Webhook or Admin Console
    if (req.method === 'POST') {
      const { type, data } = req.body || {};

      if (type === 'book') {
        cachedBooks = [data, ...cachedBooks.filter((b) => b.id !== data.id)];
        if (supabase) {
          await supabase.from('books').upsert(data);
        }
      } else if (type === 'essay') {
        cachedEssays = [data, ...cachedEssays.filter((e) => e.id !== data.id)];
        if (supabase) {
          await supabase.from('essays').upsert(data);
        }
      } else if (type === 'writing') {
        cachedWritings = [data, ...cachedWritings.filter((w) => w.id !== data.id)];
        if (supabase) {
          await supabase.from('writings').upsert(data);
        }
      }

      return res.status(200).json({ success: true, type, data });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Data API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
