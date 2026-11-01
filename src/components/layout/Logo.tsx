import { Link } from 'react-router-dom'
import { site } from '../../content/site'
import mark1xUrl from '../../assets/brand/kawruhbhumi-mark-1x.png'
import mark2xUrl from '../../assets/brand/kawruhbhumi-mark-2x.png'
import mark3xUrl from '../../assets/brand/kawruhbhumi-mark-3x.png'
import markUrl from '../../assets/brand/kawruhbhumi-mark.png'
import wordmark1xUrl from '../../assets/brand/kawruhbhumi-wordmark-1x.png'
import wordmark2xUrl from '../../assets/brand/kawruhbhumi-wordmark-2x.png'
import wordmark3xUrl from '../../assets/brand/kawruhbhumi-wordmark-3x.png'
import wordmarkUrl from '../../assets/brand/kawruhbhumi-wordmark.png'

const markSrcSet = `${mark1xUrl} 1x, ${mark2xUrl} 2x, ${mark3xUrl} 3x, ${markUrl} 4x`
const wordmarkSrcSet = `${wordmark1xUrl} 1x, ${wordmark2xUrl} 2x, ${wordmark3xUrl} 3x, ${wordmarkUrl} 4x`

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5"
      aria-label={`${site.brand.name} — home`}
    >
      <img
        src={markUrl}
        srcSet={markSrcSet}
        alt=""
        width={28}
        height={36}
        decoding="async"
        className="h-9 w-auto shrink-0 transition-opacity group-hover:opacity-85"
      />
      {!compact && (
        <img
          src={wordmarkUrl}
          srcSet={wordmarkSrcSet}
          alt=""
          width={140}
          height={15}
          decoding="async"
          className="h-[15px] w-auto shrink-0 transition-opacity group-hover:opacity-85"
        />
      )}
    </Link>
  )
}
