import { PicaTile } from '../../..'

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

export function createTiles(
  width: number,
  height: number,
  srcTileSize: number,
  toWidth: number,
  toHeight: number,
  destTileBorder: number,
) {
  const scaleX = toWidth / width
  const scaleY = toHeight / height

  const innerTileWidth = pixelFloor(srcTileSize * scaleX) - 2 * destTileBorder
  const innerTileHeight = pixelFloor(srcTileSize * scaleY) - 2 * destTileBorder

  // prevent infinite loop, this should never happen
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error('Internal error in pica: target tile width/height is too small.')
  }

  let x, y
  let innerX, innerY, toTileWidth, toTileHeight
  const tiles: PicaTile[] = []

  // we go top-to-down instead of left-to-right to make image displayed from top to
  // doesn in the browser
  for (innerY = 0; innerY < toHeight; innerY += innerTileHeight) {
    for (innerX = 0; innerX < toWidth; innerX += innerTileWidth) {
      x = innerX - destTileBorder
      if (x < 0) x = 0
      toTileWidth = innerX + innerTileWidth + destTileBorder - x
      if (x + toTileWidth >= toWidth) toTileWidth = toWidth - x

      y = innerY - destTileBorder
      if (y < 0) y = 0
      toTileHeight = innerY + innerTileHeight + destTileBorder - y
      if (y + toTileHeight >= toHeight) toTileHeight = toHeight - y

      tiles.push({
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
      })
    }
  }

  return tiles
}
