import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// 会員登録画面
export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Supabaseのデフォルトではパスワードは6文字以上が必要
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }

    setSubmitting(true)
    // メールアドレスとパスワードで会員登録
    const { data, error } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)

    if (error) {
      setError('会員登録に失敗しました：' + error.message)
      return
    }

    if (data.session) {
      // メール確認が無効な設定の場合はそのままログイン状態になる
      navigate('/properties', { replace: true })
    } else {
      // メール確認が有効な場合は確認メールの案内を表示
      setMessage('確認メールを送信しました。メール内のリンクをクリックしてからログインしてください。')
    }
  }

  return (
    <div className="auth-container">
      <h1>会員登録</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          パスワード（6文字以上）
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '会員登録'}
        </button>
      </form>
      <p className="switch-link">
        すでにアカウントをお持ちの方は <Link to="/login">ログイン</Link>
      </p>
    </div>
  )
}
