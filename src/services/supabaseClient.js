import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请在 .env.local 中配置 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
}

// 验证配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置错误：URL 或 Key 为空');
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 测试 Supabase 连接的辅助函数
export const testSupabaseConnection = async () => {
  try {
    // 尝试一个简单的查询来测试连接
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 连接测试失败:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase 连接正常');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Supabase 连接测试异常:', err);
    return { success: false, error: err };
  }
};

