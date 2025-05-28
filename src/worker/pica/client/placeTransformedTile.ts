import { TileTransform } from '../../..'

export function placeTransformedTile(
  to: SharedArrayBuffer,
  toWidth: number,
  tileTransform: TileTransform,
  transformedTile: Uint8Array | Uint8ClampedArray,
) {
  const bytesPerPixel = 4
  const toImage = new Uint8ClampedArray(to)

  for (let row = 0; row < tileTransform.toHeight; row++) {
    const fromStart = row * tileTransform.toWidth * bytesPerPixel
    const toStart = ((tileTransform.toY + row) * toWidth + tileTransform.toX) * bytesPerPixel

    toImage.set(
      transformedTile.subarray(fromStart, fromStart + tileTransform.toWidth * bytesPerPixel),
      toStart,
    )
  }
}
