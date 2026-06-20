import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GlassNavbar from './components/GlassNavbar'
import SimplexFlowBackground from './components/SimplexFlowBackground'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimplexFlowBackground />
    <GlassNavbar />
  </StrictMode>,
)
