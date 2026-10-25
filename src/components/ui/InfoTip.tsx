import { useEffect, useId, useRef, useState } from 'react'

export function InfoTip({ label, children }: { label: string; children: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="relative grid h-4 w-4 place-items-center rounded-full border border-gs-mist/40 text-xs font-bold text-gs-mist transition-colors after:absolute after:-inset-1 after:content-[''] hover:border-gs-cyan/60 hover:text-gs-cyan focus-visible:ring-2 focus-visible:ring-gs-cyan/60 focus-visible:outline-none"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-6 left-0 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-gs-cyan/20 bg-gs-navy p-2.5 text-left text-xs leading-relaxed font-normal tracking-normal text-gs-mist normal-case shadow-panel"
        >
          {children}
        </span>
      )}
    </span>
  )
}
