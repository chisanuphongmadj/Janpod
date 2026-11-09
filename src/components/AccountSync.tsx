import { useState, type FormEvent } from 'react'
import { syncEnabled, useFavoritesStore } from '../store/favoritesStore'

/**
 * ระบุตัวตนแบบง่ายด้วยอีเมล (ไม่มีรหัสผ่าน) เพื่อบันทึก "สูตรของฉัน" ลงฐานข้อมูล
 * แสดงเฉพาะเมื่อตั้งค่า VITE_API_URL (มี Backend)
 */
export default function AccountSync() {
  const user = useFavoritesStore((state) => state.user)
  const identify = useFavoritesStore((state) => state.identify)
  const signOut = useFavoritesStore((state) => state.signOut)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  if (!syncEnabled) return null

  if (user) {
    return (
      <div className="alert mb-6 flex flex-wrap justify-between border border-base-300 bg-base-100">
        <span>
          Synced to database as <strong>{user.email}</strong>
        </span>
        <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={signOut}>
          Sign out
        </button>
      </div>
    )
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    try {
      await identify(email)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mb-6 gap-3 border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center">
      <p className="text-sm sm:flex-1">Enter your email to keep My Recipes in the database and use them on any device.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="input input-bordered input-sm rounded-full sm:w-64"
        aria-label="Email"
      />
      <button type="submit" className="btn btn-primary btn-sm rounded-full" disabled={status === 'loading'}>
        {status === 'loading' ? <span className="loading loading-spinner loading-xs" /> : 'Sync'}
      </button>
      {status === 'error' && <p className="text-sm text-error">{error}</p>}
    </form>
  )
}
