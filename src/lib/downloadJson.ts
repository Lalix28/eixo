import type { ExportBundle } from '../persistence/exportBundle'

export function exportFilename(exportedAt: string): string {
  return `eixo-backup-${exportedAt.slice(0, 10)}.json`
}

/** Dispara um download local. Nenhum dado é enviado para fora do navegador. */
export function downloadExportJson(bundle: ExportBundle): void {
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = exportFilename(bundle.exportedAt)
  anchor.hidden = true
  document.body.append(anchor)

  try {
    anchor.click()
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

