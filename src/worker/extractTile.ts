import { BYTES_PER_PIXEL, TileTransform } from '../common'

export function extractTile(
  from: Uint8ClampedArray,
  fromWidth: number,
  tileTransform: Omit<TileTransform, 'tile'>,
) {
  const tilePixels = new Uint8ClampedArray(tileTransform.width * tileTransform.height * BYTES_PER_PIXEL)

  for (let row = 0; row < tileTransform.height; row++) {
    const srcStart = ((tileTransform.y + row) * fromWidth + tileTransform.x) * BYTES_PER_PIXEL
    const dstStart = row * tileTransform.width * BYTES_PER_PIXEL

    tilePixels.set(
      from.subarray(srcStart, srcStart + tileTransform.width * BYTES_PER_PIXEL),
      dstStart,
    )
  }

  return tilePixels
}

