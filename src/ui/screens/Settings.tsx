import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ScreenShell } from '../components/ScreenShell'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useOnline } from '../../hooks/useOnline'
import { useAppStore } from '../../store/useAppStore'
import { downloadExportJson } from '../../lib/downloadJson'
import {
  supportsServiceWorker,
  supportsVibrate,
  supportsWakeLock,
} from '../../lib/capabilities'
import {
  PAIN_REFERENCE,
  SAFETY_DISCLAIMER,
  SAFETY_RULES,
  STOP_SIGNS,
  STOP_SIGNS_INTRO,
} from '../../data/safety'
import { QUICK_TRANSITION } from '../motion'

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 py-2">
      <span className="text-sm text-ink-700 sm:text-base">{label}</span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-700">
        <span
          className={`flex size-5 items-center justify-center rounded-full text-xs ${
            ok ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500'
          }`}
          aria-hidden="true"
        >
          {ok ? '✓' : '–'}
        </span>
        {value}
      </span>
    </div>
  )
}

function InfoRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-ink-600">
      <span className="text-brand-600" aria-hidden="true">•</span>
      <span>{children}</span>
    </li>
  )
}

export function Settings() {
  const online = useOnline()
  const insecureContext =
    typeof window !== 'undefined' && window.isSecureContext === false
  const exportData = useAppStore((state) => state.exportData)
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<
    { kind: 'success' | 'error'; message: string } | undefined
  >()

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    setExportResult(undefined)
    try {
      const bundle = await exportData()
      downloadExportJson(bundle)
      setExportResult({
        kind: 'success',
        message: 'Backup exportado e salvo neste dispositivo.',
      })
    } catch {
      setExportResult({
        kind: 'error',
        message: 'Não foi possível exportar seus dados. Tente novamente.',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <ScreenShell title="Ajustes" subtitle="Dados locais, recursos e segurança">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Dados locais e privacidade */}
        <Card>
          <p className="text-xs font-semibold text-brand-700">Dados locais</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-900">
            Privacidade neste dispositivo
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Seus dados ficam só neste dispositivo, no armazenamento do navegador.
          </p>
          <p className="mt-3 rounded-[var(--radius-card)] bg-warn-500/10 p-3 text-sm leading-relaxed text-ink-700">
            Limpar os dados do navegador ou usar uma janela privada pode apagar
            seus registros. O backup é manual e deve ser guardado fora do navegador.
          </p>
        </Card>

        {/* Backup */}
        <Card>
          <p className="text-xs font-semibold text-brand-700">Backup JSON</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-900">Backup local</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Exporte uma cópia dos dados salvos neste dispositivo para guardar em
            um local seguro.
          </p>
          <p className="mt-3 rounded-[var(--radius-card)] border border-warn-500/20 bg-[#fffbeb] p-3 text-xs leading-relaxed text-ink-700">
            Este arquivo pode conter dados pessoais de saúde e treino. Guarde em
            local seguro.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            {exporting ? 'Preparando arquivo…' : 'Exportar JSON'}
          </Button>
          {exportResult && (
            <motion.p
              key={`${exportResult.kind}-${exportResult.message}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={QUICK_TRANSITION}
              role={exportResult.kind === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`mt-3 text-sm font-medium ${
                exportResult.kind === 'error'
                  ? 'text-danger-700'
                  : 'text-brand-700'
              }`}
            >
              {exportResult.message}
            </motion.p>
          )}
        </Card>

        {/* PWA e recursos do dispositivo */}
        <Card>
          <p className="text-xs font-semibold text-brand-700">PWA e dispositivo</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-900">
            Status do dispositivo
          </h2>
          <div className="mt-3 divide-y divide-ink-100">
            <StatusRow
              label="Conexão"
              value={online ? 'Online' : 'Offline'}
              ok={online}
            />
            <StatusRow
              label="Recursos offline"
              value={supportsServiceWorker() ? 'Disponível' : 'Indisponível'}
              ok={supportsServiceWorker()}
            />
            <StatusRow
              label="Manter tela acesa"
              value={supportsWakeLock() ? 'Disponível' : 'Indisponível'}
              ok={supportsWakeLock()}
            />
            <StatusRow
              label="Vibração"
              value={supportsVibrate() ? 'Disponível' : 'Indisponível'}
              ok={supportsVibrate()}
            />
          </div>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">
            {online
              ? 'Você está online.'
              : 'Você está offline — o app continua funcionando.'}
          </p>
          {insecureContext && (
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
              Alguns recursos ficam disponíveis quando o app é aberto em uma
              conexão segura.
            </p>
          )}
        </Card>

        {/* Informações do app */}
        <Card>
          <p className="text-xs font-semibold text-brand-700">Informações do app</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-900">Sobre o Eixo</h2>
          <ul className="mt-3 space-y-2">
            <InfoRow>App local-first: funciona no seu dispositivo.</InfoRow>
            <InfoRow>
              Instalável como app; abre offline após o primeiro carregamento.
            </InfoRow>
            <InfoRow>Sem conta, sem login e sem sincronização na nuvem.</InfoRow>
          </ul>
        </Card>

        {/* Segurança */}
        <Card className="lg:col-span-2">
          <p className="text-xs font-semibold text-brand-700">Segurança</p>
          <h2 className="mt-1 text-lg font-semibold text-ink-900">
            Referências para o treino
          </h2>
          <p className="mt-3 text-sm font-medium text-ink-800">
            {SAFETY_DISCLAIMER}
          </p>
          <p className="mt-2 text-sm text-ink-600">{PAIN_REFERENCE}</p>
          <ul className="mt-3 space-y-2">
            {SAFETY_RULES.map((rule) => (
              <InfoRow key={rule}>{rule}</InfoRow>
            ))}
          </ul>
          <aside className="mt-5 rounded-[var(--radius-card)] border border-danger-500/25 border-l-4 border-l-danger-500 bg-danger-500/5 p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-danger-700 ring-1 ring-danger-500/20"
                aria-hidden="true"
              >
                !
              </span>
              <div>
                <h3 className="font-semibold text-danger-700">
                  Sinais de parada
                </h3>
                <p className="mt-1 text-sm font-medium text-ink-800">
                  {STOP_SIGNS_INTRO}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-700">
                  {STOP_SIGNS.map((sign) => (
                    <li key={sign}>{sign}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </Card>
      </div>
    </ScreenShell>
  )
}
