import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://euzkujcpumwlyhpokkjp.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1emt1amNwdW13bHlocG9ra2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTA0MTAsImV4cCI6MjEwNjY4NjQxMH0.zwTra2QeTA3OiJ7J7x63pHm_0lPwl59bgKMwrP1iK1M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const [booksRes, essaysRes, writingsRes] = await Promise.all([
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('essays').select('*').order('created_at', { ascending: false }),
        supabase.from('writings').select('*').order('created_at', { ascending: false }),
      ]);

      return res.status(200).json({
        books: booksRes.data || [],
        essays: essaysRes.data || [],
        writings: writingsRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const { type, data } = req.body || {};

      if (type === 'book') {
        await supabase.from('books').upsert(data);
      } else if (type === 'essay') {
        await supabase.from('essays').upsert(data);
      } else if (type === 'writing') {
        await supabase.from('writings').upsert(data);
      }

      return res.status(200).json({ success: true, type, data });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Data API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
