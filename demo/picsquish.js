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

// src/worker/pica/client/createStages.ts
var MIN_INNER_TILE_SIZE = 2;
function createStages(fromWidth, fromHeight, toWidth, toHeight, srcTileSize, destTileBorder) {
  let scaleX = toWidth / fromWidth;
  let scaleY = toHeight / fromHeight;
  let minScale = (2 * destTileBorder + MIN_INNER_TILE_SIZE + 1) / srcTileSize;
  if (minScale > 0.5)
    return [[toWidth, toHeight]];
  let stageCount = Math.ceil(Math.log(Math.min(scaleX, scaleY)) / Math.log(minScale));
  if (stageCount <= 1)
    return [[toWidth, toHeight]];
  let result = [];
  for (let i = 0;i < stageCount; i++) {
    let width = Math.round(Math.pow(Math.pow(fromWidth, stageCount - i - 1) * Math.pow(toWidth, i + 1), 1 / stageCount));
    let height = Math.round(Math.pow(Math.pow(fromHeight, stageCount - i - 1) * Math.pow(toHeight, i + 1), 1 / stageCount));
    result.push([width, height]);
  }
  return result;
}

// src/worker/pica/client/extractTileData.ts
function extractTileData(tile, from, opts, stageEnv, extractTo) {
  const tmpCanvas = new OffscreenCanvas(tile.width, tile.height);
  const tmpCtx = tmpCanvas.getContext("2d");
  if (!tmpCtx)
    throw new Error("Pica: Canvas context is not supported");
  tmpCtx.globalCompositeOperation = "copy";
  tmpCtx.drawImage(stageEnv.srcImageBitmap || from, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.width, tile.height);
  extractTo.src = tmpCtx.getImageData(0, 0, tile.width, tile.height).data;
  tmpCanvas.width = tmpCanvas.height = 0;
  return extractTo;
}

// src/worker/pica/client/createTiles.ts
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
function createTiles(options) {
  let scaleX = options.toWidth / options.width;
  let scaleY = options.toHeight / options.height;
  let innerTileWidth = pixelFloor(options.srcTileSize * scaleX) - 2 * options.destTileBorder;
  let innerTileHeight = pixelFloor(options.srcTileSize * scaleY) - 2 * options.destTileBorder;
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error("Internal error in pica: target tile width/height is too small.");
  }
  let x, y;
  let innerX, innerY, toTileWidth, toTileHeight;
  let tiles = [];
  let tile;
  for (innerY = 0;innerY < options.toHeight; innerY += innerTileHeight) {
    for (innerX = 0;innerX < options.toWidth; innerX += innerTileWidth) {
      x = innerX - options.destTileBorder;
      if (x < 0) {
        x = 0;
      }
      toTileWidth = innerX + innerTileWidth + options.destTileBorder - x;
      if (x + toTileWidth >= options.toWidth) {
        toTileWidth = options.toWidth - x;
      }
      y = innerY - options.destTileBorder;
      if (y < 0) {
        y = 0;
      }
      toTileHeight = innerY + innerTileHeight + options.destTileBorder - y;
      if (y + toTileHeight >= options.toHeight) {
        toTileHeight = options.toHeight - y;
      }
      tile = {
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
        height: pixelCeil(toTileHeight / scaleY)
      };
      tiles.push(tile);
    }
  }
  return tiles;
}

// src/worker/pica/worker/mm_resize/resize_filter_info.ts
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

// src/worker/pica/worker/mm_resize/resize_filter_gen.ts
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

// src/worker/pica/worker/mm_resize/convolve.ts
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

// src/worker/pica/worker/mm_resize/resize.ts
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
function resetAlpha(dst, width, height) {
  let ptr = 3;
  let len = width * height * 4 | 0;
  while (ptr < len) {
    dst[ptr] = 255;
    ptr = ptr + 4 | 0;
  }
}
function resize(picaTileOptions) {
  const src = picaTileOptions.src;
  const srcW = picaTileOptions.width;
  const srcH = picaTileOptions.height;
  const destW = picaTileOptions.toWidth;
  const destH = picaTileOptions.toHeight;
  const scaleX = picaTileOptions.scaleX || picaTileOptions.toWidth / picaTileOptions.width;
  const scaleY = picaTileOptions.scaleY || picaTileOptions.toHeight / picaTileOptions.height;
  const offsetX = picaTileOptions.offsetX || 0;
  const offsetY = picaTileOptions.offsetY || 0;
  const dest = picaTileOptions.dest || new Uint8Array(destW * destH * 4);
  const filter = typeof picaTileOptions.filter === "undefined" ? "mks2013" : picaTileOptions.filter;
  const filtersX = resizeFilterGen(filter, srcW, destW, scaleX, offsetX);
  const filtersY = resizeFilterGen(filter, srcH, destH, scaleY, offsetY);
  const tmp = new Uint16Array(destW * srcH * 4);
  if (hasAlpha(src, srcW, srcH)) {
    convolveHorWithPre(src, tmp, srcW, srcH, destW, filtersX);
    convolveVertWithPre(tmp, dest, srcH, destW, destH, filtersY);
  } else {
    convolveHor(src, tmp, srcW, srcH, destW, filtersX);
    convolveVert(tmp, dest, srcH, destW, destH, filtersY);
    resetAlpha(dest, destW, destH);
  }
  return dest;
}

