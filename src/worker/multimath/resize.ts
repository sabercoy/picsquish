
import { Filter } from '../..'
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
  dest: Uint8Array<ArrayBufferLike>,
  width: number,
  height: number,
) {
  let ptr = 3
  let len = (width * height * 4) | 0
  while (ptr < len) {
    dest[ptr] = 0xFF
    ptr = (ptr + 4) | 0
  }
}

export function resize(
  tile: Uint8ClampedArray<ArrayBufferLike>,
  filter: Filter,
  tileWidth: number,
  tileHeight: number,
  tileToWidth: number,
  tileToHeight: number,
  tileScaleX: number,
  tileScaleY: number,
  tileOffsetX: number,
  tileOffsetY: number,
) {
  const filtersX = createFilters(filter, tileWidth, tileToWidth, tileScaleX, tileOffsetX)
  const filtersY = createFilters(filter, tileHeight, tileToHeight, tileScaleY, tileOffsetY)

  const dest = new Uint8Array(tileToWidth * tileToHeight * 4)
  const temp = new Uint16Array(tileToWidth * tileHeight * 4)

  // Autodetect if alpha channel exists, and use appropriate method
  if (hasAlpha(tile, tileWidth, tileHeight)) {
    convolveHorWithPre(tile, temp, tileWidth, tileHeight, tileToWidth, filtersX)
    convolveVertWithPre(temp, dest, tileHeight, tileToWidth, tileToHeight, filtersY)
  } else {
    convolveHor(tile, temp, tileWidth, tileHeight, tileToWidth, filtersX)
    convolveVert(temp, dest, tileHeight, tileToWidth, tileToHeight, filtersY)
    resetAlpha(dest, tileToWidth, tileToHeight)
  }

  return dest
}
