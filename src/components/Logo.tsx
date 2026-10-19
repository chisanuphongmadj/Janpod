/** โลโก้จานอาหาร (รูปทรงเดียวกับหน้าปกสไลด์) */
export default function Logo({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#D9480F" />
      <circle cx="32" cy="32" r="24" fill="#fff" />
      <circle cx="32" cy="32" r="18" fill="#FBEEE6" />
      <circle cx="32" cy="32" r="9" fill="#F2B035" />
      <circle cx="40" cy="24" r="4" fill="#3E7E3E" />
      <circle cx="24" cy="38" r="3" fill="#8B2E0E" />
    </svg>
  )
}
