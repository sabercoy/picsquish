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

// node_modules/glur/mono16.js
var require_mono16 = __commonJS((exports, module) => {
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
  function convolveMono16(src, out, line, coeff, width, height) {
    var prev_src, curr_src, curr_out, prev_out, prev_prev_out;
    var src_index, out_index, line_index;
    var i, j;
    var coeff_a0, coeff_a1, coeff_b1, coeff_b2;
    for (i = 0;i < height; i++) {
      src_index = i * width;
      out_index = i;
      line_index = 0;
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[6];
      prev_out = prev_prev_out;
      coeff_a0 = coeff[0];
      coeff_a1 = coeff[1];
      coeff_b1 = coeff[4];
      coeff_b2 = coeff[5];
      for (j = 0;j < width; j++) {
        curr_src = src[src_index];
        curr_out = curr_src * coeff_a0 + prev_src * coeff_a1 + prev_out * coeff_b1 + prev_prev_out * coeff_b2;
        prev_prev_out = prev_out;
        prev_out = curr_out;
        prev_src = curr_src;
        line[line_index] = prev_out;
        line_index++;
        src_index++;
      }
      src_index--;
      line_index--;
      out_index += height * (width - 1);
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[7];
      prev_out = prev_prev_out;
      curr_src = prev_src;
      coeff_a0 = coeff[2];
      coeff_a1 = coeff[3];
      for (j = width - 1;j >= 0; j--) {
        curr_out = curr_src * coeff_a0 + prev_src * coeff_a1 + prev_out * coeff_b1 + prev_prev_out * coeff_b2;
        prev_prev_out = prev_out;
        prev_out = curr_out;
        prev_src = curr_src;
        curr_src = src[src_index];
        out[out_index] = line[line_index] + prev_out;
        src_index--;
        line_index--;
        out_index -= height;
      }
    }
  }
  function blurMono16(src, width, height, radius) {
    if (!radius) {
      return;
    }
    var out = new Uint16Array(src.length), tmp_line = new Float32Array(Math.max(width, height));
    var coeff = gaussCoef(radius);
    convolveMono16(src, out, tmp_line, coeff, width, height, radius);
    convolveMono16(out, src, tmp_line, coeff, height, width, radius);
  }
  module.exports = blurMono16;
});

// src/common.ts
class SquishResult {
  raw;
  width;
  height;
  constructor(raw, width, height) {
    this.raw = raw;
    this.width = width;
    this.height = height;
  }
  toImageData() {
    return new ImageData(this.raw, this.width, this.height);
  }
  toImageBitmap() {
    return createImageBitmap(this.toImageData());
  }
  toCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Picsquish error: canvas 2D context not supported");
    context.putImageData(this.toImageData(), 0, 0);
    return canvas;
  }
  toBlob(type = "image/png") {
    const canvas = new OffscreenCanvas(this.width, this.height);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Picsquish error: canvas 2D context not supported");
    context.putImageData(this.toImageData(), 0, 0);
    return canvas.convertToBlob({ type });
  }
}
var BYTES_PER_PIXEL = 4;

// src/main/place-tile.ts
function placeTile(to, toWidth, tileTransform) {
  const tile = new Uint8ClampedArray(tileTransform.tile);
  for (let row = 0;row < tileTransform.toHeight; row++) {
    const fromStart = row * tileTransform.toWidth * BYTES_PER_PIXEL;
    const toStart = ((tileTransform.toY + row) * toWidth + tileTransform.toX) * BYTES_PER_PIXEL;
    to.set(tile.subarray(fromStart, fromStart + tileTransform.toWidth * BYTES_PER_PIXEL), toStart);
  }
}

