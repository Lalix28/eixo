import { describe, expect, it } from 'vitest'
import { buildExportBundle, EXPORT_WARNING } from './exportBundle'

describe('buildExportBundle', () => {
  it('inclui metadados versionados e preserva uma estrutura vazia', () => {
    const bundle = buildExportBundle(
      { baselines: [], sessions: [], logs: [], sideMetrics: [] },
      '2026-07-07T18:00:00.000Z',
    )

    expect(bundle).toEqual({
      app: 'Eixo',
      exportVersion: 1,
      exportedAt: '2026-07-07T18:00:00.000Z',
      source: 'local-indexeddb',
      warning: EXPORT_WARNING,
      data: { baselines: [], sessions: [], logs: [], sideMetrics: [] },
    })
  })
})

