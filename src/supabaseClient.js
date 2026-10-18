import { createClient } from '@supabase/supabase-js'

// .envからSupabaseの接続情報を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabaseの環境変数が設定されていません。.envを確認してください。')
}

// アプリ全体で共有するSupabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseKey)
