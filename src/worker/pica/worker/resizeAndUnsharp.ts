import { Filter } from '../../..'
import { resize } from './mm_resize/resize'
import { unsharp as unsharp_mask } from './mm_unsharp_mask/unsharp_mask'

export function resizeAndUnsharp(
  filter: Filter,
  tile: Uint8ClampedArray<ArrayBufferLike>,
  tileWidth: number,
  tileHeight: number,
  tileToWidth: number,
  tileToHeight: number,
  tileScaleX: number,
  tileScaleY: number,
  tileOffsetX: number,
  tileOffsetY: number,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
) {
  const resizedTile = resize(
    filter,
    tile,
    tileWidth,
    tileHeight,
    tileToWidth,
    tileToHeight,
    tileScaleX,
    tileScaleY,
    tileOffsetX,
    tileOffsetY,
  )

  if (unsharpAmount) unsharp_mask(
    resizedTile,
    tileToWidth,
    tileToHeight,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold
  )

  return resizedTile
}
