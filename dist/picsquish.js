var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/glur/index.js
var require_glur = __commonJS((exports, module) => {
  var a0;
  var a1;
  var a2;
  var a3;
  var b1;
  var b2;
  var left_corner;
  var right_corner;
  function gaussCoef(sigma) {
    if (sigma < 0.5) {
      sigma = 0.5;
    }
    var a = Math.exp(0.726 * 0.726) / sigma, g1 = Math.exp(-a), g2 = Math.exp(-2 * a), k = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2);
    a0 = k;
    a1 = k * (a - 1) * g1;
    a2 = k * (a + 1) * g1;
    a3 = -k * g2;
    b1 = 2 * g1;
    b2 = -g2;
    left_corner = (a0 + a1) / (1 - b1 - b2);
    right_corner = (a2 + a3) / (1 - b1 - b2);
    return new Float32Array([a0, a1, a2, a3, b1, b2, left_corner, right_corner]);
  }
  function convolveRGBA(src, out, line, coeff, width, height) {
    var rgba;
    var prev_src_r, prev_src_g, prev_src_b, prev_src_a;
    var curr_src_r, curr_src_g, curr_src_b, curr_src_a;
    var curr_out_r, curr_out_g, curr_out_b, curr_out_a;
    var prev_out_r, prev_out_g, prev_out_b, prev_out_a;
    var prev_prev_out_r, prev_prev_out_g, prev_prev_out_b, prev_prev_out_a;
    var src_index, out_index, line_index;
    var i, j;
    var coeff_a0, coeff_a1, coeff_b1, coeff_b2;
    for (i = 0;i < height; i++) {
      src_index = i * width;
      out_index = i;
      line_index = 0;
      rgba = src[src_index];
      prev_src_r = rgba & 255;
      prev_src_g = rgba >> 8 & 255;
      prev_src_b = rgba >> 16 & 255;
      prev_src_a = rgba >> 24 & 255;
      prev_prev_out_r = prev_src_r * coeff[6];
      prev_prev_out_g = prev_src_g * coeff[6];
      prev_prev_out_b = prev_src_b * coeff[6];
      prev_prev_out_a = prev_src_a * coeff[6];
      prev_out_r = prev_prev_out_r;
      prev_out_g = prev_prev_out_g;
      prev_out_b = prev_prev_out_b;
      prev_out_a = prev_prev_out_a;
      coeff_a0 = coeff[0];
      coeff_a1 = coeff[1];
      coeff_b1 = coeff[4];
      coeff_b2 = coeff[5];
      for (j = 0;j < width; j++) {
        rgba = src[src_index];
        curr_src_r = rgba & 255;
        curr_src_g = rgba >> 8 & 255;
        curr_src_b = rgba >> 16 & 255;
        curr_src_a = rgba >> 24 & 255;
        curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
        curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
        curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
        curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;
        prev_prev_out_r = prev_out_r;
        prev_prev_out_g = prev_out_g;
        prev_prev_out_b = prev_out_b;
        prev_prev_out_a = prev_out_a;
        prev_out_r = curr_out_r;
        prev_out_g = curr_out_g;
        prev_out_b = curr_out_b;
        prev_out_a = curr_out_a;
        prev_src_r = curr_src_r;
        prev_src_g = curr_src_g;
        prev_src_b = curr_src_b;
        prev_src_a = curr_src_a;
        line[line_index] = prev_out_r;
        line[line_index + 1] = prev_out_g;
        line[line_index + 2] = prev_out_b;
        line[line_index + 3] = prev_out_a;
        line_index += 4;
        src_index++;
      }
      src_index--;
      line_index -= 4;
      out_index += height * (width - 1);
      rgba = src[src_index];
      prev_src_r = rgba & 255;
      prev_src_g = rgba >> 8 & 255;
      prev_src_b = rgba >> 16 & 255;
      prev_src_a = rgba >> 24 & 255;
      prev_prev_out_r = prev_src_r * coeff[7];
      prev_prev_out_g = prev_src_g * coeff[7];
      prev_prev_out_b = prev_src_b * coeff[7];
      prev_prev_out_a = prev_src_a * coeff[7];
      prev_out_r = prev_prev_out_r;
      prev_out_g = prev_prev_out_g;
      prev_out_b = prev_prev_out_b;
      prev_out_a = prev_prev_out_a;
      curr_src_r = prev_src_r;
      curr_src_g = prev_src_g;
      curr_src_b = prev_src_b;
      curr_src_a = prev_src_a;
      coeff_a0 = coeff[2];
      coeff_a1 = coeff[3];
      for (j = width - 1;j >= 0; j--) {
        curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
        curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
        curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
        curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;
        prev_prev_out_r = prev_out_r;
        prev_prev_out_g = prev_out_g;
        prev_prev_out_b = prev_out_b;
        prev_prev_out_a = prev_out_a;
        prev_out_r = curr_out_r;
        prev_out_g = curr_out_g;
        prev_out_b = curr_out_b;
        prev_out_a = curr_out_a;
        prev_src_r = curr_src_r;
        prev_src_g = curr_src_g;
        prev_src_b = curr_src_b;
        prev_src_a = curr_src_a;
        rgba = src[src_index];
        curr_src_r = rgba & 255;
        curr_src_g = rgba >> 8 & 255;
        curr_src_b = rgba >> 16 & 255;
        curr_src_a = rgba >> 24 & 255;
        rgba = (line[line_index] + prev_out_r << 0) + (line[line_index + 1] + prev_out_g << 8) + (line[line_index + 2] + prev_out_b << 16) + (line[line_index + 3] + prev_out_a << 24);
        out[out_index] = rgba;
        src_index--;
        line_index -= 4;
        out_index -= height;
      }
    }
  }
  function blurRGBA(src, width, height, radius) {
    if (!radius) {
      return;
    }
    var src32 = new Uint32Array(src.buffer);
    var out = new Uint32Array(src32.length), tmp_line = new Float32Array(Math.max(width, height) * 4);
    var coeff = gaussCoef(radius);
    convolveRGBA(src32, out, tmp_line, coeff, width, height, radius);
    convolveRGBA(out, src32, tmp_line, coeff, height, width, radius);
  }
  module.exports = blurRGBA;
});

