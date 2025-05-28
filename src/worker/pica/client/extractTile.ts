import { TileTransform } from '../../..'

export function extractTile(
  from: SharedArrayBuffer,
  fromWidth: number,
  tileTransform: TileTransform,
) {
  const bytesPerPixel = 4
  const fullImage = new Uint8ClampedArray(from)
  const tilePixels = new Uint8ClampedArray(tileTransform.width * tileTransform.height * bytesPerPixel)

  for (let row = 0; row < tileTransform.height; row++) {
    const srcStart = ((tileTransform.y + row) * fromWidth + tileTransform.x) * bytesPerPixel
    const dstStart = row * tileTransform.width * bytesPerPixel

    tilePixels.set(
      fullImage.subarray(srcStart, srcStart + tileTransform.width * bytesPerPixel),
      dstStart,
    )
  }

  return tilePixels
}