// src/worker/pica/worker/mm_unsharp_mask/unsharp_mask.ts
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

// src/worker/pica/worker/resizeAndUnsharp.ts
function resizeAndUnsharp(picaTileOptions) {
  let result = resize(picaTileOptions);
  if (picaTileOptions.unsharpAmount)
    unsharp(result, picaTileOptions.toWidth, picaTileOptions.toHeight, picaTileOptions.unsharpAmount, picaTileOptions.unsharpRadius, picaTileOptions.unsharpThreshold);
  return result;
}

// src/worker/pica/client/invokeResize.ts
function invokeResize(tileOpts) {
  return Promise.resolve().then(() => {
    return { data: resizeAndUnsharp(tileOpts) };
  });
}

// src/worker/pica/client/landTileData.ts
function landTileData(tile, result, stageEnv) {
  let toImageData;
  toImageData = new ImageData(new Uint8ClampedArray(result.data), tile.toWidth, tile.toHeight);
  const NEED_SAFARI_FIX = false;
  if (NEED_SAFARI_FIX) {
    stageEnv.toCtx?.putImageData(toImageData, tile.toX, tile.toY, tile.toInnerX - tile.toX, tile.toInnerY - tile.toY, tile.toInnerWidth + 0.00001, tile.toInnerHeight + 0.00001);
  } else {
    stageEnv.toCtx?.putImageData(toImageData, tile.toX, tile.toY, tile.toInnerX - tile.toX, tile.toInnerY - tile.toY, tile.toInnerWidth, tile.toInnerHeight);
  }
  return null;
}

// src/worker/pica/client/utils.ts
function isCanvas(element) {
  return element instanceof OffscreenCanvas;
}
function isImageBitmap(element) {
  return element instanceof ImageBitmap;
}

// src/worker/pica/client/tileAndResize.ts
var processTile = (tile, from, picaOptions, stageEnv) => {
  let tileOptions = {
    width: tile.width,
    height: tile.height,
    toWidth: tile.toWidth,
    toHeight: tile.toHeight,
    scaleX: tile.scaleX,
    scaleY: tile.scaleY,
    offsetX: tile.offsetX,
    offsetY: tile.offsetY,
    filter: picaOptions.filter,
    unsharpAmount: picaOptions.unsharpAmount,
    unsharpRadius: picaOptions.unsharpRadius,
    unsharpThreshold: picaOptions.unsharpThreshold
  };
  return Promise.resolve(tileOptions).then((tileOptions2) => extractTileData(tile, from, null, stageEnv, tileOptions2)).then((tileOptions2) => invokeResize(tileOptions2)).then((result) => landTileData(tile, result, stageEnv));
};
function tileAndResize(from, to, picaOptions) {
  let stageEnv = {
    srcCtx: null,
    srcImageBitmap: null,
    isImageBitmapReused: false,
    toCtx: null
  };
  return Promise.resolve().then(() => {
    stageEnv.toCtx = to.getContext("2d");
    if (isCanvas(from))
      return null;
    if (isImageBitmap(from)) {
      stageEnv.srcImageBitmap = from;
      stageEnv.isImageBitmapReused = true;
      return null;
    }
    throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap');
  }).then(() => {
    let tiles = createTiles({
      width: picaOptions.width,
      height: picaOptions.height,
      srcTileSize: 1024,
      toWidth: picaOptions.toWidth,
      toHeight: picaOptions.toHeight,
      destTileBorder: picaOptions.destTileBorder
    });
    let jobs = tiles.map((tile) => processTile(tile, from, picaOptions, stageEnv));
    function cleanup(stageEnv2) {
      if (stageEnv2.srcImageBitmap) {
        if (!stageEnv2.isImageBitmapReused)
          stageEnv2.srcImageBitmap.close();
        stageEnv2.srcImageBitmap = null;
      }
    }
    return Promise.all(jobs).then(() => {
      cleanup(stageEnv);
      return to;
    }, (err) => {
      cleanup(stageEnv);
      throw err;
    });
  });
}

