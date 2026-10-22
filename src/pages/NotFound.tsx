import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { Button } from '../components/ui/Button'

export function NotFound() {
  const { d } = useI18n()
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="gs-number text-6xl font-bold text-gs-cyan/30">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gs-ice">{d.notFound.title}</h1>
      <p className="mt-2 text-sm text-gs-mist">{d.notFound.body}</p>
      <Link to="/" className="mt-6">
        <Button variant="primary">{d.notFound.back}</Button>
      </Link>
    </div>
  )
}
