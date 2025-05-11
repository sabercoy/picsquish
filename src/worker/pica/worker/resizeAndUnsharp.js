import { resize } from './mm_resize/resize'
import { unsharp as unsharp_mask } from './mm_unsharp_mask/unsharp_mask'

/* 
tileOpts: {
  "filter": "mks2013",
  "height": 1008,
  "offsetX": 0,
  "offsetY": 0,
  "scaleX": 0.20833333333333334,
  "scaleY": 0.20833333333333334,
  "src": Uint8ClampedArray,
  "srcBitmap": ImageBitmap (null),
  "toHeight": 210,
  "toWidth": 210,
  "unsharpAmount": 0,
  "unsharpRadius": 0,
  "unsharpThreshold": 0,
  "width": 1008
}
*/

export function resizeAndUnsharp(options, cache) {
  //# detach from "MathLib"
  //# let result = this.resize(options, cache);
  let result = resize(options, cache);

  if (options.unsharpAmount) {
    //# detach from "MathLib"
    //# this.unsharp_mask(
    unsharp_mask(
      result,
      options.toWidth,
      options.toHeight,
      options.unsharpAmount,
      options.unsharpRadius,
      options.unsharpThreshold
    );
  }

  return result;
};