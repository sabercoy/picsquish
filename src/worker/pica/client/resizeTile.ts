import { Filter, TileData } from '../../..'
import { extractTile } from './extractTile'
import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

export const resizeTile = (
  tileData: TileData,
  from: ImageBitmap | OffscreenCanvas,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
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

  return resizedTile
}