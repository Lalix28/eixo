import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from './createId'

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('createId', () => {
  it('usa randomUUID quando disponível', () => {
    const expected = '123e4567-e89b-42d3-a456-426614174000'
    const randomUUID = vi.fn(() => expected)
    vi.stubGlobal('crypto', { randomUUID })

    expect(createId()).toBe(expected)
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('usa getRandomValues quando randomUUID não está disponível', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set(Array.from({ length: 16 }, (_, index) => index))
      return bytes
    })
    vi.stubGlobal('crypto', { getRandomValues })

    expect(createId()).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f')
    expect(getRandomValues).toHaveBeenCalledOnce()
  })

  it('mantém o formato UUID v4 sem Web Crypto', () => {
    vi.stubGlobal('crypto', undefined)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(createId()).toMatch(UUID_V4)
  })
})
