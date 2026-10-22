import '@fontsource/cabin/400.css'
import '@fontsource/cabin/500.css'
import '@fontsource/cabin/600.css'
import '@fontsource/cabin/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import 'katex/dist/katex.min.css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
