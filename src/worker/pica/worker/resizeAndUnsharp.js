import { resize } from './mm_resize/resize'
import { unsharp as unsharp_mask } from './mm_unsharp_mask/unsharp_mask'

export function resizeAndUnsharp(options, cache) {
  let result = resize(options, cache)

  if (options.unsharpAmount) unsharp_mask(
    result,
    options.toWidth,
    options.toHeight,
    options.unsharpAmount,
    options.unsharpRadius,
    options.unsharpThreshold
  )

  return result
}
