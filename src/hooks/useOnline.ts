import { useEffect, useState } from 'react'
import { isOnline } from '../lib/capabilities'

/** Status online/offline reativo (eventos online/offline do navegador). */
export function useOnline(): boolean {
  const [online, setOnline] = useState(isOnline)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return online
}
