import { TileTransform } from '../common'
import { resize } from './multimath/resize'
import { unsharp as unsharp_mask } from './multimath/unsharp-mask'

export function transformTile(tileTransform: TileTransform) {
  const resizedTile = resize(
    new Uint8ClampedArray(tileTransform.tile),
    tileTransform.filter,
    tileTransform.width,
    tileTransform.height,
    tileTransform.toWidth,
    tileTransform.toHeight,
    tileTransform.scaleX,
    tileTransform.scaleY,
    tileTransform.offsetX,
    tileTransform.offsetY,
  )

  if (tileTransform.unsharpAmount) unsharp_mask(
    resizedTile,
    tileTransform.toWidth,
    tileTransform.toHeight,
    tileTransform.unsharpAmount,
    tileTransform.unsharpRadius,
    tileTransform.unsharpThreshold
  )

  return resizedTile
}
