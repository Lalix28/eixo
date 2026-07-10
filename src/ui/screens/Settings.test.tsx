import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import { useAppStore } from '../../store/useAppStore'
import { buildExportBundle } from '../../persistence/exportBundle'
import { downloadExportJson } from '../../lib/downloadJson'

vi.mock('../../lib/downloadJson', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/downloadJson')>()
  return { ...original, downloadExportJson: vi.fn() }
})

const emptyBundle = buildExportBundle(
  { baselines: [], sessions: [], logs: [], sideMetrics: [] },
  '2026-07-07T18:00:00.000Z',
)
const defaultExportData = useAppStore.getState().exportData

describe('Settings (Ajustes/Info)', () => {
  beforeEach(() => {
    vi.mocked(downloadExportJson).mockReset()
  })

  afterEach(() => {
    useAppStore.setState({ exportData: defaultExportData })
    vi.unstubAllGlobals()
  })

  it('mostra informações local-first e PWA/offline', () => {
    render(<Settings />)
    expect(screen.getByText('Sobre o Eixo')).toBeInTheDocument()
    expect(
      screen.getByText('App local-first: funciona no seu dispositivo.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/abre offline após o primeiro carregamento/),
    ).toBeInTheDocument()
  })

  it('avisa sobre dados locais e oferece backup JSON', () => {
    render(<Settings />)
    expect(screen.getByText(/Limpar os dados do navegador/)).toBeInTheDocument()
    expect(screen.getByText('Backup local')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Exportar JSON' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/dados pessoais de saúde e treino/)).toBeInTheDocument()
  })

  it('solicita dados à store, dispara o download e confirma sucesso', async () => {
    const exportData = vi.fn().mockResolvedValue(emptyBundle)
    useAppStore.setState({ exportData })
    render(<Settings />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }))

    expect(exportData).toHaveBeenCalledOnce()
    expect(downloadExportJson).toHaveBeenCalledWith(emptyBundle)
    expect(
      screen.getByRole('status', { name: '' }),
    ).toHaveTextContent('Backup exportado')
  })

  it('mostra erro amigável quando o repository falha', async () => {
    useAppStore.setState({
      exportData: vi.fn().mockRejectedValue(new Error('idb indisponível')),
    })
    render(<Settings />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível exportar seus dados',
    )
    expect(downloadExportJson).not.toHaveBeenCalled()
  })

  it('mostra status do dispositivo sem quebrar quando APIs não existem', () => {
    // jsdom não tem wakeLock nem vibrate → deve renderizar "Não", sem erro.
    render(<Settings />)
    expect(screen.getByText('Status do dispositivo')).toBeInTheDocument()
    expect(screen.getByText('Recursos offline')).toBeInTheDocument()
    expect(screen.getByText('Manter tela acesa')).toBeInTheDocument()
    expect(screen.getByText('Vibração')).toBeInTheDocument()
  })

  it('explica limitações quando a conexão não é segura', () => {
    vi.stubGlobal('isSecureContext', false)
    render(<Settings />)
    expect(
      screen.getByText(
        'Alguns recursos ficam disponíveis quando o app é aberto em uma conexão segura.',
      ),
    ).toBeInTheDocument()
  })

  it('mostra a seção de segurança', () => {
    render(<Settings />)
    expect(
      screen.getByText(
        'Este app não substitui avaliação médica ou fisioterapêutica.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Dor aguda')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Sinais de parada' }),
    ).toBeInTheDocument()
  })
})