// src/common.ts
var BYTES_PER_PIXEL = 4;

// src/worker/createResizeStages.ts
var MIN_INNER_TILE_SIZE = 2;
function createResizeStages(fromWidth, fromHeight, toWidth, toHeight, initialTileSize, filterPadding) {
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;
  const minScale = (2 * filterPadding + MIN_INNER_TILE_SIZE + 1) / initialTileSize;
  if (minScale > 0.5)
    return [{ toWidth, toHeight }];
  const stageCount = Math.ceil(Math.log(Math.min(scaleX, scaleY)) / Math.log(minScale));
  if (stageCount <= 1)
    return [{ toWidth, toHeight }];
  const stages = [];
  for (let i = 0;i < stageCount; i++) {
    const width = Math.round(Math.pow(Math.pow(fromWidth, stageCount - i - 1) * Math.pow(toWidth, i + 1), 1 / stageCount));
    const height = Math.round(Math.pow(Math.pow(fromHeight, stageCount - i - 1) * Math.pow(toHeight, i + 1), 1 / stageCount));
    stages.push({ toWidth: width, toHeight: height });
  }
  return stages;
}

// src/worker/extractTile.ts
function extractTile(from, fromWidth, tileTransform) {
  const tilePixels = new Uint8ClampedArray(tileTransform.width * tileTransform.height * BYTES_PER_PIXEL);
  for (let row = 0;row < tileTransform.height; row++) {
    const srcStart = ((tileTransform.y + row) * fromWidth + tileTransform.x) * BYTES_PER_PIXEL;
    const dstStart = row * tileTransform.width * BYTES_PER_PIXEL;
    tilePixels.set(from.subarray(srcStart, srcStart + tileTransform.width * BYTES_PER_PIXEL), dstStart);
  }
  return tilePixels;
}

// src/worker/createTileTransforms.ts
var PIXEL_EPSILON = 0.00001;
function pixelFloor(x) {
  let nearest = Math.round(x);
  if (Math.abs(x - nearest) < PIXEL_EPSILON)
    return nearest;
  return Math.floor(x);
}
function pixelCeil(x) {
  let nearest = Math.round(x);
  if (Math.abs(x - nearest) < PIXEL_EPSILON)
    return nearest;
  return Math.ceil(x);
}
function createTileTransforms(from, fromWidth, fromHeight, toWidth, toHeight, initialSize, filterPadding, filter, unsharpAmount, unsharpRadius, unsharpThreshold) {
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;
  const innerTileWidth = pixelFloor(initialSize * scaleX) - 2 * filterPadding;
  const innerTileHeight = pixelFloor(initialSize * scaleY) - 2 * filterPadding;
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error("Internal error in picsquish: target tile width/height is too small.");
  }
  let x, y;
  let innerX, innerY, toTileWidth, toTileHeight;
  const tileTransforms = [];
  for (innerY = 0;innerY < toHeight; innerY += innerTileHeight) {
    for (innerX = 0;innerX < toWidth; innerX += innerTileWidth) {
      x = innerX - filterPadding;
      if (x < 0)
        x = 0;
      toTileWidth = innerX + innerTileWidth + filterPadding - x;
      if (x + toTileWidth >= toWidth)
        toTileWidth = toWidth - x;
      y = innerY - filterPadding;
      if (y < 0)
        y = 0;
      toTileHeight = innerY + innerTileHeight + filterPadding - y;
      if (y + toTileHeight >= toHeight)
        toTileHeight = toHeight - y;
      const tileTransform = {
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
        scaleX,
        scaleY,
        x: pixelFloor(x / scaleX),
        y: pixelFloor(y / scaleY),
        width: pixelCeil(toTileWidth / scaleX),
        height: pixelCeil(toTileHeight / scaleY),
        initialSize,
        filterPadding,
        filter,
        unsharpAmount,
        unsharpRadius,
        unsharpThreshold
      };
      const tile = extractTile(from, fromWidth, tileTransform);
      tileTransforms.push({ tile: tile.buffer, ...tileTransform });
    }
  }
  return tileTransforms;
}

