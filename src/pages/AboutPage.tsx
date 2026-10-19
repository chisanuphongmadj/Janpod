import { useState } from 'react'
import { team, techStack, type TeamMember } from '../data/team'
import PageHeader from '../components/PageHeader'
import { ExternalIcon } from '../components/icons'

const colorClasses: Record<TeamMember['color'], { avatar: string; badge: string }> = {
  primary: { avatar: 'bg-primary text-primary-content', badge: 'badge-primary' },
  secondary: { avatar: 'bg-secondary text-secondary-content', badge: 'badge-secondary' },
  accent: { avatar: 'bg-accent text-accent-content', badge: 'badge-accent' },
}

const endpoints: { path: string; use: string }[] = [
  { path: 'search.php?s={name}', use: 'Search recipes by name (Home)' },
  { path: 'categories.php', use: 'List of categories (Home)' },
  { path: 'filter.php?c={category}', use: 'Recipes in a category (Home)' },
  { path: 'lookup.php?i={id}', use: 'Recipe details (Detail, My Recipes)' },
  { path: 'random.php', use: 'One random recipe (Random)' },
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
        <h2 className="text-xl font-bold">Data Source (API Attribution)</h2>
        <p className="mt-2 text-base-content/80">
          All recipes, photos and ingredients come from{' '}
          <a href="https://www.themealdb.com" target="_blank" rel="noreferrer" className="link link-primary font-semibold">
            TheMealDB
          </a>
          , a free public REST API (JSON). This project uses the test API key “1” for development.
        </p>
        <a
          href="https://www.themealdb.com/api.php"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm mt-4 rounded-full"
        >
          <ExternalIcon className="size-4" /> API docs: themealdb.com/api.php
        </a>

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
              Stores only <code className="font-mono">favoriteIds</code> in LocalStorage, plus the Home page filters.
              Server data is never duplicated here.
            </p>
          </div>
          <div className="rounded-box border border-accent/40 p-5">
            <p className="badge badge-accent">Server State</p>
            <h3 className="mt-2 font-bold">TanStack Query v5</h3>
            <p className="mt-1 text-sm text-base-content/70">
              Fetches from TheMealDB, caches by query key (search / category / id) with a 5-minute staleTime, and
              handles isLoading / isError / refetch.
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
