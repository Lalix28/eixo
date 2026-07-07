import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PwaUpdatePrompt } from './ui/components/PwaUpdatePrompt.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <PwaUpdatePrompt />
  </StrictMode>,
)