// src/worker/createResizeMetadata.ts
async function createResizeMetadata(params) {
  let from;
  let fromWidth;
  let fromHeight;
  let toWidth;
  let toHeight;
  let stages;
  if (params.image instanceof Blob) {
    const imageBitmap = await createImageBitmap(params.image);
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Canvas 2D context not supported");
    context.drawImage(imageBitmap, 0, 0);
    const imageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    from = imageData.data;
    fromWidth = imageBitmap.width;
    fromHeight = imageBitmap.height;
    imageBitmap.close();
    const widthRatio = params.maxDimension / fromWidth;
    const heightRatio = params.maxDimension / fromHeight;
    const scaleFactor = Math.min(widthRatio, heightRatio, 1);
    const finalToWidth = Math.floor(fromWidth * scaleFactor);
    const finalToHeight = Math.floor(fromHeight * scaleFactor);
    stages = createResizeStages(fromWidth, fromHeight, finalToWidth, finalToHeight, params.tileOptions.initialSize, params.tileOptions.filterPadding);
  } else {
    from = params.image.from;
    fromWidth = params.image.fromWidth;
    fromHeight = params.image.fromHeight;
    stages = params.image.stages;
  }
  toWidth = stages[0].toWidth;
  toHeight = stages[0].toHeight;
  const tileTransforms = createTileTransforms(from, fromWidth, fromHeight, toWidth, toHeight, params.tileOptions.initialSize, params.tileOptions.filterPadding, params.tileOptions.filter, params.tileOptions.unsharpAmount, params.tileOptions.unsharpRadius, params.tileOptions.unsharpThreshold);
  return {
    from: from.buffer,
    fromWidth,
    fromHeight,
    tileTransforms,
    stages
  };
}

// src/worker/placeTile.ts
function placeTile(to, toWidth, tileTransform) {
  const tile = new Uint8ClampedArray(tileTransform.tile);
  for (let row = 0;row < tileTransform.toHeight; row++) {
    const fromStart = row * tileTransform.toWidth * BYTES_PER_PIXEL;
    const toStart = ((tileTransform.toY + row) * toWidth + tileTransform.toX) * BYTES_PER_PIXEL;
    to.set(tile.subarray(fromStart, fromStart + tileTransform.toWidth * BYTES_PER_PIXEL), toStart);
  }
}

// src/worker/multimath/resize_filter_info.ts
var FILTER_MAP = {
  box: {
    win: 0.5,
    fn: (x) => {
      if (x < 0)
        x = -x;
      return x < 0.5 ? 1 : 0;
    }
  },
  hamming: {
    win: 1,
    fn: (x) => {
      if (x < 0)
        x = -x;
      if (x >= 1)
        return 0;
      if (x < 0.00000011920929)
        return 1;
      const xpi = x * Math.PI;
      return Math.sin(xpi) / xpi * (0.54 + 0.46 * Math.cos(xpi / 1));
    }
  },
  lanczos2: {
    win: 2,
    fn: (x) => {
      if (x < 0)
        x = -x;
      if (x >= 2)
        return 0;
      if (x < 0.00000011920929)
        return 1;
      const xpi = x * Math.PI;
      return Math.sin(xpi) / xpi * Math.sin(xpi / 2) / (xpi / 2);
    }
  },
  lanczos3: {
    win: 3,
    fn: (x) => {
      if (x < 0)
        x = -x;
      if (x >= 3)
        return 0;
      if (x < 0.00000011920929)
        return 1;
      const xpi = x * Math.PI;
      return Math.sin(xpi) / xpi * Math.sin(xpi / 3) / (xpi / 3);
    }
  },
  mks2013: {
    win: 2.5,
    fn: (x) => {
      if (x < 0)
        x = -x;
      if (x >= 2.5)
        return 0;
      if (x >= 1.5)
        return -0.125 * (x - 2.5) * (x - 2.5);
      if (x >= 0.5)
        return 0.25 * (4 * x * x - 11 * x + 7);
      return 1.0625 - 1.75 * x * x;
    }
  }
};

