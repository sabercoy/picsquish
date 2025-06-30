import { BYTES_PER_PIXEL, TileTransform } from '../common'

function clearSafariCanvas(canvas: OffscreenCanvas | null, context: OffscreenCanvasRenderingContext2D | null) {
  // https://github.com/nodeca/pica/issues/199
  // https://bugs.webkit.org/show_bug.cgi?id=195325
  // https://stackoverflow.com/questions/52532614/total-canvas-memory-use-exceeds-the-maximum-limit-safari-12
  // https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/

  if (canvas) canvas.width = canvas.height = 0
  canvas = context = null
}

function extractTileFromOriginalImage(
  from: ImageBitmap,
  tileTransform: Omit<TileTransform, 'tile'>,
) {
  let tempCanvas: OffscreenCanvas | null = new OffscreenCanvas(tileTransform.width, tileTransform.height)
  let tempContext = tempCanvas.getContext('2d')
  if (!tempContext) throw new Error('Picsquish error: canvas 2D context not supported')
  tempContext.globalCompositeOperation = 'copy'
  tempContext.drawImage(from, tileTransform.x, tileTransform.y, tileTransform.width, tileTransform.height, 0, 0, tileTransform.width, tileTransform.height)
  const arrayBuffer = tempContext.getImageData(0, 0, tileTransform.width, tileTransform.height).data.buffer as ArrayBuffer
  clearSafariCanvas(tempCanvas, tempContext)

  return arrayBuffer
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