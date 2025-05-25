import { Filter, TileData } from '../../..'
import { extractTile } from './extractTile'
import { createTiles } from './createTiles'
import { landTile } from './landTile'
import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

const processTile = (
  tileData: TileData,
  from: ImageBitmap | OffscreenCanvas,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
  toContext: OffscreenCanvasRenderingContext2D,
) => {
  const tile = extractTile(tileData, from)
  const resizedTile = resizeAndUnsharp(
    filter,
    tile,
    tileData.width,
    tileData.height,
    tileData.toWidth,
    tileData.toHeight,
    tileData.scaleX,
    tileData.scaleY,
    tileData.offsetX,
    tileData.offsetY,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
  )

  landTile(tileData, resizedTile, toContext)
}

export async function tileAndResize(
  from: ImageBitmap | OffscreenCanvas,
  to: OffscreenCanvas,
  srcTileSize: number,
  destTileBorder: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
) {
  const toContext = to.getContext('2d')
  if (!toContext) throw new Error('Pica: Canvas context is not supported')

  const tiles = createTiles(
    from.width,
    from.height,
    srcTileSize,
    to.width,
    to.height,
    destTileBorder,
  )

  for (const tile of tiles) {
    processTile(
      tile,
      from,
      filter,
      unsharpAmount,
      unsharpRadius,
      unsharpThreshold,
      toContext,
    )
  }
}
