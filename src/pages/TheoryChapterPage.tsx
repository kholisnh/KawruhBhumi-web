import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Equation } from '../components/ui/Equation'
import { METHODS, methodById, type MethodId } from '../content/methods'
import { site, tr } from '../content/site'
import { theoryByMethod, type TheoryBlock } from '../content/theory'
import { useI18n } from '../i18n'

const isMethodId = (value: string | undefined): value is MethodId => METHODS.some((m) => m.id === value)

function Block({ block }: { block: TheoryBlock }) {
  const { lang } = useI18n()
  switch (block.kind) {
    case 'p':
      return <p className="text-[13.5px] leading-[1.85] text-gs-mist">{tr(block.text, lang)}</p>
    case 'section':
      return <h2 className="pt-2 text-lg font-semibold tracking-tight text-gs-ice">{tr(block.title, lang)}</h2>
    case 'eq':
      return (
        <div className="my-1 rounded-xl border border-black/8 bg-gs-panel px-4 py-2">
          <Equation latex={block.latex} caption={block.caption ? tr(block.caption, lang) : undefined} />
        </div>
      )
    case 'list':
      return (
        <ul className="space-y-1.5">
          {block.items.map((item) => (
            <li key={tr(item, lang)} className="flex gap-2 text-[13px] leading-relaxed text-gs-mist">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gs-cyan/70" />
              <span>{tr(item, lang)}</span>
            </li>
          ))}
        </ul>
      )
    case 'note':
      return (
        <aside className="rounded-xl border border-gs-amber/25 bg-gs-amber/5 px-4 py-3">
          <p className="gs-label text-gs-amber">{tr(block.title, lang)}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-gs-mist">{tr(block.text, lang)}</p>
        </aside>
      )
  }
}

export function TheoryChapterPage() {
  const { d, lang } = useI18n()
  const { methodId, chapterId } = useParams()

  if (!isMethodId(methodId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-gs-ice">Method not found</h1>
        <Link to="/teori" className="mt-4 inline-block text-sm font-semibold text-gs-cyan">
          {tr(site.chapterPage.theory, lang)}
        </Link>
      </div>
    )
  }

  const meta = methodById(methodId)
  const info = d.methods.list[methodId]
  const chapters = theoryByMethod[methodId].chapters
  const index = chapters.findIndex((c) => c.id === chapterId)
  const chapter = chapters[index]

  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-gs-ice">Chapter not found</h1>
        <Link to={`/metode/${methodId}`} className="mt-4 inline-block text-sm font-semibold text-gs-cyan">
          {tr(site.methodPage.back, lang)}
        </Link>
      </div>
    )
  }

  const prev = index > 0 ? chapters[index - 1] : null
  const next = index < chapters.length - 1 ? chapters[index + 1] : null
  const methodOrder = METHODS.findIndex((m) => m.id === meta.id)
  const nextMethod = METHODS[(methodOrder + 1) % METHODS.length]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-[11px] text-gs-mist" aria-label="Breadcrumb">
        <Link to="/teori" className="hover:text-gs-cyan">
          {tr(site.chapterPage.theory, lang)}
        </Link>
        <span aria-hidden>/</span>
        <Link to={`/metode/${meta.id}`} className="hover:text-gs-cyan">
          {info.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-gs-ice">{tr(chapter.title, lang)}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-24">
            <Link to={`/metode/${meta.id}`} className="inline-flex items-center gap-2">
              <span
                className="flex h-8 w-10 items-center justify-center rounded-md text-[10px] font-bold tracking-wider"
                style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
              >
                {info.abbr}
              </span>
              <span className="text-xs font-semibold text-gs-ice">{info.name}</span>
            </Link>
            <ol className="mt-4 space-y-1 border-l border-black/10 pl-3">
              {chapters.map((item, i) => (
                <li key={item.id}>
                  <Link
                    to={`/teori/${meta.id}/${item.id}`}
                    className={`block rounded-md px-2 py-1.5 text-[11.5px] leading-snug transition-colors ${
                      item.id === chapter.id ? 'bg-gs-deep font-semibold text-gs-ice' : 'text-gs-mist hover:bg-gs-deep/60 hover:text-gs-ice'
                    }`}
                  >
                    <span className="gs-number mr-1.5 text-[9.5px] text-gs-mist">{String(i + 1).padStart(2, '0')}</span>
                    {tr(item.title, lang)}
                  </Link>
                </li>
              ))}
            </ol>
            <Link to={meta.route} className="mt-4 block">
              <Button variant="primary" size="sm" className="w-full">
                {tr(site.methodPage.openSimulator, lang)}
              </Button>
            </Link>
          </div>
        </aside>

        <article className="order-1 min-w-0 lg:order-2">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold tracking-wider uppercase" style={{ color: meta.accent }}>
              <span>{info.abbr}</span>
              <span className="text-gs-mist">·</span>
              <span className="gs-number">
                {String(index + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
              </span>
              <Badge soft color={meta.accent}>
                {chapter.minutes} {tr(site.chapterPage.minRead, lang)}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gs-ice sm:text-3xl">{tr(chapter.title, lang)}</h1>
            <p className="mt-3 text-sm leading-relaxed text-gs-mist">{tr(chapter.summary, lang)}</p>
          </header>

          <div className="mt-6 max-w-3xl space-y-4">
            {chapter.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          <div className="mt-8 max-w-3xl rounded-xl border border-black/8 bg-gs-panel/70 px-4 py-3 text-[11px] leading-relaxed text-gs-mist">
            {tr(site.chapterPage.simulatorNote, lang)}
          </div>

          <div className="mt-6 flex max-w-3xl flex-col gap-2 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {prev ? (
              <Link to={`/teori/${meta.id}/${prev.id}`} className="group flex flex-col text-left">
                <span className="text-[10px] font-semibold tracking-wider text-gs-mist uppercase">{tr(site.chapterPage.prev, lang)}</span>
                <span className="mt-0.5 text-xs font-semibold text-gs-ice group-hover:text-gs-cyan">{tr(prev.title, lang)}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/teori/${meta.id}/${next.id}`} className="group flex flex-col text-left sm:text-right">
                <span className="text-[10px] font-semibold tracking-wider text-gs-mist uppercase">{tr(site.chapterPage.next, lang)}</span>
                <span className="mt-0.5 text-xs font-semibold text-gs-ice group-hover:text-gs-cyan">{tr(next.title, lang)}</span>
              </Link>
            ) : (
              <Link to={`/teori/${nextMethod.id}/${theoryByMethod[nextMethod.id].chapters[0].id}`} className="group flex flex-col text-left sm:text-right">
                <span className="text-[10px] font-semibold tracking-wider text-gs-mist uppercase">{tr(site.chapterPage.nextMethod, lang)}</span>
                <span className="mt-0.5 text-xs font-semibold text-gs-ice group-hover:text-gs-cyan">
                  {d.methods.list[nextMethod.id].name}
                </span>
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
