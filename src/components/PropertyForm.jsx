import { useState } from 'react'

// 空のフォームの初期値
const EMPTY = { name: '', rent: '', area: '', layout: '' }

// 物件の新規登録・編集で共通利用するフォーム
// initialValues が渡された場合は編集モードとして表示する
export default function PropertyForm({ initialValues, onSubmit, onCancel }) {
  const isEdit = Boolean(initialValues)
  const [values, setValues] = useState(
    isEdit
      ? { name: initialValues.name, rent: String(initialValues.rent), area: initialValues.area, layout: initialValues.layout }
      : EMPTY
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 入力値を整形（前後の空白を除去し、家賃は数値に変換）
    const payload = {
      name: values.name.trim(),
      rent: Number(values.rent),
      area: values.area.trim(),
      layout: values.layout.trim().toUpperCase(),
    }
    if (!payload.name || !payload.area || !payload.layout) {
      setError('すべての項目を入力してください。')
      return
    }
    if (!Number.isInteger(payload.rent) || payload.rent < 0) {
      setError('家賃は0以上の整数で入力してください。')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setError('保存に失敗しました：' + err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <h2>{isEdit ? '物件を編集' : '物件を新規登録'}</h2>
      <div className="property-form-fields">
        <label>
          物件名
          <input name="name" value={values.name} onChange={handleChange} maxLength={100} required />
        </label>
        <label>
          家賃（円）
          <input name="rent" type="number" min="0" step="1" value={values.rent} onChange={handleChange} required />
        </label>
        <label>
          エリア名
          <input name="area" value={values.area} onChange={handleChange} maxLength={100} placeholder="例：東京都渋谷区" required />
        </label>
        <label>
          間取り
          <input name="layout" value={values.layout} onChange={handleChange} maxLength={20} placeholder="例：1LDK" required />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="property-form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}
