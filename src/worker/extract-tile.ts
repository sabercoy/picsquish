import { BYTES_PER_PIXEL, TileTransform } from '../common'

function extractTileFromOriginalImage(
  from: ImageBitmap,
  tileTransform: Omit<TileTransform, 'tile'>,
) {
  const tempCanvas = new OffscreenCanvas(tileTransform.width, tileTransform.height)
  const tempContext = tempCanvas.getContext('2d')
  if (!tempContext) throw new Error('Picsquish error: canvas 2D context not supported')
  tempContext.globalCompositeOperation = 'copy'
  tempContext.drawImage(from, tileTransform.x, tileTransform.y, tileTransform.width, tileTransform.height, 0, 0, tileTransform.width, tileTransform.height)
  return tempContext.getImageData(0, 0, tileTransform.width, tileTransform.height).data.buffer as ArrayBuffer
}

function extractTileFromResizedImage(
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

  return tilePixels.buffer
}

export function extractTile(
  from: ImageBitmap | Uint8ClampedArray,
  fromWidth: number,
  tileTransform: Omit<TileTransform, 'tile'>,
) {
  if (from instanceof ImageBitmap) {
    return extractTileFromOriginalImage(from, tileTransform)
  } else {
    return extractTileFromResizedImage(from, fromWidth, tileTransform)
  }
}