import { Link } from 'react-router-dom'
import { site } from '../../content/site'
import markUrl from '../../assets/brand/kawruhbhumi-mark.png'
import wordmarkUrl from '../../assets/brand/kawruhbhumi-wordmark.png'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5"
      aria-label={`${site.brand.name} — home`}
    >
      <img
        src={markUrl}
        alt=""
        width={224}
        height={294}
        className="h-9 w-auto shrink-0 transition-opacity group-hover:opacity-85"
      />
      {!compact && (
        <img
          src={wordmarkUrl}
          alt=""
          width={711}
          height={76}
          className="h-[15px] w-auto shrink-0 transition-opacity group-hover:opacity-85"
        />
      )}
    </Link>
  )
}
