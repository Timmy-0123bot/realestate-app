import { supabase } from '../supabaseClient'

// 物件テーブルへのCRUD操作をまとめたモジュール
// ※RLSにより、取得・更新・削除の対象は自動的にログインユーザーの物件に限定される

const TABLE = 'properties'

// 一覧取得（SELECT）：新しく登録した順
export async function fetchProperties() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, rent, area, layout, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// 新規登録（INSERT）：登録者としてログインユーザーのIDを保存
export async function createProperty(userId, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...values, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

// 更新（UPDATE）
export async function updateProperty(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// 削除（DELETE）
export async function deleteProperty(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