// src/worker/multimath/resize_filter_gen.ts
var FIXED_FRAC_BITS = 14;
function toFixedPoint(num) {
  return Math.round(num * ((1 << FIXED_FRAC_BITS) - 1));
}
function resizeFilterGen(filter, srcSize, destSize, scale, offset) {
  let filterFunction = FILTER_MAP[filter].fn;
  let scaleInverted = 1 / scale;
  let scaleClamped = Math.min(1, scale);
  let srcWindow = FILTER_MAP[filter].win / scaleClamped;
  let destPixel, srcPixel, srcFirst, srcLast, filterElementSize, floatFilter, fxpFilter, total, pxl, idx, floatVal, filterTotal, filterVal;
  let leftNotEmpty, rightNotEmpty, filterShift, filterSize;
  let maxFilterElementSize = Math.floor((srcWindow + 1) * 2);
  let packedFilter = new Int16Array((maxFilterElementSize + 2) * destSize);
  let packedFilterPtr = 0;
  let slowCopy = !packedFilter.subarray || !packedFilter.set;
  for (destPixel = 0;destPixel < destSize; destPixel++) {
    srcPixel = (destPixel + 0.5) * scaleInverted + offset;
    srcFirst = Math.max(0, Math.floor(srcPixel - srcWindow));
    srcLast = Math.min(srcSize - 1, Math.ceil(srcPixel + srcWindow));
    filterElementSize = srcLast - srcFirst + 1;
    floatFilter = new Float32Array(filterElementSize);
    fxpFilter = new Int16Array(filterElementSize);
    total = 0;
    for (pxl = srcFirst, idx = 0;pxl <= srcLast; pxl++, idx++) {
      floatVal = filterFunction((pxl + 0.5 - srcPixel) * scaleClamped);
      total += floatVal;
      floatFilter[idx] = floatVal;
    }
    filterTotal = 0;
    for (idx = 0;idx < floatFilter.length; idx++) {
      filterVal = floatFilter[idx] / total;
      filterTotal += filterVal;
      fxpFilter[idx] = toFixedPoint(filterVal);
    }
    fxpFilter[destSize >> 1] += toFixedPoint(1 - filterTotal);
    leftNotEmpty = 0;
    while (leftNotEmpty < fxpFilter.length && fxpFilter[leftNotEmpty] === 0) {
      leftNotEmpty++;
    }
    if (leftNotEmpty < fxpFilter.length) {
      rightNotEmpty = fxpFilter.length - 1;
      while (rightNotEmpty > 0 && fxpFilter[rightNotEmpty] === 0) {
        rightNotEmpty--;
      }
      filterShift = srcFirst + leftNotEmpty;
      filterSize = rightNotEmpty - leftNotEmpty + 1;
      packedFilter[packedFilterPtr++] = filterShift;
      packedFilter[packedFilterPtr++] = filterSize;
      if (!slowCopy) {
        packedFilter.set(fxpFilter.subarray(leftNotEmpty, rightNotEmpty + 1), packedFilterPtr);
        packedFilterPtr += filterSize;
      } else {
        for (idx = leftNotEmpty;idx <= rightNotEmpty; idx++) {
          packedFilter[packedFilterPtr++] = fxpFilter[idx];
        }
      }
    } else {
      packedFilter[packedFilterPtr++] = 0;
      packedFilter[packedFilterPtr++] = 0;
    }
  }
  return packedFilter;
}