// src/worker/pica/client/processStages.ts
async function processStages(stages, from, to, picaOptions) {
  let [toWidth, toHeight] = stages.shift();
  let isLastStage = stages.length === 0;
  picaOptions.toWidth = toWidth;
  picaOptions.toHeight = toHeight;
  let tempCanvas;
  if (!isLastStage) {
    tempCanvas = new OffscreenCanvas(toWidth, toHeight);
  }
  await tileAndResize(from, isLastStage ? to : tempCanvas, picaOptions);
  if (isLastStage)
    return to;
  picaOptions.width = toWidth;
  picaOptions.height = toHeight;
  const result = await processStages(stages, from, tempCanvas, picaOptions);
  if (tempCanvas) {
    tempCanvas.width = tempCanvas.height = 0;
  }
  return result;
}

// src/index.ts
async function resize2(blob, options) {
  const maxDimension = options.maxDimension;
  const tileSize = options.tileSize ?? 1024;
  const unsharpAmount = options.unsharpAmount ?? 0;
  const unsharpRadius = options.unsharpRadius ?? 0;
  const unsharpThreshold = options.unsharpThreshold ?? 0;
  const imageBitmap = await createImageBitmap(blob);
  const originalWidth = imageBitmap.width;
  const originalHeight = imageBitmap.height;
  const widthRatio = maxDimension / originalWidth;
  const heightRatio = maxDimension / originalHeight;
  const scaleFactor = Math.min(widthRatio, heightRatio, 1);
  const toWidth = Math.floor(originalWidth * scaleFactor);
  const toHeight = Math.floor(originalHeight * scaleFactor);
  const offscreenCanvas = new OffscreenCanvas(toWidth, toHeight);
  const DEST_TILE_BORDER = 3;
  const destTileBorder = Math.ceil(Math.max(DEST_TILE_BORDER, 2.5 * unsharpRadius | 0));
  const stages = createStages(originalWidth, originalHeight, toWidth, toHeight, tileSize, destTileBorder);
  const picaOptions = {
    filter: "mks2013",
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
    width: originalWidth,
    height: originalHeight,
    toWidth,
    toHeight,
    destTileBorder
  };
  const result = await processStages(stages, imageBitmap, offscreenCanvas, picaOptions);
  const resizedImageBitmap = result.transferToImageBitmap();
  return resizedImageBitmap;
}

// src/client/task-queue.ts
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

// src/worker/pica/client/createStages.ts
var MIN_INNER_TILE_SIZE = 2;
function createStages(fromWidth, fromHeight, toWidth, toHeight, srcTileSize, destTileBorder) {
  let scaleX = toWidth / fromWidth;
  let scaleY = toHeight / fromHeight;
  let minScale = (2 * destTileBorder + MIN_INNER_TILE_SIZE + 1) / srcTileSize;
  if (minScale > 0.5)
    return [[toWidth, toHeight]];
  let stageCount = Math.ceil(Math.log(Math.min(scaleX, scaleY)) / Math.log(minScale));
  if (stageCount <= 1)
    return [[toWidth, toHeight]];
  let result = [];
  for (let i = 0;i < stageCount; i++) {
    let width = Math.round(Math.pow(Math.pow(fromWidth, stageCount - i - 1) * Math.pow(toWidth, i + 1), 1 / stageCount));
    let height = Math.round(Math.pow(Math.pow(fromHeight, stageCount - i - 1) * Math.pow(toHeight, i + 1), 1 / stageCount));
    result.push([width, height]);
  }
  return result;
}

// src/worker/pica/client/extractTileData.ts
function extractTileData(tile, from, opts, stageEnv, extractTo) {
  const tmpCanvas = new OffscreenCanvas(tile.width, tile.height);
  const tmpCtx = tmpCanvas.getContext("2d");
  if (!tmpCtx)
    throw new Error("Pica: Canvas context is not supported");
  tmpCtx.globalCompositeOperation = "copy";
  tmpCtx.drawImage(stageEnv.srcImageBitmap || from, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.width, tile.height);
  extractTo.src = tmpCtx.getImageData(0, 0, tile.width, tile.height).data;
  tmpCanvas.width = tmpCanvas.height = 0;
  return extractTo;
}

