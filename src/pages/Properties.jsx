import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../api/properties'
import PropertyForm from '../components/PropertyForm'

// 家賃の選択肢（円）
const RENT_OPTIONS = [50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000]

// 絞り込み条件の初期値
const INITIAL_FILTERS = { keyword: '', minRent: '', maxRent: '', area: '', layout: '' }

// 配列から重複を除いて並べ替えた選択肢を作る
const uniqueSorted = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b, 'ja'))

// 物件一覧画面（ログイン必須）
export default function Properties() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  // 新規登録フォームの表示状態
  const [creating, setCreating] = useState(false)
  // 編集中の物件ID（未編集時はnull）
  const [editingId, setEditingId] = useState(null)

  // 画面表示時にSupabaseから物件一覧を取得
  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((err) => setLoadError('物件の取得に失敗しました：' + err.message))
      .finally(() => setLoading(false))
  }, [])

  // ログアウト処理（認証状態の変化によりログイン画面へリダイレクトされる）
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // 新規登録：保存後、一覧の先頭に追加
  const handleCreate = async (values) => {
    const created = await createProperty(user.id, values)
    setProperties((prev) => [created, ...prev])
    setCreating(false)
  }

  // 更新：保存後、一覧の該当物件を差し替え
  const handleUpdate = async (id, values) => {
    const updated = await updateProperty(id, values)
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setEditingId(null)
  }

  // 削除：確認ダイアログの後に削除し、一覧から除外
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
    } catch (err) {
      window.alert('削除に失敗しました：' + err.message)
    }
  }

  // 入力された絞り込み条件をstateに反映
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  // エリア・間取りの選択肢は登録済みの物件から作成
  const areaOptions = uniqueSorted(properties.map((p) => p.area))
  const layoutOptions = uniqueSorted(properties.map((p) => p.layout))

  // 条件に合う物件だけを抽出（未指定の条件は無視する）
  const filtered = properties.filter((p) => {
    const keyword = filters.keyword.trim()
    if (keyword && !p.name.includes(keyword) && !p.area.includes(keyword)) return false
    if (filters.minRent && p.rent < Number(filters.minRent)) return false
    if (filters.maxRent && p.rent > Number(filters.maxRent)) return false
    if (filters.area && p.area !== filters.area) return false
    if (filters.layout && p.layout !== filters.layout) return false
    return true
  })

  return (
    <div className="properties-page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="secondary-button">ログアウト</button>
        </div>
      </header>

      {/* 新規登録フォーム（ボタンで開閉） */}
      {creating ? (
        <div className="panel">
          <PropertyForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      ) : (
        <button className="new-button" onClick={() => setCreating(true)}>＋ 物件を新規登録</button>
      )}

      {/* 絞り込みフォーム */}
      <div className="filter-panel">
        <label>
          キーワード
          <input name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="物件名・エリア" />
        </label>
        <label>
          家賃（下限）
          <select name="minRent" value={filters.minRent} onChange={handleFilterChange}>
            <option value="">指定なし</option>
            {RENT_OPTIONS.map((r) => (
              <option key={r} value={r}>{r / 10000}万円以上</option>
            ))}
          </select>
        </label>
        <label>
          家賃（上限）
          <select name="maxRent" value={filters.maxRent} onChange={handleFilterChange}>
            <option value="">指定なし</option>
            {RENT_OPTIONS.map((r) => (
              <option key={r} value={r}>{r / 10000}万円以下</option>
            ))}
          </select>
        </label>
        <label>
          エリア
          <select name="area" value={filters.area} onChange={handleFilterChange}>
            <option value="">すべて</option>
            {areaOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          間取り
          <select name="layout" value={filters.layout} onChange={handleFilterChange}>
            <option value="">すべて</option>
            {layoutOptions.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary-button" onClick={() => setFilters(INITIAL_FILTERS)}>
          条件をクリア
        </button>
      </div>

      {/* 読み込み中・エラー・0件・一覧の表示切り替え */}
      {loading ? (
        <p className="no-result">読み込み中...</p>
      ) : loadError ? (
        <p className="error">{loadError}</p>
      ) : properties.length === 0 ? (
        <p className="no-result">まだ物件が登録されていません。「物件を新規登録」から追加してください。</p>
      ) : (
        <>
          <p className="result-count">{filtered.length}件 / 全{properties.length}件</p>
          {filtered.length === 0 ? (
            <p className="no-result">条件に合う物件がありません。</p>
          ) : (
            <div className="card-grid">
              {filtered.map((p) =>
                editingId === p.id ? (
                  // 編集中の物件はカードの代わりに編集フォームを表示
                  <div key={p.id} className="card">
                    <PropertyForm
                      initialValues={p}
                      onSubmit={(values) => handleUpdate(p.id, values)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div key={p.id} className="card">
                    <div className="card-header">
                      <h2 className="card-title">{p.name}</h2>
                      <span className="card-layout">{p.layout}</span>
                    </div>
                    {/* 家賃は3桁区切りで表示 */}
                    <p className="card-rent">家賃：{p.rent.toLocaleString('ja-JP')}円 / 月</p>
                    <p className="card-area">エリア：{p.area}</p>
                    <div className="card-actions">
                      <button className="secondary-button" onClick={() => setEditingId(p.id)}>編集</button>
                      <button className="danger-button" onClick={() => handleDelete(p)}>削除</button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