// src/worker/multimath/convolve.ts
function clampTo8(i) {
  return i < 0 ? 0 : i > 255 ? 255 : i;
}
function clampNegative(i) {
  return i >= 0 ? i : 0;
}
function convolveHor(src, dest, srcW, srcH, destW, filters) {
  let r, g, b, a;
  let filterPtr, filterShift, filterSize;
  let srcPtr, srcY, destX, filterVal;
  let srcOffset = 0, destOffset = 0;
  for (srcY = 0;srcY < srcH; srcY++) {
    filterPtr = 0;
    for (destX = 0;destX < destW; destX++) {
      filterShift = filters[filterPtr++];
      filterSize = filters[filterPtr++];
      srcPtr = srcOffset + filterShift * 4 | 0;
      r = g = b = a = 0;
      for (;filterSize > 0; filterSize--) {
        filterVal = filters[filterPtr++];
        a = a + filterVal * src[srcPtr + 3] | 0;
        b = b + filterVal * src[srcPtr + 2] | 0;
        g = g + filterVal * src[srcPtr + 1] | 0;
        r = r + filterVal * src[srcPtr] | 0;
        srcPtr = srcPtr + 4 | 0;
      }
      dest[destOffset + 3] = clampNegative(a >> 7);
      dest[destOffset + 2] = clampNegative(b >> 7);
      dest[destOffset + 1] = clampNegative(g >> 7);
      dest[destOffset] = clampNegative(r >> 7);
      destOffset = destOffset + srcH * 4 | 0;
    }
    destOffset = (srcY + 1) * 4 | 0;
    srcOffset = (srcY + 1) * srcW * 4 | 0;
  }
}
function convolveVert(src, dest, srcW, srcH, destW, filters) {
  let r, g, b, a;
  let filterPtr, filterShift, filterSize;
  let srcPtr, srcY, destX, filterVal;
  let srcOffset = 0, destOffset = 0;
  for (srcY = 0;srcY < srcH; srcY++) {
    filterPtr = 0;
    for (destX = 0;destX < destW; destX++) {
      filterShift = filters[filterPtr++];
      filterSize = filters[filterPtr++];
      srcPtr = srcOffset + filterShift * 4 | 0;
      r = g = b = a = 0;
      for (;filterSize > 0; filterSize--) {
        filterVal = filters[filterPtr++];
        a = a + filterVal * src[srcPtr + 3] | 0;
        b = b + filterVal * src[srcPtr + 2] | 0;
        g = g + filterVal * src[srcPtr + 1] | 0;
        r = r + filterVal * src[srcPtr] | 0;
        srcPtr = srcPtr + 4 | 0;
      }
      r >>= 7;
      g >>= 7;
      b >>= 7;
      a >>= 7;
      dest[destOffset + 3] = clampTo8(a + (1 << 13) >> 14);
      dest[destOffset + 2] = clampTo8(b + (1 << 13) >> 14);
      dest[destOffset + 1] = clampTo8(g + (1 << 13) >> 14);
      dest[destOffset] = clampTo8(r + (1 << 13) >> 14);
      destOffset = destOffset + srcH * 4 | 0;
    }
    destOffset = (srcY + 1) * 4 | 0;
    srcOffset = (srcY + 1) * srcW * 4 | 0;
  }
}
function convolveHorWithPre(src, dest, srcW, srcH, destW, filters) {
  let r, g, b, a, alpha;
  let filterPtr, filterShift, filterSize;
  let srcPtr, srcY, destX, filterVal;
  let srcOffset = 0, destOffset = 0;
  for (srcY = 0;srcY < srcH; srcY++) {
    filterPtr = 0;
    for (destX = 0;destX < destW; destX++) {
      filterShift = filters[filterPtr++];
      filterSize = filters[filterPtr++];
      srcPtr = srcOffset + filterShift * 4 | 0;
      r = g = b = a = 0;
      for (;filterSize > 0; filterSize--) {
        filterVal = filters[filterPtr++];
        alpha = src[srcPtr + 3];
        a = a + filterVal * alpha | 0;
        b = b + filterVal * src[srcPtr + 2] * alpha | 0;
        g = g + filterVal * src[srcPtr + 1] * alpha | 0;
        r = r + filterVal * src[srcPtr] * alpha | 0;
        srcPtr = srcPtr + 4 | 0;
      }
      b = b / 255 | 0;
      g = g / 255 | 0;
      r = r / 255 | 0;
      dest[destOffset + 3] = clampNegative(a >> 7);
      dest[destOffset + 2] = clampNegative(b >> 7);
      dest[destOffset + 1] = clampNegative(g >> 7);
      dest[destOffset] = clampNegative(r >> 7);
      destOffset = destOffset + srcH * 4 | 0;
    }
    destOffset = (srcY + 1) * 4 | 0;
    srcOffset = (srcY + 1) * srcW * 4 | 0;
  }
}
function convolveVertWithPre(src, dest, srcW, srcH, destW, filters) {
  let r, g, b, a;
  let filterPtr, filterShift, filterSize;
  let srcPtr, srcY, destX, filterVal;
  let srcOffset = 0, destOffset = 0;
  for (srcY = 0;srcY < srcH; srcY++) {
    filterPtr = 0;
    for (destX = 0;destX < destW; destX++) {
      filterShift = filters[filterPtr++];
      filterSize = filters[filterPtr++];
      srcPtr = srcOffset + filterShift * 4 | 0;
      r = g = b = a = 0;
      for (;filterSize > 0; filterSize--) {
        filterVal = filters[filterPtr++];
        a = a + filterVal * src[srcPtr + 3] | 0;
        b = b + filterVal * src[srcPtr + 2] | 0;
        g = g + filterVal * src[srcPtr + 1] | 0;
        r = r + filterVal * src[srcPtr] | 0;
        srcPtr = srcPtr + 4 | 0;
      }
      r >>= 7;
      g >>= 7;
      b >>= 7;
      a >>= 7;
      a = clampTo8(a + (1 << 13) >> 14);
      if (a > 0) {
        r = r * 255 / a | 0;
        g = g * 255 / a | 0;
        b = b * 255 / a | 0;
      }
      dest[destOffset + 3] = a;
      dest[destOffset + 2] = clampTo8(b + (1 << 13) >> 14);
      dest[destOffset + 1] = clampTo8(g + (1 << 13) >> 14);
      dest[destOffset] = clampTo8(r + (1 << 13) >> 14);
      destOffset = destOffset + srcH * 4 | 0;
    }
    destOffset = (srcY + 1) * 4 | 0;
    srcOffset = (srcY + 1) * srcW * 4 | 0;
  }
}

