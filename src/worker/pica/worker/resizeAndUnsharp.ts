import { PicaTileOptions } from '../../..'
import { resize } from './mm_resize/resize'
import { unsharp as unsharp_mask } from './mm_unsharp_mask/unsharp_mask'

export function resizeAndUnsharp(picaTileOptions: PicaTileOptions) {
  let result = resize(picaTileOptions)

  if (picaTileOptions.unsharpAmount) unsharp_mask(
    result,
    picaTileOptions.toWidth,
    picaTileOptions.toHeight,
    picaTileOptions.unsharpAmount,
    picaTileOptions.unsharpRadius,
    picaTileOptions.unsharpThreshold
  )

  return result
}
