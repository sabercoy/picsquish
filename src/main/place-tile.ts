import { BYTES_PER_PIXEL, TileTransform } from '../common'

export function placeTile(
  to: Uint8ClampedArray,
  toWidth: number,
  tileTransform: TileTransform,
) {
  const tile = new Uint8ClampedArray(tileTransform.tile)

  for (let row = 0; row < tileTransform.toHeight; row++) {
    const fromStart = row * tileTransform.toWidth * BYTES_PER_PIXEL
    const toStart = ((tileTransform.toY + row) * toWidth + tileTransform.toX) * BYTES_PER_PIXEL

    to.set(
      tile.subarray(fromStart, fromStart + tileTransform.toWidth * BYTES_PER_PIXEL),
      toStart,
    )
  }
}
