import { lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { I18nProvider } from './i18n'

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const MethodsPage = lazy(() => import('./pages/MethodsPage').then((m) => ({ default: m.MethodsPage })))
const MethodPage = lazy(() => import('./pages/MethodPage').then((m) => ({ default: m.MethodPage })))
const TheoryIndexPage = lazy(() => import('./pages/TheoryIndexPage').then((m) => ({ default: m.TheoryIndexPage })))
const TheoryChapterPage = lazy(() => import('./pages/TheoryChapterPage').then((m) => ({ default: m.TheoryChapterPage })))
const SimulatorHub = lazy(() => import('./pages/SimulatorHub').then((m) => ({ default: m.SimulatorHub })))
const GprWorkspace = lazy(() => import('./pages/GprWorkspace').then((m) => ({ default: m.GprWorkspace })))
const MagneticWorkspace = lazy(() => import('./pages/MagneticWorkspace').then((m) => ({ default: m.MagneticWorkspace })))
const GravityWorkspace = lazy(() => import('./pages/GravityWorkspace').then((m) => ({ default: m.GravityWorkspace })))
const ReflectionWorkspace = lazy(() => import('./pages/ReflectionWorkspace').then((m) => ({ default: m.ReflectionWorkspace })))
const RefractionWorkspace = lazy(() => import('./pages/RefractionWorkspace').then((m) => ({ default: m.RefractionWorkspace })))
const ResistivityWorkspace = lazy(() => import('./pages/ResistivityWorkspace').then((m) => ({ default: m.ResistivityWorkspace })))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

/** Android hardware back: router back inside the app, exit at the landing page. */
function useNativeBackButton() {
  useEffect(() => {
    const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    if (!cap?.isNativePlatform?.()) return
    let remove: (() => Promise<void>) | undefined
    void import('@capacitor/app').then(({ App: NativeApp }) =>
      NativeApp.addListener('backButton', ({ canGoBack }) => {
        const hash = window.location.hash
        if (canGoBack && hash && hash !== '#/') window.history.back()
        else void NativeApp.exitApp()
      }).then((handle) => {
        remove = () => handle.remove()
      }),
    )
    return () => {
      void remove?.()
    }
  }, [])
}

export function App() {
  useNativeBackButton()
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="/metode" element={<MethodsPage />} />
            <Route path="/metode/:methodId" element={<MethodPage />} />
            <Route path="/teori" element={<TheoryIndexPage />} />
            <Route path="/teori/:methodId/:chapterId" element={<TheoryChapterPage />} />
            <Route path="/simulator" element={<SimulatorHub />} />
            <Route path="/simulator/gpr" element={<GprWorkspace />} />
            <Route path="/simulator/magnetic" element={<MagneticWorkspace />} />
            <Route path="/simulator/gravity" element={<GravityWorkspace />} />
            <Route path="/simulator/reflection" element={<ReflectionWorkspace />} />
            <Route path="/simulator/refraction" element={<RefractionWorkspace />} />
            <Route path="/simulator/resistivity" element={<ResistivityWorkspace />} />
            <Route path="/physics" element={<Navigate to="/teori" replace />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </I18nProvider>
  )
}
