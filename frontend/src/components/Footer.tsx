import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="bg-neutral pb-16 text-neutral-content md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-bold text-warning">Janpod</span> · Mini Project 2 · Team Janpod
        </p>
        <p className="text-neutral-content/70">
          Full-Stack: React + Express + Prisma + Supabase{' '}
          · <Link to="/about" className="link link-hover">About the team</Link>
        </p>
      </div>
    </footer>
  )
}
