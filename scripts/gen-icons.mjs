// Gerador de ícones PWA do Eixo — Node puro (zlib embutido), sem libs externas.
// Design: um "eixo" (cruz) branco sobre verde de marca (#059669).
// Executar: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const GREEN = [5, 150, 105, 255] // #059669
const WHITE = [255, 255, 255, 255]
const CLEAR = [0, 0, 0, 0]

// --- CRC32 ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // 10,11,12 = 0 (compression, filter, interlace)
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter type 0
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = y * (size * 4 + 1) + 1 + x * 4
      raw[dst] = rgba[src]
      raw[dst + 1] = rgba[src + 1]
      raw[dst + 2] = rgba[src + 2]
      raw[dst + 3] = rgba[src + 3]
    }
  }
  const idat = deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function insideRounded(x, y, size, r) {
  const cx = Math.min(Math.max(x, r), size - 1 - r)
  const cy = Math.min(Math.max(y, r), size - 1 - r)
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function drawIcon(size, { maskable }) {
  const rgba = new Uint8Array(size * size * 4)
  const r = maskable ? 0 : Math.round(size * 0.22)

  // Glifo "E" (Eixo) centrado, com mais respiro no maskable (safe zone).
  const pad = size * (maskable ? 0.3 : 0.26)
  const x0 = pad
  const x1 = size - pad
  const y0 = pad
  const y1 = size - pad
  const stroke = (y1 - y0) * 0.2
  const midLen = (x1 - x0) * 0.72
  const ymid = (y0 + y1) / 2

  const isE = (x, y) => {
    const leftBar = x >= x0 && x <= x0 + stroke && y >= y0 && y <= y1
    const top = y >= y0 && y <= y0 + stroke && x >= x0 && x <= x1
    const bottom = y >= y1 - stroke && y <= y1 && x >= x0 && x <= x1
    const middle =
      Math.abs(y - ymid) <= stroke / 2 && x >= x0 && x <= x0 + midLen
    return leftBar || top || bottom || middle
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const bg = maskable || insideRounded(x, y, size, r)
      let color = CLEAR
      if (bg) color = isE(x, y) ? WHITE : GREEN
      rgba[i] = color[0]
      rgba[i + 1] = color[1]
      rgba[i + 2] = color[2]
      rgba[i + 3] = color[3]
    }
  }
  return encodePng(size, rgba)
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'icon-192.png'), drawIcon(192, { maskable: false }))
writeFileSync(join(outDir, 'icon-512.png'), drawIcon(512, { maskable: false }))
writeFileSync(join(outDir, 'icon-maskable-512.png'), drawIcon(512, { maskable: true }))
console.log('Ícones gerados em public/icons/')
