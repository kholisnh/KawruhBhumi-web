import { Component, Suspense, useEffect, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

function PageLoader() {
  const { d } = useI18n()
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-gs-mist">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gs-cyan/30 border-t-gs-cyan" aria-hidden />
      {d.common.loadingPlot}
    </div>
  )
}

interface ErrorBoundaryState {
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-lg font-semibold text-gs-ice">Something went wrong / Terjadi kesalahan</h1>
          <p className="mt-2 text-xs break-all text-gs-mist">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-6 rounded-xl border border-black/10 px-4 py-2 text-sm text-gs-ice hover:border-gs-cyan/50"
          >
            Retry / Coba lagi
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/** Scrolls to top on route change, or to a section if navigation carried a target. */
function ScrollManager() {
  const location = useLocation()
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null
    if (state?.scrollTo) {
      const el = document.getElementById(state.scrollTo)
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        window.history.replaceState({}, '')
      }
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [location.pathname, location.state])
  return null
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-gs-cyan focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-gs-navy"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollManager />
    </div>
  )
}
