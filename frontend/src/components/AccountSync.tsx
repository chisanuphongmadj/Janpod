import { useState, type FormEvent } from 'react'
import { useIdentify } from '../hooks/useFavorites'
import { useSessionStore } from '../store/sessionStore'

/**
 * ระบุตัวตนแบบง่ายด้วยอีเมล (ไม่มีรหัสผ่าน) เพื่อใช้ "สูตรของฉัน" ที่เก็บในฐานข้อมูล
 * POST /api/users/identify — มีอีเมลนี้แล้วคืนผู้ใช้เดิม ถ้ายังไม่มีสร้างใหม่
 */
export default function AccountSync() {
  const user = useSessionStore((state) => state.user)
  const signOut = useSessionStore((state) => state.signOut)
  const identify = useIdentify()
  const [email, setEmail] = useState('')

  if (user) {
    return (
      <div className="alert mb-6 flex flex-wrap justify-between border border-base-300 bg-base-100">
        <span>
          Signed in as <strong>{user.email}</strong>
        </span>
        <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={signOut}>
          Sign out
        </button>
      </div>
    )
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    identify.mutate(email)
  }

  return (
    <form onSubmit={onSubmit} className="card mb-6 gap-3 border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center">
      <p className="text-sm sm:flex-1">Enter your email to see and save your recipes. No password needed.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="input input-bordered input-sm rounded-full sm:w-64"
        aria-label="Email"
      />
      <button type="submit" className="btn btn-primary btn-sm rounded-full" disabled={identify.isPending}>
        {identify.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Continue'}
      </button>
      {identify.isError && <p className="text-sm text-error">{identify.error.message}</p>}
    </form>
  )
}
