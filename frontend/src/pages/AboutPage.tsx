import { useState } from 'react'
import { team, techStack, type TeamMember } from '../data/team'
import PageHeader from '../components/PageHeader'

const colorClasses: Record<TeamMember['color'], { avatar: string; badge: string }> = {
  primary: { avatar: 'bg-primary text-primary-content', badge: 'badge-primary' },
  secondary: { avatar: 'bg-secondary text-secondary-content', badge: 'badge-secondary' },
  accent: { avatar: 'bg-accent text-accent-content', badge: 'badge-accent' },
}

const endpoints: { path: string; use: string }[] = [
  { path: 'GET /api/meals?search=&category=', use: 'Search and filter recipes (Home)' },
  { path: 'GET /api/categories', use: 'List of categories (Home)' },
  { path: 'GET /api/meals/:id', use: 'Recipe details with ingredients (Detail)' },
  { path: 'GET /api/meals/random', use: 'One random recipe (Random)' },
  { path: 'POST /api/users/identify', use: 'Sign in with email (My Recipes)' },
  { path: 'GET · POST /api/users/:id/favorites', use: 'Read / add saved recipes (My Recipes)' },
  { path: 'PATCH · DELETE /api/users/:id/favorites/:mealId', use: 'Edit note / remove a recipe (My Recipes)' },
]

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <PageHeader title="Meet the Team" subtitle="Team Janpod · Mini Project 2" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <MemberCard key={member.studentId} member={member} />
          ))}
        </div>
      </section>

      <section className="rounded-box bg-base-200 p-6">
        <h2 className="text-xl font-bold">Full-Stack Architecture</h2>
        <p className="mt-2 text-base-content/80">
          Every recipe, category, ingredient and saved recipe comes from our own RESTful API
          (Express + Prisma ORM) backed by a Supabase PostgreSQL database. The frontend never calls an outside API.
          Sample data was split into tables and loaded with <code className="font-mono">prisma/seed.ts</code>.
        </p>

        <div className="mt-5 overflow-x-auto rounded-box bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Used for</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.path}>
                  <td className="font-mono text-sm whitespace-nowrap text-accent">{e.path}</td>
                  <td>{e.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noreferrer"
              className="badge badge-lg badge-neutral gap-1 py-4 hover:badge-primary"
            >
              {tech.name}
            </a>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-box border border-secondary/40 p-5">
            <p className="badge badge-secondary">Client State</p>
            <h3 className="mt-2 font-bold">Zustand + persist</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Stores only the signed-in user (email) in LocalStorage, plus the Home page filters.
              Server data is never duplicated here.
            </p>
          </div>
          <div className="rounded-box border border-accent/40 p-5">
            <p className="badge badge-accent">Server State</p>
            <h3 className="mt-2 font-bold">TanStack Query v5</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Fetches from the Janpod backend, caches by query key (search / category / id / user), and runs
              optimistic mutations for My Recipes (create, update note, delete).
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function MemberCard({ member }: { member: TeamMember }) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const colors = colorClasses[member.color]

  return (
    <article className="card border border-base-300 bg-base-100">
      <div className="card-body items-center text-center">
        <div className="avatar">
          <div className={`flex! size-28 items-center justify-center rounded-full text-4xl font-extrabold ${colors.avatar}`}>
            {photoFailed ? (
              member.initial
            ) : (
              <img src={member.photo} alt={`Photo of ${member.fullName}`} className="size-full object-cover" onError={() => setPhotoFailed(true)} />
            )}
          </div>
        </div>
        <h3 className="mt-2 text-lg font-bold">{member.fullName}</h3>
        <p className="text-sm text-base-content/70">
          Nickname: {member.nickname} · ID <span className="font-mono">{member.studentId}</span>
        </p>
        <p className={`badge ${colors.badge} mt-2`}>Responsibilities</p>
        <ul className="space-y-1 text-sm">
          {member.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
