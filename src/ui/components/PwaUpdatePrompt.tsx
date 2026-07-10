/// <reference types="vite-plugin-pwa/react" />
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Banner de atualização do service worker.
 * Estratégia segura: quando há nova versão, oferece atualizar/recarregar —
 * o usuário nunca fica preso numa versão antiga, e nada recarrega sem consentir.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-700">Nova versão disponível.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="min-h-11 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Depois
          </button>
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="min-h-11 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  )
}
