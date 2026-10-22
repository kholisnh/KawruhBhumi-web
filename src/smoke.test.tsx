import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ReactElement } from 'react'
import { I18nProvider } from './i18n'
import { LandingPage } from './pages/LandingPage'
import { SimulatorHub } from './pages/SimulatorHub'
import { GprWorkspace } from './pages/GprWorkspace'
import { MagneticWorkspace } from './pages/MagneticWorkspace'
import { GravityWorkspace } from './pages/GravityWorkspace'
import { ReflectionWorkspace } from './pages/ReflectionWorkspace'
import { RefractionWorkspace } from './pages/RefractionWorkspace'
import { ResistivityWorkspace } from './pages/ResistivityWorkspace'
import { MethodsPage } from './pages/MethodsPage'
import { TheoryIndexPage } from './pages/TheoryIndexPage'
import { TheoryChapterPage } from './pages/TheoryChapterPage'
import { MethodPage } from './pages/MethodPage'
import { DisclaimerPage } from './pages/DisclaimerPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { AboutPage } from './pages/AboutPage'
import { NotFound } from './pages/NotFound'

function render(element: ReactElement, path = '/'): string {
  return renderToString(
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={element} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

function renderRoute(pattern: string, path: string, element: ReactElement): string {
  return renderToString(
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={pattern} element={element} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('page smoke tests (server render)', () => {
  it('landing page renders hero, methods and simulator preview', () => {
    const html = render(<LandingPage />)
    expect(html).toContain('See what the ground')
    expect(html).toContain('KawruhBhumi Lab')
    expect(html).toContain('Ground-Penetrating Radar')
    expect(html.length).toBeGreaterThan(8_000)
  })

  it('simulator hub lists all six methods', () => {
    const html = render(<SimulatorHub />)
    for (const name of ['Ground-Penetrating Radar', 'Magnetic', 'Gravity', 'Seismic Reflection', 'Seismic Refraction', 'Resistivity Sounding (VES)']) {
      expect(html).toContain(name)
    }
  })

  it('GPR workspace renders controls before the first run', () => {
    const html = render(<GprWorkspace />)
    expect(html).toContain('Run Simulation')
    expect(html).toContain('Geological layers')
    expect(html).toContain('APPROXIMATE')
  })

  it('magnetic workspace renders controls and classification badge', () => {
    const html = render(<MagneticWorkspace />)
    expect(html).toContain('Magnetic Survey')
    expect(html).toContain('Run Simulation')
    expect(html).toContain('SEMI-ANALYTICAL')
    expect(html).toContain('ΔT')
  })

  it('gravity workspace renders controls and classification badge', () => {
    const html = render(<GravityWorkspace />)
    expect(html).toContain('Gravity Survey')
    expect(html).toContain('Run Simulation')
    expect(html).toContain('ANALYTICAL')
    expect(html).toContain('mGal')
  })

  it('reflection workspace renders controls and classification badge', () => {
    const html = render(<ReflectionWorkspace />)
    expect(html).toContain('Seismic Reflection')
    expect(html).toContain('Run Simulation')
    expect(html).toContain('PRIMARIES ONLY')
    expect(html).toContain('Ricker')
  })

  it('refraction workspace renders controls and classification badge', () => {
    const html = render(<RefractionWorkspace />)
    expect(html).toContain('Seismic Refraction')
    expect(html).toContain('Run Simulation')
    expect(html).toContain('HEAD WAVES')
    expect(html).toContain('crossover')
  })

  it('resistivity workspace renders controls and classification badge', () => {
    const html = render(<ResistivityWorkspace />)
    expect(html).toContain('Resistivity Sounding (VES)')
    expect(html).toContain('Run Simulation')
    expect(html).toContain('NUMERICAL · LAYERED EARTH')
    expect(html).toContain('Ω·m')
  })

  it('methods page lists every method', () => {
    const html = render(<MethodsPage />)
    for (const name of ['Ground-Penetrating Radar', 'Magnetic', 'Gravity', 'Seismic Reflection', 'Seismic Refraction', 'Resistivity Sounding (VES)']) {
      expect(html).toContain(name)
    }
  })

  it('theory index lists every method', () => {
    const html = render(<TheoryIndexPage />)
    expect(html).toContain('From a measurement to a model')
    expect(html).toContain('Ground-Penetrating Radar')
  })

  it('method page renders the method story', () => {
    const html = renderRoute('/metode/:methodId', '/metode/resistivity', <MethodPage />)
    expect(html).toContain('Resistivity Sounding (VES)')
    expect(html).toContain('Guided theory')
  })

  it('theory chapter renders equations for every method', () => {
    for (const id of ['gpr', 'magnetic', 'gravity', 'reflection', 'refraction', 'resistivity']) {
      const html = renderRoute('/teori/:methodId/:chapterId', `/teori/${id}/physics`, <TheoryChapterPage />)
      expect(html.length).toBeGreaterThan(4_000)
      expect(html).toContain('katex')
    }
  })

  it('disclaimer page renders scope and feedback address', () => {
    const html = render(<DisclaimerPage />)
    expect(html).toContain('A learning tool, not a substitute for field work')
    expect(html).toContain('opencode using DeepSeek V4.1 Flash Free')
    expect(html).toContain('kholis.nh3@gmail.com')
  })

  it('resources library renders the verified reference list', () => {
    const html = render(<ResourcesPage />)
    expect(html).toContain('Ground Penetrating Radar')
    expect(html).toContain('doi:')
  })

  it('about page renders scope and roadmap', () => {
    const html = render(<AboutPage />)
    expect(html).toContain('Roadmap')
    expect(html).toContain('Phase 2')
  })

  it('not found page renders', () => {
    const html = render(<NotFound />)
    expect(html).toContain('404')
  })
})
