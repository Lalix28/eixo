/**
 * Detecção de capacidades do navegador (feature detection).
 * Puras e defensivas — usadas na tela Ajustes/Info e como base para
 * progressive enhancement (Wake Lock, vibração, PWA).
 */

export function supportsServiceWorker(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

export function supportsWakeLock(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

export function supportsVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