// src/worker/pica/client/createTiles.ts
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
function createTiles(options) {
  let scaleX = options.toWidth / options.width;
  let scaleY = options.toHeight / options.height;
  let innerTileWidth = pixelFloor(options.srcTileSize * scaleX) - 2 * options.destTileBorder;
  let innerTileHeight = pixelFloor(options.srcTileSize * scaleY) - 2 * options.destTileBorder;
  if (innerTileWidth < 1 || innerTileHeight < 1) {
    throw new Error("Internal error in pica: target tile width/height is too small.");
  }
  let x, y;
  let innerX, innerY, toTileWidth, toTileHeight;
  let tiles = [];
  let tile;
  for (innerY = 0;innerY < options.toHeight; innerY += innerTileHeight) {
    for (innerX = 0;innerX < options.toWidth; innerX += innerTileWidth) {
      x = innerX - options.destTileBorder;
      if (x < 0) {
        x = 0;
      }
      toTileWidth = innerX + innerTileWidth + options.destTileBorder - x;
      if (x + toTileWidth >= options.toWidth) {
        toTileWidth = options.toWidth - x;
      }
      y = innerY - options.destTileBorder;
      if (y < 0) {
        y = 0;
      }
      toTileHeight = innerY + innerTileHeight + options.destTileBorder - y;
      if (y + toTileHeight >= options.toHeight) {
        toTileHeight = options.toHeight - y;
      }
      tile = {
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
        height: pixelCeil(toTileHeight / scaleY)
      };
      tiles.push(tile);
    }
  }
  return tiles;
}

// src/worker/pica/worker/mm_resize/resize_filter_info.ts
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

// src/worker/pica/worker/mm_resize/resize_filter_gen.ts
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

// src/worker/pica/worker/mm_resize/convolve.ts
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

// src/worker/pica/worker/mm_resize/resize.ts
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
function resetAlpha(dst, width, height) {
  let ptr = 3;
  let len = width * height * 4 | 0;
  while (ptr < len) {
    dst[ptr] = 255;
    ptr = ptr + 4 | 0;
  }
}
function resize(picaTileOptions) {
  const src = picaTileOptions.src;
  const srcW = picaTileOptions.width;
  const srcH = picaTileOptions.height;
  const destW = picaTileOptions.toWidth;
  const destH = picaTileOptions.toHeight;
  const scaleX = picaTileOptions.scaleX || picaTileOptions.toWidth / picaTileOptions.width;
  const scaleY = picaTileOptions.scaleY || picaTileOptions.toHeight / picaTileOptions.height;
  const offsetX = picaTileOptions.offsetX || 0;
  const offsetY = picaTileOptions.offsetY || 0;
  const dest = picaTileOptions.dest || new Uint8Array(destW * destH * 4);
  const filter = typeof picaTileOptions.filter === "undefined" ? "mks2013" : picaTileOptions.filter;
  const filtersX = resizeFilterGen(filter, srcW, destW, scaleX, offsetX);
  const filtersY = resizeFilterGen(filter, srcH, destH, scaleY, offsetY);
  const tmp = new Uint16Array(destW * srcH * 4);
  if (hasAlpha(src, srcW, srcH)) {
    convolveHorWithPre(src, tmp, srcW, srcH, destW, filtersX);
    convolveVertWithPre(tmp, dest, srcH, destW, destH, filtersY);
  } else {
    convolveHor(src, tmp, srcW, srcH, destW, filtersX);
    convolveVert(tmp, dest, srcH, destW, destH, filtersY);
    resetAlpha(dest, destW, destH);
  }
  return dest;
}

// src/worker/pica/worker/mm_unsharp_mask/unsharp_mask.ts
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

// src/worker/pica/worker/resizeAndUnsharp.ts
function resizeAndUnsharp(picaTileOptions) {
  let result = resize(picaTileOptions);
  if (picaTileOptions.unsharpAmount)
    unsharp(result, picaTileOptions.toWidth, picaTileOptions.toHeight, picaTileOptions.unsharpAmount, picaTileOptions.unsharpRadius, picaTileOptions.unsharpThreshold);
  return result;
}

// src/worker/pica/client/invokeResize.ts
function invokeResize(tileOpts) {
  return Promise.resolve().then(() => {
    return { data: resizeAndUnsharp(tileOpts) };
  });
}

