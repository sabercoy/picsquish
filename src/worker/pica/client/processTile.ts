import { Filter, TileData } from '../../..'
import { extractTile } from './extractTile'
import { landTile } from './landTile'
import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

export const processTile = (
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