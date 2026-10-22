import { useCallback, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode, SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { fillTemplate } from '../../sim/core/format'
import type { FieldError } from '../../sim/core/fieldError'
import { methodById, type MethodId } from '../../content/methods'
import { Badge } from '../ui/Badge'
import { Panel } from '../ui/Card'

/* ------------------------------------------------------------------ */
/* Generic forward-run state (shared by all four Phase-2 workspaces)   */
/* ------------------------------------------------------------------ */

export interface ForwardStateApi<TInput, TResult, S extends string> {
  input: TInput
  result: TResult | null
  errors: FieldError[]
  dirty: boolean
  scenarioId: S
  scenarioIds: S[]
  setInput: (updater: SetStateAction<TInput>) => void
  loadScenario: (id: S) => void
  run: () => void
  resetModel: () => void
}

export function useForwardState<TInput, TResult, S extends string>(opts: {
  scenarios: Array<{ id: S }>
  initialScenario: S
  scenarioInput: (id: S) => TInput
  validate: (input: TInput) => FieldError[]
  run: (input: TInput) => TResult
  clone: (input: TInput) => TInput
}): ForwardStateApi<TInput, TResult, S> {
  const { scenarios, initialScenario, scenarioInput, validate, run: runSolver, clone } = opts
  const [scenarioId, setScenarioId] = useState<S>(initialScenario)
  const [input, setInput] = useState<TInput>(() => scenarioInput(initialScenario))
  const [result, setResult] = useState<TResult | null>(null)
  const [lastRunJson, setLastRunJson] = useState<string | null>(null)

  const errors = useMemo(() => validate(input), [input, validate])
  const inputJson = useMemo(() => JSON.stringify(input), [input])
  const dirty = result !== null && lastRunJson !== inputJson
  const scenarioIds = useMemo(() => scenarios.map((s) => s.id), [scenarios])

  const loadScenario = useCallback(
    (id: S) => {
      setScenarioId(id)
      setInput(scenarioInput(id))
      setLastRunJson(null)
      setResult(null)
    },
    [scenarioInput],
  )

  const run = useCallback(() => {
    if (validate(input).length > 0) return
    try {
      const res = runSolver(clone(input))
      setResult(res)
      setLastRunJson(JSON.stringify(input))
    } catch {
      setResult(null)
    }
  }, [input, validate, runSolver, clone])

  const resetModel = useCallback(() => {
    setInput(scenarioInput(scenarioId))
    setLastRunJson(null)
    setResult(null)
  }, [scenarioId, scenarioInput])

  return { input, result, errors, dirty, scenarioId, scenarioIds, setInput, loadScenario, run, resetModel }
}

/* ------------------------------------------------------------------ */
/* Error resolution across shared + method dictionaries                */
/* ------------------------------------------------------------------ */

export function makeWsErrorResolver(dict: Record<string, string>, shared: Record<string, string>, errors: FieldError[]) {
  return (path: string): string | undefined => {
    const e = errors.find((x) => x.path === path)
    if (!e) return undefined
    const template = dict[e.key] ?? shared[e.key] ?? e.key
    return fillTemplate(template, e.params ?? {})
  }
}

export function useWsErrorFor(errors: FieldError[], dict: Record<string, string>) {
  const { d } = useI18n()
  return useMemo(() => makeWsErrorResolver(dict, d.wshared.errors as unknown as Record<string, string>, errors), [dict, d, errors])
}

export function WsErrorList({ errors, dict }: { errors: FieldError[]; dict: Record<string, string> }) {
  const { d } = useI18n()
  if (errors.length === 0) return null
  const shared = d.wshared.errors as unknown as Record<string, string>
  return (
    <div className="rounded-lg border border-gs-danger/40 bg-gs-danger/8 px-3 py-2">
      <p className="text-[11px] font-semibold text-gs-danger">
        {d.common.errorsTitle} ({errors.length})
      </p>
      <ul className="mt-1 space-y-0.5">
        {errors.slice(0, 8).map((e, i) => (
          <li key={`${e.path}-${i}`} className="gs-number text-[10.5px] text-gs-danger/90">
            {e.path} — {fillTemplate(dict[e.key] ?? shared[e.key] ?? e.key, e.params ?? {})}
          </li>
        ))}
        {errors.length > 8 && <li className="text-[10.5px] text-gs-danger/80">…</li>}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Workspace shell                                                     */
/* ------------------------------------------------------------------ */

interface WorkspaceShellProps {
  methodId: MethodId
  badge: string
  title: string
  subtitle: string
  solverNote: string
  toolbar: ReactNode
  status?: ReactNode
  left: ReactNode
  right: ReactNode
  bottom?: ReactNode
}

export function WorkspaceShell({ methodId, badge, title, subtitle, solverNote, toolbar, status, left, right, bottom }: WorkspaceShellProps) {
  const { d } = useI18n()
  const meta = methodById(methodId)
  const info = d.methods.list[methodId]
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <nav className="mb-4 flex items-center gap-2 text-xs text-gs-mist" aria-label="Breadcrumb">
        <Link to="/simulator" className="transition-colors hover:text-gs-cyan">
          {d.wshared.breadcrumb}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gs-ice">{info.abbr}</span>
      </nav>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gs-ice">{title}</h1>
          <Badge soft color={meta.accent}>
            {badge}
          </Badge>
        </div>
        <p className="mt-1.5 max-w-4xl text-sm leading-relaxed text-gs-mist">{subtitle}</p>
        <p className="mt-2 max-w-4xl text-[11px] leading-relaxed text-gs-mist/85">{solverNote}</p>
      </header>

      <Panel compact className="mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          {toolbar}
          {status && <span className="ml-auto text-[11px]">{status}</span>}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="space-y-5">{left}</div>
        <div className="space-y-5">{right}</div>
      </div>

      {bottom && <div className="mt-6 space-y-5">{bottom}</div>}
    </div>
  )
}

export function StatusText({ result, dirty }: { result: unknown | null; dirty: boolean }) {
  const { d } = useI18n()
  if (!result) return null
  return dirty ? <span className="text-gs-amber">{d.wshared.stale}</span> : <span className="text-gs-teal">{d.wshared.current}</span>
}

export function WsWarningList({ warnings, dict }: { warnings: Array<{ key: string; params: Record<string, string | number> }>; dict: Record<string, string> }) {
  const { d } = useI18n()
  if (warnings.length === 0) return null
  const shared = d.wshared.errors as unknown as Record<string, string>
  return (
    <div className="rounded-lg border border-gs-amber/40 bg-gs-amber/8 px-3 py-2">
      <p className="text-[11px] font-semibold text-gs-amber">
        {d.common.warningsTitle} ({warnings.length})
      </p>
      <ul className="mt-1 space-y-0.5">
        {warnings.map((w, i) => (
          <li key={`${w.key}-${i}`} className="text-[10.5px] leading-relaxed text-gs-amber/90">
            {fillTemplate(dict[w.key] ?? shared[w.key] ?? w.key, w.params)}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Small shared row helpers                                            */
/* ------------------------------------------------------------------ */

export function FieldRows({ children, cols = 2, className = '' }: { children: ReactNode; cols?: 1 | 2 | 3; className?: string }) {
  const cls = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3'
  return <div className={`grid gap-3 ${cls} ${className}`}>{children}</div>
}

export function accentStyle(accent: string): CSSProperties {
  return { color: accent }
}
