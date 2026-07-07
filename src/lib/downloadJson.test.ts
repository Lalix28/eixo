import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildExportBundle } from '../persistence/exportBundle'
import { downloadExportJson, exportFilename } from './downloadJson'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('exportFilename', () => {
  it('usa a data ISO no nome do backup', () => {
    expect(exportFilename('2026-07-07T18:00:00.000Z')).toBe(
      'eixo-backup-2026-07-07.json',
    )
  })

  it('cria o arquivo, aciona o link e revoga a URL temporária', () => {
    vi.useFakeTimers()
    const createObjectURL = vi.fn(() => 'blob:eixo-backup')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    let clickedDownload = ''
    let clickedHref = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedDownload = this.download
      clickedHref = this.href
    })
    const bundle = buildExportBundle(
      { baselines: [], sessions: [], logs: [], sideMetrics: [] },
      '2026-07-07T18:00:00.000Z',
    )

    downloadExportJson(bundle)

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickedDownload).toBe('eixo-backup-2026-07-07.json')
    expect(clickedHref).toContain('blob:eixo-backup')
    expect(revokeObjectURL).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:eixo-backup')
  })
})