// src/worker/pica/client/landTileData.ts
function landTileData(tile, result, stageEnv) {
  let toImageData;
  toImageData = new ImageData(new Uint8ClampedArray(result.data), tile.toWidth, tile.toHeight);
  const NEED_SAFARI_FIX = false;
  if (NEED_SAFARI_FIX) {
    stageEnv.toCtx?.putImageData(toImageData, tile.toX, tile.toY, tile.toInnerX - tile.toX, tile.toInnerY - tile.toY, tile.toInnerWidth + 0.00001, tile.toInnerHeight + 0.00001);
  } else {
    stageEnv.toCtx?.putImageData(toImageData, tile.toX, tile.toY, tile.toInnerX - tile.toX, tile.toInnerY - tile.toY, tile.toInnerWidth, tile.toInnerHeight);
  }
  return null;
}

// src/worker/pica/client/utils.ts
function isCanvas(element) {
  return element instanceof OffscreenCanvas;
}
function isImageBitmap(element) {
  return element instanceof ImageBitmap;
}

// src/worker/pica/client/tileAndResize.ts
var processTile = (tile, from, picaOptions, stageEnv) => {
  let tileOptions = {
    width: tile.width,
    height: tile.height,
    toWidth: tile.toWidth,
    toHeight: tile.toHeight,
    scaleX: tile.scaleX,
    scaleY: tile.scaleY,
    offsetX: tile.offsetX,
    offsetY: tile.offsetY,
    filter: picaOptions.filter,
    unsharpAmount: picaOptions.unsharpAmount,
    unsharpRadius: picaOptions.unsharpRadius,
    unsharpThreshold: picaOptions.unsharpThreshold
  };
  return Promise.resolve(tileOptions).then((tileOptions2) => extractTileData(tile, from, null, stageEnv, tileOptions2)).then((tileOptions2) => invokeResize(tileOptions2)).then((result) => landTileData(tile, result, stageEnv));
};
function tileAndResize(from, to, picaOptions) {
  let stageEnv = {
    srcCtx: null,
    srcImageBitmap: null,
    isImageBitmapReused: false,
    toCtx: null
  };
  return Promise.resolve().then(() => {
    stageEnv.toCtx = to.getContext("2d");
    if (isCanvas(from))
      return null;
    if (isImageBitmap(from)) {
      stageEnv.srcImageBitmap = from;
      stageEnv.isImageBitmapReused = true;
      return null;
    }
    throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap');
  }).then(() => {
    let tiles = createTiles({
      width: picaOptions.width,
      height: picaOptions.height,
      srcTileSize: 1024,
      toWidth: picaOptions.toWidth,
      toHeight: picaOptions.toHeight,
      destTileBorder: picaOptions.destTileBorder
    });
    let jobs = tiles.map((tile) => processTile(tile, from, picaOptions, stageEnv));
    function cleanup(stageEnv2) {
      if (stageEnv2.srcImageBitmap) {
        if (!stageEnv2.isImageBitmapReused)
          stageEnv2.srcImageBitmap.close();
        stageEnv2.srcImageBitmap = null;
      }
    }
    return Promise.all(jobs).then(() => {
      cleanup(stageEnv);
      return to;
    }, (err) => {
      cleanup(stageEnv);
      throw err;
    });
  });
}

// src/worker/pica/client/processStages.ts
async function processStages(stages, from, to, picaOptions) {
  let [toWidth, toHeight] = stages.shift();
  let isLastStage = stages.length === 0;
  picaOptions.toWidth = toWidth;
  picaOptions.toHeight = toHeight;
  let tempCanvas;
  if (!isLastStage) {
    tempCanvas = new OffscreenCanvas(toWidth, toHeight);
  }
  await tileAndResize(from, isLastStage ? to : tempCanvas, picaOptions);
  if (isLastStage)
    return to;
  picaOptions.width = toWidth;
  picaOptions.height = toHeight;
  const result = await processStages(stages, from, tempCanvas, picaOptions);
  if (tempCanvas) {
    tempCanvas.width = tempCanvas.height = 0;
  }
  return result;
}

