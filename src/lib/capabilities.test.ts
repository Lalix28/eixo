import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  isOnline,
  supportsServiceWorker,
  supportsVibrate,
  supportsWakeLock,
} from './capabilities'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('capabilities (feature detection)', () => {
  it('detecta wakeLock presente/ausente', () => {
    vi.stubGlobal('navigator', { wakeLock: {} })
    expect(supportsWakeLock()).toBe(true)
    vi.stubGlobal('navigator', {})
    expect(supportsWakeLock()).toBe(false)
  })

  it('detecta vibrate presente/ausente', () => {
    vi.stubGlobal('navigator', { vibrate: () => true })
    expect(supportsVibrate()).toBe(true)
    vi.stubGlobal('navigator', {})
    expect(supportsVibrate()).toBe(false)
  })

  it('detecta serviceWorker presente/ausente', () => {
    vi.stubGlobal('navigator', { serviceWorker: {} })
    expect(supportsServiceWorker()).toBe(true)
    vi.stubGlobal('navigator', {})
    expect(supportsServiceWorker()).toBe(false)
  })

  it('reflete navigator.onLine', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(isOnline()).toBe(true)
    vi.stubGlobal('navigator', { onLine: false })
    expect(isOnline()).toBe(false)
  })
})
