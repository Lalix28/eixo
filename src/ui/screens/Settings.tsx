import { useState, type ReactNode } from 'react'
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
    <div className="flex items-center justify-between py-1.5">
      <span className="text-ink-700">{label}</span>
      <span
        className={`text-sm font-semibold ${ok ? 'text-brand-600' : 'text-ink-400'}`}
      >
        {value}
      </span>
    </div>
  )
}

function InfoRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-ink-600">
      <span className="text-brand-600">•</span>
      <span>{children}</span>
    </li>
  )
}

export function Settings() {
  const online = useOnline()
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
        message: 'Backup exportado. Guarde o arquivo em um local seguro.',
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
    <ScreenShell title="Ajustes" subtitle="Informações e segurança">
      <div className="space-y-5">
        {/* Sobre / local-first */}
        <Card>
          <h3 className="mb-3 font-semibold text-ink-900">Sobre o Eixo</h3>
          <ul className="space-y-2">
            <InfoRow>App local-first: funciona no seu dispositivo.</InfoRow>
            <InfoRow>
              Seus dados ficam só neste dispositivo, no armazenamento do navegador.
            </InfoRow>
            <InfoRow>
              Instalável como app; abre offline após o primeiro carregamento.
            </InfoRow>
            <InfoRow>Sem conta, sem login e sem sincronização na nuvem.</InfoRow>
          </ul>
        </Card>

        {/* Dados */}
        <Card>
          <h3 className="mb-3 font-semibold text-ink-900">Seus dados</h3>
          <p className="text-sm text-ink-600">
            Limpar os dados do navegador ou usar uma janela privada pode apagar
            seus registros. O backup é manual e deve ser guardado fora do navegador.
          </p>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold text-ink-900">Backup local</h3>
          <p className="text-sm leading-relaxed text-ink-600">
            Seus dados ficam neste dispositivo. Você pode exportar um arquivo JSON
            para guardar uma cópia.
          </p>
          <p className="mt-3 rounded-xl bg-warn-500/10 p-3 text-xs leading-relaxed text-ink-700">
            Este arquivo pode conter dados pessoais de saúde e treino. Guarde em
            local seguro.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            {exporting ? 'Preparando arquivo…' : 'Exportar JSON'}
          </Button>
          {exportResult && (
            <p
              role={exportResult.kind === 'error' ? 'alert' : 'status'}
              className={`mt-3 text-sm ${
                exportResult.kind === 'error'
                  ? 'text-danger-500'
                  : 'text-brand-700'
              }`}
            >
              {exportResult.message}
            </p>
          )}
        </Card>

        {/* Status do dispositivo */}
        <Card>
          <h3 className="mb-2 font-semibold text-ink-900">Status do dispositivo</h3>
          <div className="divide-y divide-ink-100">
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
          <p className="mt-2 text-xs text-ink-400">
            {online ? 'Você está online.' : 'Você está offline — o app continua funcionando.'}
          </p>
        </Card>

        {/* Segurança */}
        <Card>
          <h3 className="mb-3 font-semibold text-ink-900">Segurança</h3>
          <p className="text-sm font-medium text-ink-800">{SAFETY_DISCLAIMER}</p>
          <p className="mt-2 text-sm text-ink-600">{PAIN_REFERENCE}</p>
          <ul className="mt-3 space-y-2">
            {SAFETY_RULES.map((rule) => (
              <InfoRow key={rule}>{rule}</InfoRow>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium text-ink-800">{STOP_SIGNS_INTRO}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {STOP_SIGNS.map((sign) => (
              <li
                key={sign}
                className="rounded-full bg-danger-500/10 px-3 py-1 text-xs font-medium text-danger-500"
              >
                {sign}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ScreenShell>
  )
}