// src/worker/multimath/resize.ts
function hasAlpha(src, width, height) {
  let ptr = 3;
  let len = width * height * 4 | 0;
  while (ptr < len) {
    if (src[ptr] !== 255)
      return true;
    ptr = ptr + 4 | 0;
  }
  return false;
}
function resetAlpha(dest, width, height) {
  let ptr = 3;
  let len = width * height * 4 | 0;
  while (ptr < len) {
    dest[ptr] = 255;
    ptr = ptr + 4 | 0;
  }
}
function resize(tile, filter, tileWidth, tileHeight, tileToWidth, tileToHeight, tileScaleX, tileScaleY, tileOffsetX, tileOffsetY) {
  const filtersX = resizeFilterGen(filter, tileWidth, tileToWidth, tileScaleX, tileOffsetX);
  const filtersY = resizeFilterGen(filter, tileHeight, tileToHeight, tileScaleY, tileOffsetY);
  const dest = new Uint8Array(tileToWidth * tileToHeight * 4);
  const temp = new Uint16Array(tileToWidth * tileHeight * 4);
  if (hasAlpha(tile, tileWidth, tileHeight)) {
    convolveHorWithPre(tile, temp, tileWidth, tileHeight, tileToWidth, filtersX);
    convolveVertWithPre(temp, dest, tileHeight, tileToWidth, tileToHeight, filtersY);
  } else {
    convolveHor(tile, temp, tileWidth, tileHeight, tileToWidth, filtersX);
    convolveVert(temp, dest, tileHeight, tileToWidth, tileToHeight, filtersY);
    resetAlpha(dest, tileToWidth, tileToHeight);
  }
  return dest;
}

// src/worker/multimath/unsharp_mask.ts
var import_glur = __toESM(require_glur(), 1);
function hsv_v16(img, width, height) {
  let size = width * height;
  let out = new Uint16Array(size);
  let r, g, b, max;
  for (let i = 0;i < size; i++) {
    r = img[4 * i];
    g = img[4 * i + 1];
    b = img[4 * i + 2];
    max = r >= g && r >= b ? r : g >= b && g >= r ? g : b;
    out[i] = max << 8;
  }
  return out;
}
function unsharp(img, width, height, amount, radius, threshold) {
  let v1, v2, vmul;
  let diff, iTimes4;
  if (amount === 0 || radius < 0.5) {
    return;
  }
  if (radius > 2) {
    radius = 2;
  }
  let brightness = hsv_v16(img, width, height);
  let blurred = new Uint16Array(brightness);
  import_glur.default(blurred, width, height, radius);
  let amountFp = amount / 100 * 4096 + 0.5 | 0;
  let thresholdFp = threshold << 8;
  let size = width * height;
  for (let i = 0;i < size; i++) {
    v1 = brightness[i];
    diff = v1 - blurred[i];
    if (Math.abs(diff) >= thresholdFp) {
      v2 = v1 + (amountFp * diff + 2048 >> 12);
      v2 = v2 > 65280 ? 65280 : v2;
      v2 = v2 < 0 ? 0 : v2;
      v1 = v1 !== 0 ? v1 : 1;
      vmul = (v2 << 12) / v1 | 0;
      iTimes4 = i * 4;
      img[iTimes4] = img[iTimes4] * vmul + 2048 >> 12;
      img[iTimes4 + 1] = img[iTimes4 + 1] * vmul + 2048 >> 12;
      img[iTimes4 + 2] = img[iTimes4 + 2] * vmul + 2048 >> 12;
    }
  }
}

// src/worker/transformTile.ts
function transformTile(tileTransform) {
  const resizedTile = resize(new Uint8ClampedArray(tileTransform.tile), tileTransform.filter, tileTransform.width, tileTransform.height, tileTransform.toWidth, tileTransform.toHeight, tileTransform.scaleX, tileTransform.scaleY, tileTransform.offsetX, tileTransform.offsetY);
  if (tileTransform.unsharpAmount)
    unsharp(resizedTile, tileTransform.toWidth, tileTransform.toHeight, tileTransform.unsharpAmount, tileTransform.unsharpRadius, tileTransform.unsharpThreshold);
  return resizedTile;
}

// src/main/task-queue.ts
var createId = (() => {
  let count = 0;
  return () => ++count;
})();

