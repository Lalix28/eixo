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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-100 bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <p className="text-sm text-ink-700">Nova versão disponível.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-500 hover:text-ink-700"
          >
            Depois
          </button>
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  )
}
