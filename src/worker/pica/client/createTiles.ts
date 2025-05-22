import { PicaBaseOptions } from '../../..'

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

export function createTiles(options: PicaBaseOptions & { srcTileSize: number }) {
  let scaleX = options.toWidth / options.width
  let scaleY = options.toHeight / options.height

  let innerTileWidth = pixelFloor(options.srcTileSize * scaleX) - 2 * options.destTileBorder
  let innerTileHeight = pixelFloor(options.srcTileSize * scaleY) - 2 * options.destTileBorder

  // prevent infinite loop, this should never happen
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error('Internal error in pica: target tile width/height is too small.')
  }

  let x, y
  let innerX, innerY, toTileWidth, toTileHeight
  let tiles = []
  let tile

  // we go top-to-down instead of left-to-right to make image displayed from top to
  // doesn in the browser
  for (innerY = 0; innerY < options.toHeight; innerY += innerTileHeight) {
    for (innerX = 0; innerX < options.toWidth; innerX += innerTileWidth) {
      x = innerX - options.destTileBorder
      if (x < 0) { x = 0 }
      toTileWidth = innerX + innerTileWidth + options.destTileBorder - x
      if (x + toTileWidth >= options.toWidth) {
        toTileWidth = options.toWidth - x
      }

      y = innerY - options.destTileBorder;
      if (y < 0) { y = 0; }
      toTileHeight = innerY + innerTileHeight + options.destTileBorder - y
      if (y + toTileHeight >= options.toHeight) {
        toTileHeight = options.toHeight - y
      }

      tile = {
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
      }

      tiles.push(tile)
    }
  }

  return tiles
}