class WorkerPool {
  #workerToTaskId;
  #workerToTimeoutId;
  #taskIdToWorker;
  #taskIdToTask;
  constructor() {
    this.#workerToTaskId = new Map;
    this.#workerToTimeoutId = new Map;
    this.#taskIdToWorker = new Map;
    this.#taskIdToTask = new Map;
  }
  get count() {
    return this.#workerToTaskId.size;
  }
  #clearWorkerTimeout(worker) {
    clearTimeout(this.#workerToTimeoutId.get(worker));
  }
  #assignTask(worker, task, taskMessage, transfer) {
    this.#workerToTaskId.set(worker, task.id);
    this.#taskIdToWorker.set(task.id, worker);
    this.#taskIdToTask.set(task.id, task);
    worker.postMessage(taskMessage, transfer);
    this.#clearWorkerTimeout(worker);
  }
  assignPriority1Task(worker, task) {
    const taskMessage = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: 0 /* CreateResizeMetadata */,
      image: task.data.image,
      maxDimension: task.data.maxDimension,
      tileOptions: task.data.tileOptions
    };
    this.#assignTask(worker, task, taskMessage, []);
  }
  assignPriority2Task(worker, task) {
    const taskMessage = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: 1 /* TransformTile */,
      tileTransform: task.data.tileTransform
    };
    this.#assignTask(worker, task, taskMessage, [taskMessage.tileTransform.tile]);
  }
  setWorkerTimeout(worker, duration) {
    const id = setTimeout(() => {
      const taskId = this.#workerToTaskId.get(worker);
      if (taskId)
        this.#taskIdToWorker.delete(taskId);
      if (taskId)
        this.#taskIdToTask.delete(taskId);
      this.#workerToTimeoutId.delete(worker);
      this.#workerToTaskId.delete(worker);
      worker.terminate();
    }, duration);
    this.#workerToTimeoutId.set(worker, id);
  }
  addWorker(worker) {
    this.#workerToTaskId.set(worker, null);
  }
  getWorker(taskId) {
    return this.#taskIdToWorker.get(taskId);
  }
  getTask(taskId) {
    return this.#taskIdToTask.get(taskId);
  }
  getAvailableWorker() {
    for (const [worker, taskId] of this.#workerToTaskId.entries()) {
      if (taskId === null)
        return worker;
    }
    return null;
  }
  removeTask(taskId) {
    const worker = this.#taskIdToWorker.get(taskId);
    if (worker)
      this.#workerToTaskId.set(worker, null);
    this.#taskIdToWorker.delete(taskId);
    this.#taskIdToTask.delete(taskId);
  }
}

class TaskQueue {
  #maxIdleTime;
  #maxPoolSize;
  #squishContexts;
  #priority1TaskQueue;
  #priority2TaskQueue;
  #workerPool;
  constructor(maxWorkerPoolSize, maxWorkerIdleTime) {
    this.#maxPoolSize = maxWorkerPoolSize;
    this.#maxIdleTime = maxWorkerIdleTime;
    this.#squishContexts = new Map;
    this.#priority1TaskQueue = [];
    this.#priority2TaskQueue = [];
    this.#workerPool = new WorkerPool;
  }
  #createWorker() {
    const worker = new Worker(new URL("./picsquish-worker.js", import.meta.url));
    worker.onmessage = (event) => {
      const squishContext = this.#squishContexts.get(event.data.squishId);
      if (!squishContext)
        throw new Error("SquishContext not found");
      if (event.data.error)
        squishContext.reject(event.data.error);
      if (event.data.taskType === 0 /* CreateResizeMetadata */) {
        const { squishId, output } = event.data;
        const toWidth = output.stages[0].toWidth;
        const toHeight = output.stages[0].toHeight;
        squishContext.from = new Uint8ClampedArray(output.from);
        squishContext.fromWidth = output.fromWidth;
        squishContext.fromHeight = output.fromHeight;
        squishContext.to = new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL);
        squishContext.toWidth = toWidth;
        squishContext.toHeight = toHeight;
        squishContext.stages = output.stages;
        squishContext.remainingTileCount = output.tileTransforms.length;
        for (const tileTransform of output.tileTransforms) {
          this.#priority2TaskQueue.push({
            id: createId(),
            squishId,
            data: {
              tileTransform
            }
          });
          this.#processQueue();
        }
      }
      if (event.data.taskType === 1 /* TransformTile */) {
        const { taskId, squishId, output } = event.data;
        if (!squishContext.to)
          throw new Error("SquishContext to not found");
        placeTile(squishContext.to, squishContext.toWidth, output.tileTransform);
        squishContext.remainingTileCount--;
        if (!squishContext.remainingTileCount) {
          squishContext.stages.shift();
          if (squishContext.stages[0]) {
            this.#priority1TaskQueue.push({
              id: taskId,
              squishId,
              data: {
                image: {
                  from: squishContext.to,
                  fromWidth: squishContext.toWidth,
                  fromHeight: squishContext.toHeight,
                  stages: squishContext.stages
                },
                maxDimension: squishContext.maxDimension,
                tileOptions: squishContext.tileOptions
              }
            });
          } else {
            const imageData = new ImageData(squishContext.to, squishContext.toWidth, squishContext.toHeight);
            createImageBitmap(imageData).then((imageBitmap) => {
              this.#squishContexts.delete(event.data.squishId);
              squishContext.resolve(imageBitmap);
            });
          }
        }
      }
      const finishedWorker = this.#workerPool.getWorker(event.data.taskId);
      if (finishedWorker)
        this.#workerPool.setWorkerTimeout(finishedWorker, this.#maxIdleTime);
      this.#workerPool.removeTask(event.data.taskId);
      this.#processQueue();
    };
    this.#workerPool.addWorker(worker);
  }
  #processQueue() {
    const availableWorker = this.#workerPool.getAvailableWorker();
    if (availableWorker) {
      const priority1Task = this.#priority1TaskQueue.shift();
      if (priority1Task)
        return this.#workerPool.assignPriority1Task(availableWorker, priority1Task);
      const priority2Task = this.#priority2TaskQueue.shift();
      if (priority2Task)
        return this.#workerPool.assignPriority2Task(availableWorker, priority2Task);
    } else if (this.#workerPool.count < this.#maxPoolSize) {
      this.#createWorker();
      this.#processQueue();
    }
  }
  add(taskData) {
    return new Promise((resolve, reject) => {
      const taskId = createId();
      this.#squishContexts.set(taskId, {
        maxDimension: taskData.maxDimension,
        tileOptions: taskData.tileOptions,
        from: null,
        fromWidth: 0,
        fromHeight: 0,
        to: null,
        toWidth: 0,
        toHeight: 0,
        stages: [],
        remainingTileCount: Infinity,
        resolve,
        reject
      });
      this.#priority1TaskQueue.push({
        id: taskId,
        squishId: taskId,
        data: taskData
      });
      this.#processQueue();
    });
  }
}

