/** Static team data for the About page (no API call) — edit names/photos here */
export interface TeamMember {
  studentId: string
  fullName: string
  nickname: string
  /** Put the photo at public/team/<studentId>.jpg (falls back to the initial if missing) */
  photo: string
  initial: string
  color: 'primary' | 'secondary' | 'accent'
  responsibilities: string[]
}

export const team: TeamMember[] = [
  {
    studentId: '1660707173',
    fullName: 'ดำรงค์ สว่างวงศ์',
    nickname: 'ปู',
    photo: '/team/1660707173.jpg',
    initial: 'ด',
    color: 'primary',
    responsibilities: ['Front-End / UI', 'Page design & responsive layout', 'Tailwind CSS + DaisyUI'],
  },
  {
    studentId: '1660707306',
    fullName: 'ชิษณุพงศ์ มัดจุปะ',
    nickname: 'เตอร์',
    photo: '/team/1660707306.jpg',
    initial: 'ช',
    color: 'secondary',
    responsibilities: [
      'TheMealDB integration with TanStack Query',
      'Zustand store + persist',
      'TypeScript types for the API',
    ],
  },
  {
    studentId: '1660707884',
    fullName: 'พงศภัค สงวนสุทธิ์',
    nickname: 'เติ้ล',
    photo: '/team/1660707884.jpg',
    initial: 'พ',
    color: 'accent',
    responsibilities: ['Documentation', 'Testing', 'Deployment'],
  },
]

export const techStack: { name: string; url: string }[] = [
  { name: 'React 19', url: 'https://react.dev' },
  { name: 'Vite', url: 'https://vite.dev' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
  { name: 'React Router v7', url: 'https://reactrouter.com' },
  { name: 'Zustand', url: 'https://zustand.docs.pmnd.rs' },
  { name: 'TanStack Query v5', url: 'https://tanstack.com/query/latest' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'DaisyUI', url: 'https://daisyui.com' },
]