// src/main/worker-pool.ts
var workerCode = `
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

// node_modules/glur/mono16.js
var require_mono16 = __commonJS((exports, module) => {
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
  function convolveMono16(src, out, line, coeff, width, height) {
    var prev_src, curr_src, curr_out, prev_out, prev_prev_out;
    var src_index, out_index, line_index;
    var i, j;
    var coeff_a0, coeff_a1, coeff_b1, coeff_b2;
    for (i = 0;i < height; i++) {
      src_index = i * width;
      out_index = i;
      line_index = 0;
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[6];
      prev_out = prev_prev_out;
      coeff_a0 = coeff[0];
      coeff_a1 = coeff[1];
      coeff_b1 = coeff[4];
      coeff_b2 = coeff[5];
      for (j = 0;j < width; j++) {
        curr_src = src[src_index];
        curr_out = curr_src * coeff_a0 + prev_src * coeff_a1 + prev_out * coeff_b1 + prev_prev_out * coeff_b2;
        prev_prev_out = prev_out;
        prev_out = curr_out;
        prev_src = curr_src;
        line[line_index] = prev_out;
        line_index++;
        src_index++;
      }
      src_index--;
      line_index--;
      out_index += height * (width - 1);
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[7];
      prev_out = prev_prev_out;
      curr_src = prev_src;
      coeff_a0 = coeff[2];
      coeff_a1 = coeff[3];
      for (j = width - 1;j >= 0; j--) {
        curr_out = curr_src * coeff_a0 + prev_src * coeff_a1 + prev_out * coeff_b1 + prev_prev_out * coeff_b2;
        prev_prev_out = prev_out;
        prev_out = curr_out;
        prev_src = curr_src;
        curr_src = src[src_index];
        out[out_index] = line[line_index] + prev_out;
        src_index--;
        line_index--;
        out_index -= height;
      }
    }
  }
  function blurMono16(src, width, height, radius) {
    if (!radius) {
      return;
    }
    var out = new Uint16Array(src.length), tmp_line = new Float32Array(Math.max(width, height));
    var coeff = gaussCoef(radius);
    convolveMono16(src, out, tmp_line, coeff, width, height, radius);
    convolveMono16(out, src, tmp_line, coeff, height, width, radius);
  }
  module.exports = blurMono16;
});

// src/common.ts
var BYTES_PER_PIXEL = 4;

// src/worker/create-resize-stages.ts
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

// src/worker/extract-tile.ts
function clearSafariCanvas(canvas, context) {
  if (canvas)
    canvas.width = canvas.height = 0;
  canvas = context = null;
}
function extractTileFromOriginalImage(from, tileTransform) {
  let tempCanvas = new OffscreenCanvas(tileTransform.width, tileTransform.height);
  let tempContext = tempCanvas.getContext("2d");
  if (!tempContext)
    throw new Error("Picsquish error: canvas 2D context not supported");
  tempContext.globalCompositeOperation = "copy";
  tempContext.drawImage(from, tileTransform.x, tileTransform.y, tileTransform.width, tileTransform.height, 0, 0, tileTransform.width, tileTransform.height);
  const arrayBuffer = tempContext.getImageData(0, 0, tileTransform.width, tileTransform.height).data.buffer;
  clearSafariCanvas(tempCanvas, tempContext);
  return arrayBuffer;
}
function extractTileFromResizedImage(from, fromWidth, tileTransform) {
  const tilePixels = new Uint8ClampedArray(tileTransform.width * tileTransform.height * BYTES_PER_PIXEL);
  for (let row = 0;row < tileTransform.height; row++) {
    const srcStart = ((tileTransform.y + row) * fromWidth + tileTransform.x) * BYTES_PER_PIXEL;
    const dstStart = row * tileTransform.width * BYTES_PER_PIXEL;
    tilePixels.set(from.subarray(srcStart, srcStart + tileTransform.width * BYTES_PER_PIXEL), dstStart);
  }
  return tilePixels.buffer;
}
function extractTile(from, fromWidth, tileTransform) {
  if (from instanceof ImageBitmap) {
    return extractTileFromOriginalImage(from, tileTransform);
  } else {
    return extractTileFromResizedImage(from, fromWidth, tileTransform);
  }
}

// src/worker/create-tile-transforms.ts
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
function createTileTransforms(from, fromWidth, fromHeight, toWidth, toHeight, tileOptions) {
  const { initialSize, filterPadding, filter, unsharpAmount, unsharpRadius, unsharpThreshold } = tileOptions;
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;
  const innerTileWidth = pixelFloor(initialSize * scaleX) - 2 * filterPadding;
  const innerTileHeight = pixelFloor(initialSize * scaleY) - 2 * filterPadding;
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error("Picsquish error: target tile width/height is too small");
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
      tileTransforms.push({ tile, ...tileTransform });
    }
  }
  return tileTransforms;
}

// src/worker/create-resize-metadata.ts
async function createResizeMetadataForInitialImage(image, tileOptions, dimensionLimits) {
  const imageBitmap = image instanceof ImageBitmap ? image : await createImageBitmap(image);
  const resizeMetadata = [];
  for (const dimensionLimit of dimensionLimits) {
    const from = imageBitmap;
    const fromWidth = imageBitmap.width;
    const fromHeight = imageBitmap.height;
    const widthRatio = dimensionLimit / fromWidth;
    const heightRatio = dimensionLimit / fromHeight;
    const scaleFactor = Math.min(widthRatio, heightRatio, 1);
    const finalToWidth = Math.floor(fromWidth * scaleFactor);
    const finalToHeight = Math.floor(fromHeight * scaleFactor);
    const stages = createResizeStages(fromWidth, fromHeight, finalToWidth, finalToHeight, tileOptions.initialSize, tileOptions.filterPadding);
    const tileTransforms = createTileTransforms(from, fromWidth, fromHeight, stages[0].toWidth, stages[0].toHeight, tileOptions);
    resizeMetadata.push({ stages, tileTransforms });
  }
  imageBitmap.close();
  return resizeMetadata;
}
function createResizeMetadataForResizedImage(image, tileOptions) {
  const tileTransforms = createTileTransforms(image.from, image.fromWidth, image.fromHeight, image.stages[0].toWidth, image.stages[0].toHeight, tileOptions);
  return [{ stages: image.stages, tileTransforms }];
}
async function createResizeMetadata(params) {
  if (params.image instanceof Blob || params.image instanceof ImageBitmap) {
    return createResizeMetadataForInitialImage(params.image, params.tileOptions, params.dimensionLimits);
  } else {
    return createResizeMetadataForResizedImage(params.image, params.tileOptions);
  }
}

// src/worker/multimath/resize-filter-info.ts
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

// src/worker/multimath/resize-filter-gen.ts
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

// src/worker/multimath/unsharp-mask.ts
var import_mono16 = __toESM(require_mono16(), 1);
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
  import_mono16.default(blurred, width, height, radius);
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

// src/worker/transform-tile.ts
function transformTile(tileTransform) {
  const resizedTile = resize(new Uint8ClampedArray(tileTransform.tile), tileTransform.filter, tileTransform.width, tileTransform.height, tileTransform.toWidth, tileTransform.toHeight, tileTransform.scaleX, tileTransform.scaleY, tileTransform.offsetX, tileTransform.offsetY);
  if (tileTransform.unsharpAmount)
    unsharp(resizedTile, tileTransform.toWidth, tileTransform.toHeight, tileTransform.unsharpAmount, tileTransform.unsharpRadius, tileTransform.unsharpThreshold);
  return resizedTile;
}

// src/worker/on-task-message.ts
async function onTask1Message(taskMessage) {
  const { taskId, squishId, taskType, data } = taskMessage;
  const { image, dimensionLimits, tileOptions } = data;
  try {
    const output = await createResizeMetadata({ image, dimensionLimits, tileOptions });
    return { taskId, squishId, taskType, output };
  } catch (error) {
    return { taskId, squishId, taskType, output: error };
  }
}
function onTask2Message(taskMessage) {
  const { taskId, squishId, workspaceIndex, taskType, data } = taskMessage;
  const { tileTransform } = data;
  try {
    tileTransform.tile = transformTile(tileTransform).buffer;
    return { taskId, squishId, workspaceIndex, taskType, output: tileTransform };
  } catch (error) {
    return { taskId, squishId, workspaceIndex, taskType, output: error };
  }
}

// src/worker/worker.ts
self.onmessage = async (event) => {
  switch (event.data.taskType) {
    case 0 /* CreateResizeMetadata */: {
      const taskMessage = event.data;
      const taskResult = await onTask1Message(taskMessage);
      const tiles = taskResult.output instanceof Error ? [] : taskResult.output.flatMap((m) => m.tileTransforms.map((t) => t.tile));
      return self.postMessage(taskResult, tiles);
    }
    case 1 /* TransformTile */: {
      const taskMessage = event.data;
      const taskResult = onTask2Message(taskMessage);
      const tiles = taskResult.output instanceof Error ? [] : [taskResult.output.tile];
      return self.postMessage(taskResult, tiles);
    }
  }
};
`;
var workerBlob = new Blob([workerCode], { type: "application/javascript" });