// src/main/picsquish.ts
class PicSquish {
  #taskQueue;
  #globalOptions;
  constructor(globalOptions) {
    const hardwareConcurrency = typeof navigator === "undefined" ? 1 : navigator.hardwareConcurrency;
    const maxWorkerPoolSize = globalOptions.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4);
    const maxWorkerIdleTime = globalOptions.maxWorkerIdleTime || 2000;
    this.#taskQueue = new TaskQueue(maxWorkerPoolSize, maxWorkerIdleTime);
    this.#globalOptions = globalOptions;
  }
  async#squishOnMainThread(blob, maxDimension, tileOptions) {
    let resizedImage = null;
    let from;
    let fromWidth;
    let fromHeight;
    let to;
    let toWidth;
    let toHeight;
    for (;; ) {
      const metadata = await createResizeMetadata({ image: resizedImage || blob, maxDimension, tileOptions });
      from = new Uint8ClampedArray(metadata.from);
      fromWidth = metadata.fromWidth;
      fromHeight = metadata.fromHeight;
      toWidth = metadata.stages[0].toWidth;
      toHeight = metadata.stages[0].toHeight;
      to = new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL);
      for (const tileTransform of metadata.tileTransforms) {
        tileTransform.tile = transformTile(tileTransform).buffer;
        placeTile(to, toWidth, tileTransform);
      }
      metadata.stages.shift();
      resizedImage = { from: to, fromWidth: toWidth, fromHeight: toHeight, stages: metadata.stages };
      if (!metadata.stages[0])
        break;
    }
    const imageData = new ImageData(resizedImage.from, resizedImage.fromWidth, resizedImage.fromHeight);
    return await createImageBitmap(imageData);
  }
  async squish(blob, localOptions) {
    const combinedOptions = localOptions ? { ...this.#globalOptions, ...localOptions } : this.#globalOptions;
    const maxDimension = combinedOptions.maxDimension;
    const tileSize = combinedOptions.tileSize || 1024;
    const filter = combinedOptions.filter || "mks2013";
    const unsharpAmount = combinedOptions.unsharpAmount || 0;
    const unsharpRadius = combinedOptions.unsharpRadius || 0;
    const unsharpThreshold = combinedOptions.unsharpThreshold || 0;
    const useMainThread = combinedOptions.useMainThread;
    const FILTER_PADDING = 3;
    const filterPadding = Math.ceil(Math.max(FILTER_PADDING, 2.5 * unsharpRadius | 0));
    const tileOptions = {
      initialSize: tileSize,
      filterPadding,
      filter,
      unsharpAmount,
      unsharpRadius,
      unsharpThreshold
    };
    if (useMainThread)
      return await this.#squishOnMainThread(blob, maxDimension, tileOptions);
    return this.#taskQueue.add({ image: blob, maxDimension, tileOptions });
  }
}
export {
  PicSquish
};
