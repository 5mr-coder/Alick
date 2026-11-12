import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gilkrrxkybalasmbbpky.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbGtycnhreWJhbGFzbWJicGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMjQyOTUsImV4cCI6MjEwMzcwMDI5NX0.Me0bjnC-rLIw1Mzw5IXzTwfWMfR_-UwjJ7cLPTt5h5s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