// src/index.ts
async function resize2(blob, options) {
  const maxDimension = options.maxDimension;
  const tileSize = options.tileSize ?? 1024;
  const unsharpAmount = options.unsharpAmount ?? 0;
  const unsharpRadius = options.unsharpRadius ?? 0;
  const unsharpThreshold = options.unsharpThreshold ?? 0;
  const imageBitmap = await createImageBitmap(blob);
  const originalWidth = imageBitmap.width;
  const originalHeight = imageBitmap.height;
  const widthRatio = maxDimension / originalWidth;
  const heightRatio = maxDimension / originalHeight;
  const scaleFactor = Math.min(widthRatio, heightRatio, 1);
  const toWidth = Math.floor(originalWidth * scaleFactor);
  const toHeight = Math.floor(originalHeight * scaleFactor);
  const offscreenCanvas = new OffscreenCanvas(toWidth, toHeight);
  const DEST_TILE_BORDER = 3;
  const destTileBorder = Math.ceil(Math.max(DEST_TILE_BORDER, 2.5 * unsharpRadius | 0));
  const stages = createStages(originalWidth, originalHeight, toWidth, toHeight, tileSize, destTileBorder);
  const picaOptions = {
    filter: "mks2013",
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
    width: originalWidth,
    height: originalHeight,
    toWidth,
    toHeight,
    destTileBorder
  };
  const result = await processStages(stages, imageBitmap, offscreenCanvas, picaOptions);
  const resizedImageBitmap = result.transferToImageBitmap();
  return resizedImageBitmap;
}

// src/worker/worker.ts
self.onmessage = async (event) => {
  const { taskId, blob, options } = event.data;
  try {
    const resizedImageBitmap = await resize2(blob, options);
    self.postMessage({ taskId, output: resizedImageBitmap }, [resizedImageBitmap]);
  } catch (error) {
    self.postMessage({ taskId, error });
  }
};
`;
var workerBlob = new Blob([workerCode], { type: "application/javascript" });
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
  clearWorkerTimeout(worker) {
    clearTimeout(this.#workerToTimeoutId.get(worker));
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
  assignTask(worker, task) {
    this.#workerToTaskId.set(worker, task.id);
    this.#taskIdToWorker.set(task.id, worker);
    this.#taskIdToTask.set(task.id, task);
    const taskMessage = {
      taskId: task.id,
      blob: task.data.blob,
      options: task.data.options
    };
    worker.postMessage(taskMessage);
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
  #taskQueue;
  #pool;
  constructor(maxWorkerPoolSize, maxWorkerIdleTime) {
    this.#maxPoolSize = maxWorkerPoolSize;
    this.#maxIdleTime = maxWorkerIdleTime;
    this.#taskQueue = [];
    this.#pool = new WorkerPool;
  }
  #createWorker() {
    const worker = new Worker(URL.createObjectURL(workerBlob));
    worker.onmessage = (event) => {
      const { taskId, output, error } = event.data;
      const finishedWorker = this.#pool.getWorker(taskId);
      const pendingTask = this.#pool.getTask(taskId);
      if (error) {
        if (pendingTask)
          pendingTask.reject(error);
      } else {
        if (pendingTask)
          pendingTask.resolve(output);
      }
      this.#pool.removeTask(taskId);
      if (finishedWorker)
        this.#pool.setWorkerTimeout(finishedWorker, this.#maxIdleTime);
      this.#processQueue();
    };
    worker.onerror = (error) => {
      console.log(error.message);
      console.log(error);
    };
    this.#pool.addWorker(worker);
  }
  #processQueue() {
    const availableWorker = this.#pool.getAvailableWorker();
    if (availableWorker) {
      const task = this.#taskQueue.shift();
      if (task) {
        this.#pool.assignTask(availableWorker, task);
        this.#pool.clearWorkerTimeout(availableWorker);
      }
    } else if (this.#pool.count < this.#maxPoolSize) {
      this.#createWorker();
      this.#processQueue();
    }
  }
  addTask(taskData) {
    return new Promise((resolve, reject) => {
      this.#taskQueue.push({
        id: createId(),
        data: { blob: taskData.blob, options: taskData.options },
        resolve,
        reject
      });
      this.#processQueue();
    });
  }
}

// src/client/client.ts
class PicSquish {
  #taskQueue;
  #globalOptions;
  constructor(options) {
    const hardwareConcurrency = typeof navigator === "undefined" ? 1 : navigator.hardwareConcurrency;
    const maxWorkerPoolSize = options.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4);
    const maxWorkerIdleTime = options.maxWorkerIdleTime || 2000;
    this.#taskQueue = new TaskQueue(maxWorkerPoolSize, maxWorkerIdleTime);
    this.#globalOptions = options;
  }
  squish(blob, localOptions) {
    const options = localOptions ? { ...this.#globalOptions, ...localOptions } : this.#globalOptions;
    if (options.useMainThread)
      return resize2(blob, options);
    return this.#taskQueue.addTask({ blob, options });
  }
}
export {
  PicSquish
};