class WorkerPool {
  #workerToTaskId;
  #taskIdToWorker;
  #timeoutId;
  #maxIdleTime;
  constructor() {
    this.#workerToTaskId = new Map;
    this.#taskIdToWorker = new Map;
    this.#timeoutId = null;
    this.#maxIdleTime = null;
  }
  #clearTimeout() {
    if (this.#timeoutId === null)
      return;
    clearTimeout(this.#timeoutId);
    this.#timeoutId = null;
  }
  prepare(onmessage, maxSize, maxIdleTime) {
    if (this.#workerToTaskId.size)
      return;
    this.#maxIdleTime = maxIdleTime;
    const workerUrl = URL.createObjectURL(workerBlob);
    while (this.#workerToTaskId.size < maxSize) {
      const worker = new Worker(workerUrl);
      worker.onmessage = onmessage;
      this.#workerToTaskId.set(worker, null);
    }
    URL.revokeObjectURL(workerUrl);
  }
  assignTask(worker, taskId, taskMessage, transfer) {
    this.#workerToTaskId.set(worker, taskId);
    this.#taskIdToWorker.set(taskId, worker);
    this.#clearTimeout();
    worker.postMessage(taskMessage, transfer);
  }
  setTimeout() {
    if (this.#timeoutId !== null)
      return;
    if (this.#workerToTaskId.size === 0)
      return;
    this.#timeoutId = setTimeout(() => {
      for (const worker of this.#workerToTaskId.keys()) {
        worker.terminate();
      }
      this.#workerToTaskId.clear();
      this.#taskIdToWorker.clear();
    }, this.#maxIdleTime || 0);
  }
  getAvailableWorkers() {
    const availableWorkers = [];
    for (const [worker, taskId] of this.#workerToTaskId.entries()) {
      if (taskId === null)
        availableWorkers.push(worker);
    }
    return availableWorkers;
  }
  removeTask(taskId) {
    const worker = this.#taskIdToWorker.get(taskId);
    if (worker)
      this.#workerToTaskId.set(worker, null);
    this.#taskIdToWorker.delete(taskId);
  }
}
var workerPool = new WorkerPool;

// src/worker/create-resize-stages.ts
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

// src/worker/extract-tile.ts
function clearSafariCanvas(canvas, context) {
  if (canvas)
    canvas.width = canvas.height = 0;
  canvas = context = null;
}
function extractTileFromOriginalImage(from, tileTransform) {
  let tempCanvas = new OffscreenCanvas(tileTransform.width, tileTransform.height);
  let tempContext = tempCanvas.getContext("2d");
  if (!tempContext)
    throw new Error("Picsquish error: canvas 2D context not supported");
  tempContext.globalCompositeOperation = "copy";
  tempContext.drawImage(from, tileTransform.x, tileTransform.y, tileTransform.width, tileTransform.height, 0, 0, tileTransform.width, tileTransform.height);
  const arrayBuffer = tempContext.getImageData(0, 0, tileTransform.width, tileTransform.height).data.buffer;
  clearSafariCanvas(tempCanvas, tempContext);
  return arrayBuffer;
}
function extractTileFromResizedImage(from, fromWidth, tileTransform) {
  const tilePixels = new Uint8ClampedArray(tileTransform.width * tileTransform.height * BYTES_PER_PIXEL);
  for (let row = 0;row < tileTransform.height; row++) {
    const srcStart = ((tileTransform.y + row) * fromWidth + tileTransform.x) * BYTES_PER_PIXEL;
    const dstStart = row * tileTransform.width * BYTES_PER_PIXEL;
    tilePixels.set(from.subarray(srcStart, srcStart + tileTransform.width * BYTES_PER_PIXEL), dstStart);
  }
  return tilePixels.buffer;
}
function extractTile(from, fromWidth, tileTransform) {
  if (from instanceof ImageBitmap) {
    return extractTileFromOriginalImage(from, tileTransform);
  } else {
    return extractTileFromResizedImage(from, fromWidth, tileTransform);
  }
}

// src/worker/create-tile-transforms.ts
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
function createTileTransforms(from, fromWidth, fromHeight, toWidth, toHeight, tileOptions) {
  const { initialSize, filterPadding, filter, unsharpAmount, unsharpRadius, unsharpThreshold } = tileOptions;
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;
  const innerTileWidth = pixelFloor(initialSize * scaleX) - 2 * filterPadding;
  const innerTileHeight = pixelFloor(initialSize * scaleY) - 2 * filterPadding;
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error("Picsquish error: target tile width/height is too small");
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
      tileTransforms.push({ tile, ...tileTransform });
    }
  }
  return tileTransforms;
}

// src/worker/create-resize-metadata.ts
async function createResizeMetadataForInitialImage(image, tileOptions, dimensionLimits) {
  const imageBitmap = image instanceof ImageBitmap ? image : await createImageBitmap(image);
  const resizeMetadata = [];
  for (const dimensionLimit of dimensionLimits) {
    const from = imageBitmap;
    const fromWidth = imageBitmap.width;
    const fromHeight = imageBitmap.height;
    const widthRatio = dimensionLimit / fromWidth;
    const heightRatio = dimensionLimit / fromHeight;
    const scaleFactor = Math.min(widthRatio, heightRatio, 1);
    const finalToWidth = Math.floor(fromWidth * scaleFactor);
    const finalToHeight = Math.floor(fromHeight * scaleFactor);
    const stages = createResizeStages(fromWidth, fromHeight, finalToWidth, finalToHeight, tileOptions.initialSize, tileOptions.filterPadding);
    const tileTransforms = createTileTransforms(from, fromWidth, fromHeight, stages[0].toWidth, stages[0].toHeight, tileOptions);
    resizeMetadata.push({ stages, tileTransforms });
  }
  imageBitmap.close();
  return resizeMetadata;
}
function createResizeMetadataForResizedImage(image, tileOptions) {
  const tileTransforms = createTileTransforms(image.from, image.fromWidth, image.fromHeight, image.stages[0].toWidth, image.stages[0].toHeight, tileOptions);
  return [{ stages: image.stages, tileTransforms }];
}
async function createResizeMetadata(params) {
  if (params.image instanceof Blob || params.image instanceof ImageBitmap) {
    return createResizeMetadataForInitialImage(params.image, params.tileOptions, params.dimensionLimits);
  } else {
    return createResizeMetadataForResizedImage(params.image, params.tileOptions);
  }
}

// src/worker/multimath/resize-filter-info.ts
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

// src/worker/multimath/resize-filter-gen.ts
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

// src/worker/multimath/unsharp-mask.ts
var import_mono16 = __toESM(require_mono16(), 1);
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
  import_mono16.default(blurred, width, height, radius);
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

// src/worker/transform-tile.ts
function transformTile(tileTransform) {
  const resizedTile = resize(new Uint8ClampedArray(tileTransform.tile), tileTransform.filter, tileTransform.width, tileTransform.height, tileTransform.toWidth, tileTransform.toHeight, tileTransform.scaleX, tileTransform.scaleY, tileTransform.offsetX, tileTransform.offsetY);
  if (tileTransform.unsharpAmount)
    unsharp(resizedTile, tileTransform.toWidth, tileTransform.toHeight, tileTransform.unsharpAmount, tileTransform.unsharpRadius, tileTransform.unsharpThreshold);
  return resizedTile;
}

// src/worker/on-task-message.ts
async function onTask1Message(taskMessage) {
  const { taskId, squishId, taskType, data } = taskMessage;
  const { image, dimensionLimits, tileOptions } = data;
  try {
    const output = await createResizeMetadata({ image, dimensionLimits, tileOptions });
    return { taskId, squishId, taskType, output };
  } catch (error) {
    return { taskId, squishId, taskType, output: error };
  }
}
function onTask2Message(taskMessage) {
  const { taskId, squishId, workspaceIndex, taskType, data } = taskMessage;
  const { tileTransform } = data;
  try {
    tileTransform.tile = transformTile(tileTransform).buffer;
    return { taskId, squishId, workspaceIndex, taskType, output: tileTransform };
  } catch (error) {
    return { taskId, squishId, workspaceIndex, taskType, output: error };
  }
}

// src/main/task-queue.ts
var createId = (() => {
  let count = 0;
  return () => ++count;
})();

class TaskQueue {
  #squishContexts;
  #priority1TaskQueue;
  #priority2TaskQueue;
  constructor() {
    this.#squishContexts = new Map;
    this.#priority1TaskQueue = [];
    this.#priority2TaskQueue = [];
  }
  #processPriority1Task(task, worker) {
    const taskId = createId();
    const taskMessage = {
      taskId,
      squishId: task.squishId,
      taskType: 0 /* CreateResizeMetadata */,
      data: task.data
    };
    if (!worker)
      return onTask1Message(taskMessage).then((r) => this.#onTaskComplete(r));
    const transfer = task.data.image instanceof ImageBitmap ? [task.data.image] : [];
    workerPool.assignTask(worker, taskId, taskMessage, transfer);
  }
  #processPriority2Task(task, worker) {
    const taskId = createId();
    const taskMessage = {
      taskId,
      squishId: task.squishId,
      workspaceIndex: task.workspaceIndex,
      taskType: 1 /* TransformTile */,
      data: task.data
    };
    if (!worker)
      return this.#onTaskComplete(onTask2Message(taskMessage));
    workerPool.assignTask(worker, taskId, taskMessage, [task.data.tileTransform.tile]);
  }
  #processTask(worker) {
    const priority1Task = this.#priority1TaskQueue.shift();
    if (priority1Task)
      return this.#processPriority1Task(priority1Task, worker);
    const priority2Task = this.#priority2TaskQueue.shift();
    if (priority2Task)
      return this.#processPriority2Task(priority2Task, worker);
  }
  #processQueue(useMainThread) {
    const noTasks = this.#priority1TaskQueue.length === 0 && this.#priority2TaskQueue.length === 0;
    if (noTasks)
      return workerPool.setTimeout();
    if (useMainThread)
      return this.#processTask();
    const availableWorkers = workerPool.getAvailableWorkers();
    for (const availableWorker of availableWorkers) {
      this.#processTask(availableWorker);
    }
  }
  #onTask1Complete(squishContext, taskResult) {
    const { squishId, output } = taskResult;
    if (output instanceof Error)
      return squishContext.workspaceHandlers.forEach((h) => h.reject(output));
    for (const [workspaceIndex, resizeMetadata] of output.entries()) {
      const toWidth = resizeMetadata.stages[0].toWidth;
      const toHeight = resizeMetadata.stages[0].toHeight;
      squishContext.workspaces.set(workspaceIndex, {
        to: new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL),
        toWidth,
        toHeight,
        stages: resizeMetadata.stages,
        remainingTileCount: resizeMetadata.tileTransforms.length
      });
      for (const tileTransform of resizeMetadata.tileTransforms) {
        this.#priority2TaskQueue.push({
          squishId,
          workspaceIndex,
          data: { tileTransform }
        });
      }
    }
  }
  #onTask2Complete(squishContext, taskResult) {
    const { squishId, workspaceIndex, output } = taskResult;
    if (!squishContext.workspaces.has(workspaceIndex))
      return;
    const workspace = squishContext.workspaces.get(workspaceIndex);
    if (!workspace)
      throw new Error("Picsquish error: workspace not found");
    const workspaceHandler = squishContext.workspaceHandlers.get(workspaceIndex);
    if (!workspaceHandler)
      throw new Error("Picsquish error: workspaceHandler not found");
    if (output instanceof Error) {
      squishContext.workspaces.delete(workspaceIndex);
      this.#priority2TaskQueue = this.#priority2TaskQueue.filter((t) => !(t.squishId === squishId && t.workspaceIndex === workspaceIndex));
      return workspaceHandler.reject(output);
    }
    placeTile(workspace.to, workspace.toWidth, output);
    --workspace.remainingTileCount;
    if (workspace.remainingTileCount)
      return;
    workspace.stages.shift();
    const nextStage = workspace.stages[0];
    if (!nextStage) {
      squishContext.workspaces.delete(workspaceIndex);
      return workspaceHandler.resolve(new SquishResult(workspace.to, workspace.toWidth, workspace.toHeight));
    }
    this.#priority1TaskQueue.push({
      squishId,
      data: {
        image: {
          from: workspace.to,
          fromWidth: workspace.toWidth,
          fromHeight: workspace.toHeight,
          stages: workspace.stages
        },
        dimensionLimits: [],
        tileOptions: squishContext.tileOptions
      }
    });
  }
  #onTaskComplete(taskResult) {
    const squishContext = this.#squishContexts.get(taskResult.squishId);
    if (!squishContext)
      throw new Error("Picsquish error: squishContext not found");
    switch (taskResult.taskType) {
      case 0 /* CreateResizeMetadata */:
        this.#onTask1Complete(squishContext, taskResult);
        break;
      case 1 /* TransformTile */:
        this.#onTask2Complete(squishContext, taskResult);
        break;
    }
    if (!squishContext.workspaces.size)
      this.#squishContexts.delete(taskResult.squishId);
    workerPool.removeTask(taskResult.taskId);
    this.#processQueue(squishContext.useMainThread);
  }
  add(taskData, maxWorkerPoolSize, maxWorkerPoolIdleTime, useMainThread) {
    if (!useMainThread)
      workerPool.prepare((event) => this.#onTaskComplete(event.data), maxWorkerPoolSize, maxWorkerPoolIdleTime);
    const squishPromises = [];
    const workspaceHandlers = new Map;
    for (let workspaceIndex = 0;workspaceIndex < taskData.dimensionLimits.length; workspaceIndex++) {
      squishPromises.push(new Promise((resolve, reject) => {
        workspaceHandlers.set(workspaceIndex, { resolve, reject });
      }));
    }
    const squishId = createId();
    this.#squishContexts.set(squishId, {
      tileOptions: taskData.tileOptions,
      workspaces: new Map,
      workspaceHandlers,
      useMainThread
    });
    this.#priority1TaskQueue.push({ squishId, data: taskData });
    queueMicrotask(() => this.#processQueue(useMainThread));
    return squishPromises;
  }
}
var taskQueue = new TaskQueue;

// src/main/picsquish.ts
function squish(image, dimensionLimits, options = {}) {
  const tileSize = options.tileSize || 1024;
  const filter = options.filter || "mks2013";
  const unsharpAmount = options.unsharpAmount || 0;
  const unsharpRadius = options.unsharpRadius || 0;
  const unsharpThreshold = options.unsharpThreshold || 0;
  const useMainThread = !!options.useMainThread;
  const hardwareConcurrency = typeof navigator === "undefined" ? 1 : navigator.hardwareConcurrency;
  const maxWorkerPoolSize = options.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4);
  const maxWorkerPoolIdleTime = options.maxWorkerIdleTime || 2000;
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
  if (dimensionLimits instanceof Array)
    return taskQueue.add({ image, dimensionLimits, tileOptions }, maxWorkerPoolSize, maxWorkerPoolIdleTime, useMainThread);
  return taskQueue.add({ image, dimensionLimits: [dimensionLimits], tileOptions }, maxWorkerPoolSize, maxWorkerPoolIdleTime, useMainThread)[0];
}
export {
  squish
};
