import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://npkmkwengvdndstpdhqu.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa21rd2VuZ3ZkbmRzdHBkaHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDY0MzksImV4cCI6MjA3MDQ4MjQzOX0.HWKU3XiMZX2jF9J58NpKgqcP80P_GghTCXvW40T2Ul8';

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  // 在开发环境提示方便排查（不会中断运行）
  // eslint-disable-next-line no-console
  console.warn('未检测到 .env.local 中的 Supabase 环境变量，已使用代码中的后备值。建议在 youling/.env.local 配置 REACT_APP_SUPABASE_URL 与 REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;

