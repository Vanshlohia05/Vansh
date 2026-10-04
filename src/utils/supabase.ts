import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://euzkujcpumwlyhpokkjp.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1emt1amNwdW13bHlocG9ra2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTA0MTAsImV4cCI6MjEwNjY4NjQxMH0.zwTra2QeTA3OiJ7J7x63pHm_0lPwl59bgKMwrP1iK1M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
