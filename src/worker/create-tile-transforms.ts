import { Filter, TileTransform } from '../common'
import { extractTile } from './extract-tile'

const PIXEL_EPSILON = 1e-5

function pixelFloor(x: number) {
  let nearest = Math.round(x)

  if (Math.abs(x - nearest) < PIXEL_EPSILON) return nearest

  return Math.floor(x)
}

function pixelCeil(x: number) {
  let nearest = Math.round(x)

  if (Math.abs(x - nearest) < PIXEL_EPSILON) return nearest

  return Math.ceil(x)
}

export function createTileTransforms(
  from: Uint8ClampedArray,
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number,
  initialSize: number,
  filterPadding: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
) {
  const scaleX = toWidth / fromWidth
  const scaleY = toHeight / fromHeight

  const innerTileWidth = pixelFloor(initialSize * scaleX) - 2 * filterPadding
  const innerTileHeight = pixelFloor(initialSize * scaleY) - 2 * filterPadding

  // prevent infinite loop, this should never happen
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error('Internal error in picsquish: target tile width/height is too small.')
  }

  let x, y
  let innerX, innerY, toTileWidth, toTileHeight
  const tileTransforms: TileTransform[] = []

  // we go top-to-down instead of left-to-right to make image displayed from top to
  // doesn in the browser
  for (innerY = 0; innerY < toHeight; innerY += innerTileHeight) {
    for (innerX = 0; innerX < toWidth; innerX += innerTileWidth) {
      x = innerX - filterPadding
      if (x < 0) x = 0
      toTileWidth = innerX + innerTileWidth + filterPadding - x
      if (x + toTileWidth >= toWidth) toTileWidth = toWidth - x

      y = innerY - filterPadding
      if (y < 0) y = 0
      toTileHeight = innerY + innerTileHeight + filterPadding - y
      if (y + toTileHeight >= toHeight) toTileHeight = toHeight - y

      const tileTransform: Omit<TileTransform, 'tile'> = {
        toX: x,
        toY: y,
        toWidth: toTileWidth,
        toHeight: toTileHeight,
        toInnerX: innerX,
        toInnerY: innerY,
        toInnerWidth: innerTileWidth,
        toInnerHeight: innerTileHeight,
        offsetX: x / scaleX - pixelFloor(x / scaleX),
        offsetY: y / scaleY - pixelFloor(y / scaleY),
        scaleX: scaleX,
        scaleY: scaleY,
        x: pixelFloor(x / scaleX),
        y: pixelFloor(y / scaleY),
        width: pixelCeil(toTileWidth / scaleX),
        height: pixelCeil(toTileHeight / scaleY),
        initialSize,
        filterPadding,
        filter,
        unsharpAmount,
        unsharpRadius,
        unsharpThreshold,
      }

      const tile = extractTile(from, fromWidth, tileTransform)

      tileTransforms.push({ tile: tile.buffer, ...tileTransform })
    }
  }

  return tileTransforms
}
