
import { PicaTileOptions } from '../../../..'
import { resizeFilterGen as createFilters } from './resize_filter_gen'
import { convolveHor, convolveVert, convolveHorWithPre, convolveVertWithPre } from './convolve'

function hasAlpha(
  src: Uint8ClampedArray<ArrayBufferLike>,
  width: number,
  height: number,
) {
  let ptr = 3
  let len = (width * height * 4) | 0
  while (ptr < len) {
    if (src[ptr] !== 255) return true
    ptr = (ptr + 4) | 0
  }
  return false
}

function resetAlpha(
  dst: Uint8Array<ArrayBufferLike>,
  width: number,
  height: number,
) {
  let ptr = 3
  let len = (width * height * 4) | 0
  while (ptr < len) {
    dst[ptr] = 0xFF
    ptr = (ptr + 4) | 0
  }
}

export function resize(picaTileOptions: PicaTileOptions) {
  const src = picaTileOptions.src
  const srcW = picaTileOptions.width
  const srcH = picaTileOptions.height
  const destW = picaTileOptions.toWidth
  const destH = picaTileOptions.toHeight
  const scaleX = picaTileOptions.scaleX || picaTileOptions.toWidth / picaTileOptions.width
  const scaleY = picaTileOptions.scaleY || picaTileOptions.toHeight / picaTileOptions.height
  const offsetX = picaTileOptions.offsetX || 0
  const offsetY = picaTileOptions.offsetY || 0
  const dest = picaTileOptions.dest || new Uint8Array(destW * destH * 4)

  const filter = typeof picaTileOptions.filter === 'undefined' ? 'mks2013' : picaTileOptions.filter
  const filtersX = createFilters(filter, srcW, destW, scaleX, offsetX)
  const filtersY = createFilters(filter, srcH, destH, scaleY, offsetY)

  const tmp = new Uint16Array(destW * srcH * 4)

  // Autodetect if alpha channel exists, and use appropriate method
  if (hasAlpha(src!, srcW, srcH)) {
    convolveHorWithPre(src!, tmp, srcW, srcH, destW, filtersX)
    convolveVertWithPre(tmp, dest, srcH, destW, destH, filtersY)
  } else {
    convolveHor(src!, tmp, srcW, srcH, destW, filtersX)
    convolveVert(tmp, dest, srcH, destW, destH, filtersY)
    resetAlpha(dest, destW, destH)
  }

  return dest
}
