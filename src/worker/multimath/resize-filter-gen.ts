// Calculate convolution filters for each destination point,
// and pack data to Int16Array:
//
// [ shift, length, data..., shift2, length2, data..., ... ]
//
// - shift - offset in src image
// - length - filter length (in src points)
// - data - filter values sequence
//

import { Filter } from '../../common'
import { FILTER_MAP } from './resize-filter-info'

// Precision of fixed FP values
const FIXED_FRAC_BITS = 14

function toFixedPoint(num: number) {
  return Math.round(num * ((1 << FIXED_FRAC_BITS) - 1))
}

export function resizeFilterGen(
  filter: Filter,
  srcSize: number,
  destSize: number,
  scale: number,
  offset: number,
) {
  let filterFunction = FILTER_MAP[filter].fn

  let scaleInverted = 1.0 / scale
  let scaleClamped = Math.min(1.0, scale) // For upscale

  // Filter window (averaging interval), scaled to src image
  let srcWindow = FILTER_MAP[filter].win / scaleClamped

  let destPixel, srcPixel, srcFirst, srcLast, filterElementSize,
      floatFilter, fxpFilter, total, pxl, idx, floatVal, filterTotal, filterVal
  let leftNotEmpty, rightNotEmpty, filterShift, filterSize

  let maxFilterElementSize = Math.floor((srcWindow + 1) * 2)
  let packedFilter = new Int16Array((maxFilterElementSize + 2) * destSize)
  let packedFilterPtr = 0

  let slowCopy = !packedFilter.subarray || !packedFilter.set

  // For each destination pixel calculate source range and built filter values
  for (destPixel = 0; destPixel < destSize; destPixel++) {

    // Scaling should be done relative to central pixel point
    srcPixel = (destPixel + 0.5) * scaleInverted + offset

    srcFirst = Math.max(0, Math.floor(srcPixel - srcWindow))
    srcLast  = Math.min(srcSize - 1, Math.ceil(srcPixel + srcWindow))

    filterElementSize = srcLast - srcFirst + 1
    floatFilter = new Float32Array(filterElementSize)
    fxpFilter = new Int16Array(filterElementSize)

    total = 0.0

    // Fill filter values for calculated range
    for (pxl = srcFirst, idx = 0; pxl <= srcLast; pxl++, idx++) {
      floatVal = filterFunction(((pxl + 0.5) - srcPixel) * scaleClamped)
      total += floatVal
      floatFilter[idx] = floatVal
    }

    // Normalize filter, convert to fixed point and accumulate conversion error
    filterTotal = 0

    for (idx = 0; idx < floatFilter.length; idx++) {
      filterVal = floatFilter[idx] / total
      filterTotal += filterVal
      fxpFilter[idx] = toFixedPoint(filterVal)
    }

    // Compensate normalization error, to minimize brightness drift
    fxpFilter[destSize >> 1] += toFixedPoint(1.0 - filterTotal)

    //
    // Now pack filter to useable form
    //
    // 1. Trim heading and tailing zero values, and compensate shift/length
    // 2. Put all to single array in this format:
    //
    //    [ pos shift, data length, value1, value2, value3, ... ]
    //

    leftNotEmpty = 0
    while (leftNotEmpty < fxpFilter.length && fxpFilter[leftNotEmpty] === 0) {
      leftNotEmpty++
    }

    if (leftNotEmpty < fxpFilter.length) {
      rightNotEmpty = fxpFilter.length - 1
      while (rightNotEmpty > 0 && fxpFilter[rightNotEmpty] === 0) {
        rightNotEmpty--
      }

      filterShift = srcFirst + leftNotEmpty
      filterSize = rightNotEmpty - leftNotEmpty + 1

      packedFilter[packedFilterPtr++] = filterShift // shift
      packedFilter[packedFilterPtr++] = filterSize // size

      if (!slowCopy) {
        packedFilter.set(fxpFilter.subarray(leftNotEmpty, rightNotEmpty + 1), packedFilterPtr)
        packedFilterPtr += filterSize
      } else {
        // fallback for old IE < 11, without subarray/set methods
        for (idx = leftNotEmpty; idx <= rightNotEmpty; idx++) {
          packedFilter[packedFilterPtr++] = fxpFilter[idx]
        }
      }
    } else {
      // zero data, write header only
      packedFilter[packedFilterPtr++] = 0 // shift
      packedFilter[packedFilterPtr++] = 0 // size
    }
  }

  return packedFilter
}
