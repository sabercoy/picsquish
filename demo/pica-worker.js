(function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o})({"1":[function(_dereq_,module,exports){
  // Collection of math functions
  //
  // 1. Combine components together
  // 2. Has async init to load wasm modules
  //
  'use strict';
  
  var Multimath = _dereq_('multimath');
  
  var mm_unsharp_mask = _dereq_('./mm_unsharp_mask');
  
  var mm_resize = _dereq_('./mm_resize');
  
  function MathLib(requested_features) {
    var __requested_features = requested_features || [];
  
    var features = {
      js: __requested_features.indexOf('js') >= 0,
      wasm: __requested_features.indexOf('wasm') >= 0
    };
    Multimath.call(this, features);
    this.features = {
      js: features.js,
      wasm: features.wasm && this.has_wasm()
    };
    this.use(mm_unsharp_mask);
    this.use(mm_resize);
  }
  
  MathLib.prototype = Object.create(Multimath.prototype);
  MathLib.prototype.constructor = MathLib;
  
  MathLib.prototype.resizeAndUnsharp = function resizeAndUnsharp(options, cache) {
    var result = this.resize(options, cache);
  
    if (options.unsharpAmount) {
      this.unsharp_mask(result, options.toWidth, options.toHeight, options.unsharpAmount, options.unsharpRadius, options.unsharpThreshold);
    }
  
    return result;
  };
  
  module.exports = MathLib;
  
  },{"./mm_resize":4,"./mm_unsharp_mask":9,"multimath":19}],"2":[function(_dereq_,module,exports){
  // Resize convolvers, pure JS implementation
  //
  'use strict'; // Precision of fixed FP values
  //var FIXED_FRAC_BITS = 14;
  
  function clampTo8(i) {
    return i < 0 ? 0 : i > 255 ? 255 : i;
  }
  
  function clampNegative(i) {
    return i >= 0 ? i : 0;
  } // Convolve image data in horizontal direction. Can be used for:
  //
  // 1. bitmap with premultiplied alpha
  // 2. bitmap without alpha (all values 255)
  //
  // Notes:
  //
  // - output is transposed
  // - output resolution is ~15 bits per channel(for better precision).
  //
  
  
  function convolveHor(src, dest, srcW, srcH, destW, filters) {
    var r, g, b, a;
    var filterPtr, filterShift, filterSize;
    var srcPtr, srcY, destX, filterVal;
    var srcOffset = 0,
        destOffset = 0; // For each row
  
    for (srcY = 0; srcY < srcH; srcY++) {
      filterPtr = 0; // Apply precomputed filters to each destination row point
  
      for (destX = 0; destX < destW; destX++) {
        // Get the filter that determines the current output pixel.
        filterShift = filters[filterPtr++];
        filterSize = filters[filterPtr++];
        srcPtr = srcOffset + filterShift * 4 | 0;
        r = g = b = a = 0; // Apply the filter to the row to get the destination pixel r, g, b, a
  
        for (; filterSize > 0; filterSize--) {
          filterVal = filters[filterPtr++]; // Use reverse order to workaround deopts in old v8 (node v.10)
          // Big thanks to @mraleph (Vyacheslav Egorov) for the tip.
  
          a = a + filterVal * src[srcPtr + 3] | 0;
          b = b + filterVal * src[srcPtr + 2] | 0;
          g = g + filterVal * src[srcPtr + 1] | 0;
          r = r + filterVal * src[srcPtr] | 0;
          srcPtr = srcPtr + 4 | 0;
        } // Store 15 bits between passes for better precision
        // Instead of shift to 14 (FIXED_FRAC_BITS), shift to 7 only
        //
  
  
        dest[destOffset + 3] = clampNegative(a >> 7);
        dest[destOffset + 2] = clampNegative(b >> 7);
        dest[destOffset + 1] = clampNegative(g >> 7);
        dest[destOffset] = clampNegative(r >> 7);
        destOffset = destOffset + srcH * 4 | 0;
      }
  
      destOffset = (srcY + 1) * 4 | 0;
      srcOffset = (srcY + 1) * srcW * 4 | 0;
    }
  } // Supplementary method for `convolveHor()`
  //
  
  
  function convolveVert(src, dest, srcW, srcH, destW, filters) {
    var r, g, b, a;
    var filterPtr, filterShift, filterSize;
    var srcPtr, srcY, destX, filterVal;
    var srcOffset = 0,
        destOffset = 0; // For each row
  
    for (srcY = 0; srcY < srcH; srcY++) {
      filterPtr = 0; // Apply precomputed filters to each destination row point
  
      for (destX = 0; destX < destW; destX++) {
        // Get the filter that determines the current output pixel.
        filterShift = filters[filterPtr++];
        filterSize = filters[filterPtr++];
        srcPtr = srcOffset + filterShift * 4 | 0;
        r = g = b = a = 0; // Apply the filter to the row to get the destination pixel r, g, b, a
  
        for (; filterSize > 0; filterSize--) {
          filterVal = filters[filterPtr++]; // Use reverse order to workaround deopts in old v8 (node v.10)
          // Big thanks to @mraleph (Vyacheslav Egorov) for the tip.
  
          a = a + filterVal * src[srcPtr + 3] | 0;
          b = b + filterVal * src[srcPtr + 2] | 0;
          g = g + filterVal * src[srcPtr + 1] | 0;
          r = r + filterVal * src[srcPtr] | 0;
          srcPtr = srcPtr + 4 | 0;
        } // Sync with premultiplied version for exact result match
  
  
        r >>= 7;
        g >>= 7;
        b >>= 7;
        a >>= 7; // Bring this value back in range + round result.
        //
  
        dest[destOffset + 3] = clampTo8(a + (1 << 13) >> 14);
        dest[destOffset + 2] = clampTo8(b + (1 << 13) >> 14);
        dest[destOffset + 1] = clampTo8(g + (1 << 13) >> 14);
        dest[destOffset] = clampTo8(r + (1 << 13) >> 14);
        destOffset = destOffset + srcH * 4 | 0;
      }
  
      destOffset = (srcY + 1) * 4 | 0;
      srcOffset = (srcY + 1) * srcW * 4 | 0;
    }
  } // Premultiply & convolve image data in horizontal direction. Can be used for:
  //
  // - Any bitmap data, extracted with `.getImageData()` method (with
  //   non-premultiplied alpha)
  //
  // For images without alpha channel this method is slower than `convolveHor()`
  //
  
  
  function convolveHorWithPre(src, dest, srcW, srcH, destW, filters) {
    var r, g, b, a, alpha;
    var filterPtr, filterShift, filterSize;
    var srcPtr, srcY, destX, filterVal;
    var srcOffset = 0,
        destOffset = 0; // For each row
  
    for (srcY = 0; srcY < srcH; srcY++) {
      filterPtr = 0; // Apply precomputed filters to each destination row point
  
      for (destX = 0; destX < destW; destX++) {
        // Get the filter that determines the current output pixel.
        filterShift = filters[filterPtr++];
        filterSize = filters[filterPtr++];
        srcPtr = srcOffset + filterShift * 4 | 0;
        r = g = b = a = 0; // Apply the filter to the row to get the destination pixel r, g, b, a
  
        for (; filterSize > 0; filterSize--) {
          filterVal = filters[filterPtr++]; // Use reverse order to workaround deopts in old v8 (node v.10)
          // Big thanks to @mraleph (Vyacheslav Egorov) for the tip.
  
          alpha = src[srcPtr + 3];
          a = a + filterVal * alpha | 0;
          b = b + filterVal * src[srcPtr + 2] * alpha | 0;
          g = g + filterVal * src[srcPtr + 1] * alpha | 0;
          r = r + filterVal * src[srcPtr] * alpha | 0;
          srcPtr = srcPtr + 4 | 0;
        } // Premultiply is (* alpha / 255).
        // Postpone division for better performance
  
  
        b = b / 255 | 0;
        g = g / 255 | 0;
        r = r / 255 | 0; // Store 15 bits between passes for better precision
        // Instead of shift to 14 (FIXED_FRAC_BITS), shift to 7 only
        //
  
        dest[destOffset + 3] = clampNegative(a >> 7);
        dest[destOffset + 2] = clampNegative(b >> 7);
        dest[destOffset + 1] = clampNegative(g >> 7);
        dest[destOffset] = clampNegative(r >> 7);
        destOffset = destOffset + srcH * 4 | 0;
      }
  
      destOffset = (srcY + 1) * 4 | 0;
      srcOffset = (srcY + 1) * srcW * 4 | 0;
    }
  } // Supplementary method for `convolveHorWithPre()`
  //
  
  
  function convolveVertWithPre(src, dest, srcW, srcH, destW, filters) {
    var r, g, b, a;
    var filterPtr, filterShift, filterSize;
    var srcPtr, srcY, destX, filterVal;
    var srcOffset = 0,
        destOffset = 0; // For each row
  
    for (srcY = 0; srcY < srcH; srcY++) {
      filterPtr = 0; // Apply precomputed filters to each destination row point
  
      for (destX = 0; destX < destW; destX++) {
        // Get the filter that determines the current output pixel.
        filterShift = filters[filterPtr++];
        filterSize = filters[filterPtr++];
        srcPtr = srcOffset + filterShift * 4 | 0;
        r = g = b = a = 0; // Apply the filter to the row to get the destination pixel r, g, b, a
  
        for (; filterSize > 0; filterSize--) {
          filterVal = filters[filterPtr++]; // Use reverse order to workaround deopts in old v8 (node v.10)
          // Big thanks to @mraleph (Vyacheslav Egorov) for the tip.
  
          a = a + filterVal * src[srcPtr + 3] | 0;
          b = b + filterVal * src[srcPtr + 2] | 0;
          g = g + filterVal * src[srcPtr + 1] | 0;
          r = r + filterVal * src[srcPtr] | 0;
          srcPtr = srcPtr + 4 | 0;
        } // Downscale to leave room for un-premultiply
  
  
        r >>= 7;
        g >>= 7;
        b >>= 7;
        a >>= 7; // Un-premultiply
  
        a = clampTo8(a + (1 << 13) >> 14);
  
        if (a > 0) {
          r = r * 255 / a | 0;
          g = g * 255 / a | 0;
          b = b * 255 / a | 0;
        } // Bring this value back in range + round result.
        // Shift value = FIXED_FRAC_BITS + 7
        //
  
  
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
  
  module.exports = {
    convolveHor: convolveHor,
    convolveVert: convolveVert,
    convolveHorWithPre: convolveHorWithPre,
    convolveVertWithPre: convolveVertWithPre
  };
  
  },{}],"3":[function(_dereq_,module,exports){
  // This is autogenerated file from math.wasm, don't edit.
  //
  'use strict';
  /* eslint-disable max-len */
  
  module.exports = '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';
  
  },{}],"4":[function(_dereq_,module,exports){
  'use strict';
  
  module.exports = {
    name: 'resize',
    fn: _dereq_('./resize'),
    wasm_fn: _dereq_('./resize_wasm'),
    wasm_src: _dereq_('./convolve_wasm_base64')
  };
  
  },{"./convolve_wasm_base64":3,"./resize":5,"./resize_wasm":8}],"5":[function(_dereq_,module,exports){
  'use strict';
  
  var createFilters = _dereq_('./resize_filter_gen');
  
  var _require = _dereq_('./convolve'),
      convolveHor = _require.convolveHor,
      convolveVert = _require.convolveVert,
      convolveHorWithPre = _require.convolveHorWithPre,
      convolveVertWithPre = _require.convolveVertWithPre;
  
  function hasAlpha(src, width, height) {
    var ptr = 3,
        len = width * height * 4 | 0;
  
    while (ptr < len) {
      if (src[ptr] !== 255) return true;
      ptr = ptr + 4 | 0;
    }
  
    return false;
  }
  
  function resetAlpha(dst, width, height) {
    var ptr = 3,
        len = width * height * 4 | 0;
  
    while (ptr < len) {
      dst[ptr] = 0xFF;
      ptr = ptr + 4 | 0;
    }
  }
  
  module.exports = function resize(options) {
    var src = options.src;
    var srcW = options.width;
    var srcH = options.height;
    var destW = options.toWidth;
    var destH = options.toHeight;
    var scaleX = options.scaleX || options.toWidth / options.width;
    var scaleY = options.scaleY || options.toHeight / options.height;
    var offsetX = options.offsetX || 0;
    var offsetY = options.offsetY || 0;
    var dest = options.dest || new Uint8Array(destW * destH * 4);
    var filter = typeof options.filter === 'undefined' ? 'mks2013' : options.filter;
    var filtersX = createFilters(filter, srcW, destW, scaleX, offsetX),
        filtersY = createFilters(filter, srcH, destH, scaleY, offsetY);
    var tmp = new Uint16Array(destW * srcH * 4); // Autodetect if alpha channel exists, and use appropriate method
  
    if (hasAlpha(src, srcW, srcH)) {
      convolveHorWithPre(src, tmp, srcW, srcH, destW, filtersX);
      convolveVertWithPre(tmp, dest, srcH, destW, destH, filtersY);
    } else {
      convolveHor(src, tmp, srcW, srcH, destW, filtersX);
      convolveVert(tmp, dest, srcH, destW, destH, filtersY);
      resetAlpha(dest, destW, destH);
    }
  
    return dest;
  };
  
  },{"./convolve":2,"./resize_filter_gen":6}],"6":[function(_dereq_,module,exports){
  // Calculate convolution filters for each destination point,
  // and pack data to Int16Array:
  //
  // [ shift, length, data..., shift2, length2, data..., ... ]
  //
  // - shift - offset in src image
  // - length - filter length (in src points)
  // - data - filter values sequence
  //
  'use strict';
  
  var FILTER_INFO = _dereq_('./resize_filter_info'); // Precision of fixed FP values
  
  
  var FIXED_FRAC_BITS = 14;
  
  function toFixedPoint(num) {
    return Math.round(num * ((1 << FIXED_FRAC_BITS) - 1));
  }
  
  module.exports = function resizeFilterGen(filter, srcSize, destSize, scale, offset) {
    var filterFunction = FILTER_INFO.filter[filter].fn;
    var scaleInverted = 1.0 / scale;
    var scaleClamped = Math.min(1.0, scale); // For upscale
    // Filter window (averaging interval), scaled to src image
  
    var srcWindow = FILTER_INFO.filter[filter].win / scaleClamped;
    var destPixel, srcPixel, srcFirst, srcLast, filterElementSize, floatFilter, fxpFilter, total, pxl, idx, floatVal, filterTotal, filterVal;
    var leftNotEmpty, rightNotEmpty, filterShift, filterSize;
    var maxFilterElementSize = Math.floor((srcWindow + 1) * 2);
    var packedFilter = new Int16Array((maxFilterElementSize + 2) * destSize);
    var packedFilterPtr = 0;
    var slowCopy = !packedFilter.subarray || !packedFilter.set; // For each destination pixel calculate source range and built filter values
  
    for (destPixel = 0; destPixel < destSize; destPixel++) {
      // Scaling should be done relative to central pixel point
      srcPixel = (destPixel + 0.5) * scaleInverted + offset;
      srcFirst = Math.max(0, Math.floor(srcPixel - srcWindow));
      srcLast = Math.min(srcSize - 1, Math.ceil(srcPixel + srcWindow));
      filterElementSize = srcLast - srcFirst + 1;
      floatFilter = new Float32Array(filterElementSize);
      fxpFilter = new Int16Array(filterElementSize);
      total = 0.0; // Fill filter values for calculated range
  
      for (pxl = srcFirst, idx = 0; pxl <= srcLast; pxl++, idx++) {
        floatVal = filterFunction((pxl + 0.5 - srcPixel) * scaleClamped);
        total += floatVal;
        floatFilter[idx] = floatVal;
      } // Normalize filter, convert to fixed point and accumulate conversion error
  
  
      filterTotal = 0;
  
      for (idx = 0; idx < floatFilter.length; idx++) {
        filterVal = floatFilter[idx] / total;
        filterTotal += filterVal;
        fxpFilter[idx] = toFixedPoint(filterVal);
      } // Compensate normalization error, to minimize brightness drift
  
  
      fxpFilter[destSize >> 1] += toFixedPoint(1.0 - filterTotal); //
      // Now pack filter to useable form
      //
      // 1. Trim heading and tailing zero values, and compensate shitf/length
      // 2. Put all to single array in this format:
      //
      //    [ pos shift, data length, value1, value2, value3, ... ]
      //
  
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
        packedFilter[packedFilterPtr++] = filterShift; // shift
  
        packedFilter[packedFilterPtr++] = filterSize; // size
  
        if (!slowCopy) {
          packedFilter.set(fxpFilter.subarray(leftNotEmpty, rightNotEmpty + 1), packedFilterPtr);
          packedFilterPtr += filterSize;
        } else {
          // fallback for old IE < 11, without subarray/set methods
          for (idx = leftNotEmpty; idx <= rightNotEmpty; idx++) {
            packedFilter[packedFilterPtr++] = fxpFilter[idx];
          }
        }
      } else {
        // zero data, write header only
        packedFilter[packedFilterPtr++] = 0; // shift
  
        packedFilter[packedFilterPtr++] = 0; // size
      }
    }
  
    return packedFilter;
  };
  
  },{"./resize_filter_info":7}],"7":[function(_dereq_,module,exports){
  // Filter definitions to build tables for
  // resizing convolvers.
  //
  // Presets for quality 0..3. Filter functions + window size
  //
  'use strict';
  
  var filter = {
    // Nearest neibor
    box: {
      win: 0.5,
      fn: function fn(x) {
        if (x < 0) x = -x;
        return x < 0.5 ? 1.0 : 0.0;
      }
    },
    // // Hamming
    hamming: {
      win: 1.0,
      fn: function fn(x) {
        if (x < 0) x = -x;
  
        if (x >= 1.0) {
          return 0.0;
        }
  
        if (x < 1.19209290E-07) {
          return 1.0;
        }
  
        var xpi = x * Math.PI;
        return Math.sin(xpi) / xpi * (0.54 + 0.46 * Math.cos(xpi / 1.0));
      }
    },
    // Lanczos, win = 2
    lanczos2: {
      win: 2.0,
      fn: function fn(x) {
        if (x < 0) x = -x;
  
        if (x >= 2.0) {
          return 0.0;
        }
  
        if (x < 1.19209290E-07) {
          return 1.0;
        }
  
        var xpi = x * Math.PI;
        return Math.sin(xpi) / xpi * Math.sin(xpi / 2.0) / (xpi / 2.0);
      }
    },
    // Lanczos, win = 3
    lanczos3: {
      win: 3.0,
      fn: function fn(x) {
        if (x < 0) x = -x;
  
        if (x >= 3.0) {
          return 0.0;
        }
  
        if (x < 1.19209290E-07) {
          return 1.0;
        }
  
        var xpi = x * Math.PI;
        return Math.sin(xpi) / xpi * Math.sin(xpi / 3.0) / (xpi / 3.0);
      }
    },
    // Magic Kernel Sharp 2013, win = 2.5
    // http://johncostella.com/magic/
    mks2013: {
      win: 2.5,
      fn: function fn(x) {
        if (x < 0) x = -x;
  
        if (x >= 2.5) {
          return 0.0;
        }
  
        if (x >= 1.5) {
          return -0.125 * (x - 2.5) * (x - 2.5);
        }
  
        if (x >= 0.5) {
          return 0.25 * (4 * x * x - 11 * x + 7);
        }
  
        return 1.0625 - 1.75 * x * x;
      }
    }
  };
  module.exports = {
    filter: filter,
    // Legacy mapping
    f2q: {
      box: 0,
      hamming: 1,
      lanczos2: 2,
      lanczos3: 3
    },
    q2f: ['box', 'hamming', 'lanczos2', 'lanczos3']
  };
  
  },{}],"8":[function(_dereq_,module,exports){
  'use strict';
  
  var createFilters = _dereq_('./resize_filter_gen');
  
  function hasAlpha(src, width, height) {
    var ptr = 3,
        len = width * height * 4 | 0;
  
    while (ptr < len) {
      if (src[ptr] !== 255) return true;
      ptr = ptr + 4 | 0;
    }
  
    return false;
  }
  
  function resetAlpha(dst, width, height) {
    var ptr = 3,
        len = width * height * 4 | 0;
  
    while (ptr < len) {
      dst[ptr] = 0xFF;
      ptr = ptr + 4 | 0;
    }
  }
  
  function asUint8Array(src) {
    return new Uint8Array(src.buffer, 0, src.byteLength);
  }
  
  var IS_LE = true; // should not crash everything on module load in old browsers
  
  try {
    IS_LE = new Uint32Array(new Uint8Array([1, 0, 0, 0]).buffer)[0] === 1;
  } catch (__) {}
  
  function copyInt16asLE(src, target, target_offset) {
    if (IS_LE) {
      target.set(asUint8Array(src), target_offset);
      return;
    }
  
    for (var ptr = target_offset, i = 0; i < src.length; i++) {
      var data = src[i];
      target[ptr++] = data & 0xFF;
      target[ptr++] = data >> 8 & 0xFF;
    }
  }
  
  module.exports = function resize_wasm(options) {
    var src = options.src;
    var srcW = options.width;
    var srcH = options.height;
    var destW = options.toWidth;
    var destH = options.toHeight;
    var scaleX = options.scaleX || options.toWidth / options.width;
    var scaleY = options.scaleY || options.toHeight / options.height;
    var offsetX = options.offsetX || 0.0;
    var offsetY = options.offsetY || 0.0;
    var dest = options.dest || new Uint8Array(destW * destH * 4);
    var filter = typeof options.filter === 'undefined' ? 'mks2013' : options.filter;
    var filtersX = createFilters(filter, srcW, destW, scaleX, offsetX),
        filtersY = createFilters(filter, srcH, destH, scaleY, offsetY); // destination is 0 too.
  
    var src_offset = 0;
    var src_size = Math.max(src.byteLength, dest.byteLength); // buffer between convolve passes
  
    var tmp_offset = this.__align(src_offset + src_size);
  
    var tmp_size = srcH * destW * 4 * 2; // 2 bytes per channel
  
    var filtersX_offset = this.__align(tmp_offset + tmp_size);
  
    var filtersY_offset = this.__align(filtersX_offset + filtersX.byteLength);
  
    var alloc_bytes = filtersY_offset + filtersY.byteLength;
  
    var instance = this.__instance('resize', alloc_bytes); //
    // Fill memory block with data to process
    //
  
  
    var mem = new Uint8Array(this.__memory.buffer);
    var mem32 = new Uint32Array(this.__memory.buffer); // 32-bit copy is much faster in chrome
  
    var src32 = new Uint32Array(src.buffer);
    mem32.set(src32); // We should guarantee LE bytes order. Filters are not big, so
    // speed difference is not significant vs direct .set()
  
    copyInt16asLE(filtersX, mem, filtersX_offset);
    copyInt16asLE(filtersY, mem, filtersY_offset); // Now call webassembly method
    // emsdk does method names with '_'
  
    var fn = instance.exports.convolveHV || instance.exports._convolveHV;
  
    if (hasAlpha(src, srcW, srcH)) {
      fn(filtersX_offset, filtersY_offset, tmp_offset, srcW, srcH, destW, destH, 1);
    } else {
      fn(filtersX_offset, filtersY_offset, tmp_offset, srcW, srcH, destW, destH, 0);
      resetAlpha(dest, destW, destH);
    } //
    // Copy data back to typed array
    //
    // 32-bit copy is much faster in chrome
  
  
    var dest32 = new Uint32Array(dest.buffer);
    dest32.set(new Uint32Array(this.__memory.buffer, 0, destH * destW));
    return dest;
  };
  
  },{"./resize_filter_gen":6}],"9":[function(_dereq_,module,exports){
  'use strict';
  
  module.exports = {
    name: 'unsharp_mask',
    fn: _dereq_('./unsharp_mask'),
    wasm_fn: _dereq_('./unsharp_mask_wasm'),
    wasm_src: _dereq_('./unsharp_mask_wasm_base64')
  };
  
  },{"./unsharp_mask":10,"./unsharp_mask_wasm":11,"./unsharp_mask_wasm_base64":12}],"10":[function(_dereq_,module,exports){
  // Unsharp mask filter
  //
  // http://stackoverflow.com/a/23322820/1031804
  // USM(O) = O + (2 * (Amount / 100) * (O - GB))
  // GB - gaussian blur.
  //
  // Image is converted from RGB to HSV, unsharp mask is applied to the
  // brightness channel and then image is converted back to RGB.
  //
  'use strict';
  
  var glur_mono16 = _dereq_('glur/mono16');
  
  function hsv_v16(img, width, height) {
    var size = width * height;
    var out = new Uint16Array(size);
    var r, g, b, max;
  
    for (var i = 0; i < size; i++) {
      r = img[4 * i];
      g = img[4 * i + 1];
      b = img[4 * i + 2];
      max = r >= g && r >= b ? r : g >= b && g >= r ? g : b;
      out[i] = max << 8;
    }
  
    return out;
  }
  
  module.exports = function unsharp(img, width, height, amount, radius, threshold) {
    var v1, v2, vmul;
    var diff, iTimes4;
  
    if (amount === 0 || radius < 0.5) {
      return;
    }
  
    if (radius > 2.0) {
      radius = 2.0;
    }
  
    var brightness = hsv_v16(img, width, height);
    var blured = new Uint16Array(brightness); // copy, because blur modify src
  
    glur_mono16(blured, width, height, radius);
    var amountFp = amount / 100 * 0x1000 + 0.5 | 0;
    var thresholdFp = threshold << 8;
    var size = width * height;
    /* eslint-disable indent */
  
    for (var i = 0; i < size; i++) {
      v1 = brightness[i];
      diff = v1 - blured[i];
  
      if (Math.abs(diff) >= thresholdFp) {
        // add unsharp mask to the brightness channel
        v2 = v1 + (amountFp * diff + 0x800 >> 12); // Both v1 and v2 are within [0.0 .. 255.0] (0000-FF00) range, never going into
        // [255.003 .. 255.996] (FF01-FFFF). This allows to round this value as (x+.5)|0
        // later without overflowing.
  
        v2 = v2 > 0xff00 ? 0xff00 : v2;
        v2 = v2 < 0x0000 ? 0x0000 : v2; // Avoid division by 0. V=0 means rgb(0,0,0), unsharp with unsharpAmount>0 cannot
        // change this value (because diff between colors gets inflated), so no need to verify correctness.
  
        v1 = v1 !== 0 ? v1 : 1; // Multiplying V in HSV model by a constant is equivalent to multiplying each component
        // in RGB by the same constant (same for HSL), see also:
        // https://beesbuzz.biz/code/16-hsv-color-transforms
  
        vmul = (v2 << 12) / v1 | 0; // Result will be in [0..255] range because:
        //  - all numbers are positive
        //  - r,g,b <= (v1/256)
        //  - r,g,b,(v1/256),(v2/256) <= 255
        // So highest this number can get is X*255/X+0.5=255.5 which is < 256 and rounds down.
  
        iTimes4 = i * 4;
        img[iTimes4] = img[iTimes4] * vmul + 0x800 >> 12; // R
  
        img[iTimes4 + 1] = img[iTimes4 + 1] * vmul + 0x800 >> 12; // G
  
        img[iTimes4 + 2] = img[iTimes4 + 2] * vmul + 0x800 >> 12; // B
      }
    }
  };
  
  },{"glur/mono16":18}],"11":[function(_dereq_,module,exports){
  'use strict';
  
  module.exports = function unsharp(img, width, height, amount, radius, threshold) {
    if (amount === 0 || radius < 0.5) {
      return;
    }
  
    if (radius > 2.0) {
      radius = 2.0;
    }
  
    var pixels = width * height;
    var img_bytes_cnt = pixels * 4;
    var hsv_bytes_cnt = pixels * 2;
    var blur_bytes_cnt = pixels * 2;
    var blur_line_byte_cnt = Math.max(width, height) * 4; // float32 array
  
    var blur_coeffs_byte_cnt = 8 * 4; // float32 array
  
    var img_offset = 0;
    var hsv_offset = img_bytes_cnt;
    var blur_offset = hsv_offset + hsv_bytes_cnt;
    var blur_tmp_offset = blur_offset + blur_bytes_cnt;
    var blur_line_offset = blur_tmp_offset + blur_bytes_cnt;
    var blur_coeffs_offset = blur_line_offset + blur_line_byte_cnt;
  
    var instance = this.__instance('unsharp_mask', img_bytes_cnt + hsv_bytes_cnt + blur_bytes_cnt * 2 + blur_line_byte_cnt + blur_coeffs_byte_cnt, {
      exp: Math.exp
    }); // 32-bit copy is much faster in chrome
  
  
    var img32 = new Uint32Array(img.buffer);
    var mem32 = new Uint32Array(this.__memory.buffer);
    mem32.set(img32); // HSL
  
    var fn = instance.exports.hsv_v16 || instance.exports._hsv_v16;
    fn(img_offset, hsv_offset, width, height); // BLUR
  
    fn = instance.exports.blurMono16 || instance.exports._blurMono16;
    fn(hsv_offset, blur_offset, blur_tmp_offset, blur_line_offset, blur_coeffs_offset, width, height, radius); // UNSHARP
  
    fn = instance.exports.unsharp || instance.exports._unsharp;
    fn(img_offset, img_offset, hsv_offset, blur_offset, width, height, amount, threshold); // 32-bit copy is much faster in chrome
  
    img32.set(new Uint32Array(this.__memory.buffer, 0, pixels));
  };
  
  },{}],"12":[function(_dereq_,module,exports){
  // This is autogenerated file from math.wasm, don't edit.
  //
  'use strict';
  /* eslint-disable max-len */
  
  module.exports = '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';
  
  },{}],"17":[function(_dereq_,module,exports){
  // Web Worker wrapper for image resize function
  'use strict';
  
  module.exports = function () {
    var MathLib = _dereq_('./mathlib');
  
    var mathLib;
    /* eslint-disable no-undef */
  
    onmessage = function onmessage(ev) {
      var tileOpts = ev.data.opts;
      var returnBitmap = false;
  
      if (!tileOpts.src && tileOpts.srcBitmap) {
        var canvas = new OffscreenCanvas(tileOpts.width, tileOpts.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(tileOpts.srcBitmap, 0, 0);
        tileOpts.src = ctx.getImageData(0, 0, tileOpts.width, tileOpts.height).data;
        canvas.width = canvas.height = 0;
        canvas = null;
        tileOpts.srcBitmap.close();
        tileOpts.srcBitmap = null; // Temporary force out data to typed array, because Chrome have artefacts
        // https://github.com/nodeca/pica/issues/223
        // returnBitmap = true;
      }
  
      if (!mathLib) mathLib = new MathLib(ev.data.features); // Use multimath's sync auto-init. Avoid Promise use in old browsers,
      // because polyfills are not propagated to webworker.
  
      var data = mathLib.resizeAndUnsharp(tileOpts);
  
      if (returnBitmap) {
        var toImageData = new ImageData(new Uint8ClampedArray(data), tileOpts.toWidth, tileOpts.toHeight);
  
        var _canvas = new OffscreenCanvas(tileOpts.toWidth, tileOpts.toHeight);
  
        var _ctx = _canvas.getContext('2d');
  
        _ctx.putImageData(toImageData, 0, 0);
  
        createImageBitmap(_canvas).then(function (bitmap) {
          postMessage({
            bitmap: bitmap
          }, [bitmap]);
        });
      } else {
        postMessage({
          data: data
        }, [data.buffer]);
      }
    };
  };
  
  },{"./mathlib":1}],"18":[function(_dereq_,module,exports){
  // Calculate Gaussian blur of an image using IIR filter
  // The method is taken from Intel's white paper and code example attached to it:
  // https://software.intel.com/en-us/articles/iir-gaussian-blur-filter
  // -implementation-using-intel-advanced-vector-extensions
  
  var a0, a1, a2, a3, b1, b2, left_corner, right_corner;
  
  function gaussCoef(sigma) {
    if (sigma < 0.5) {
      sigma = 0.5;
    }
  
    var a = Math.exp(0.726 * 0.726) / sigma,
        g1 = Math.exp(-a),
        g2 = Math.exp(-2 * a),
        k = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2);
  
    a0 = k;
    a1 = k * (a - 1) * g1;
    a2 = k * (a + 1) * g1;
    a3 = -k * g2;
    b1 = 2 * g1;
    b2 = -g2;
    left_corner = (a0 + a1) / (1 - b1 - b2);
    right_corner = (a2 + a3) / (1 - b1 - b2);
  
    // Attempt to force type to FP32.
    return new Float32Array([ a0, a1, a2, a3, b1, b2, left_corner, right_corner ]);
  }
  
  function convolveMono16(src, out, line, coeff, width, height) {
    // takes src image and writes the blurred and transposed result into out
  
    var prev_src, curr_src, curr_out, prev_out, prev_prev_out;
    var src_index, out_index, line_index;
    var i, j;
    var coeff_a0, coeff_a1, coeff_b1, coeff_b2;
  
    for (i = 0; i < height; i++) {
      src_index = i * width;
      out_index = i;
      line_index = 0;
  
      // left to right
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[6];
      prev_out = prev_prev_out;
  
      coeff_a0 = coeff[0];
      coeff_a1 = coeff[1];
      coeff_b1 = coeff[4];
      coeff_b2 = coeff[5];
  
      for (j = 0; j < width; j++) {
        curr_src = src[src_index];
  
        curr_out = curr_src * coeff_a0 +
                   prev_src * coeff_a1 +
                   prev_out * coeff_b1 +
                   prev_prev_out * coeff_b2;
  
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
  
      // right to left
      prev_src = src[src_index];
      prev_prev_out = prev_src * coeff[7];
      prev_out = prev_prev_out;
      curr_src = prev_src;
  
      coeff_a0 = coeff[2];
      coeff_a1 = coeff[3];
  
      for (j = width - 1; j >= 0; j--) {
        curr_out = curr_src * coeff_a0 +
                   prev_src * coeff_a1 +
                   prev_out * coeff_b1 +
                   prev_prev_out * coeff_b2;
  
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
    // Quick exit on zero radius
    if (!radius) { return; }
  
    var out      = new Uint16Array(src.length),
        tmp_line = new Float32Array(Math.max(width, height));
  
    var coeff = gaussCoef(radius);
  
    convolveMono16(src, out, tmp_line, coeff, width, height, radius);
    convolveMono16(out, src, tmp_line, coeff, height, width, radius);
  }
  
  module.exports = blurMono16;
  
  },{}],"19":[function(_dereq_,module,exports){
  'use strict';
  
  
  var assign         = _dereq_('object-assign');
  var base64decode   = _dereq_('./lib/base64decode');
  var hasWebAssembly = _dereq_('./lib/wa_detect');
  
  
  var DEFAULT_OPTIONS = {
    js: true,
    wasm: true
  };
  
  
  function MultiMath(options) {
    if (!(this instanceof MultiMath)) return new MultiMath(options);
  
    var opts = assign({}, DEFAULT_OPTIONS, options || {});
  
    this.options         = opts;
  
    this.__cache         = {};
  
    this.__init_promise  = null;
    this.__modules       = opts.modules || {};
    this.__memory        = null;
    this.__wasm          = {};
  
    this.__isLE = ((new Uint32Array((new Uint8Array([ 1, 0, 0, 0 ])).buffer))[0] === 1);
  
    if (!this.options.js && !this.options.wasm) {
      throw new Error('mathlib: at least "js" or "wasm" should be enabled');
    }
  }
  
  
  MultiMath.prototype.has_wasm = hasWebAssembly;
  
  
  MultiMath.prototype.use = function (module) {
    this.__modules[module.name] = module;
  
    // Pin the best possible implementation
    if (this.options.wasm && this.has_wasm() && module.wasm_fn) {
      this[module.name] = module.wasm_fn;
    } else {
      this[module.name] = module.fn;
    }
  
    return this;
  };
  
  
  MultiMath.prototype.init = function () {
    if (this.__init_promise) return this.__init_promise;
  
    if (!this.options.js && this.options.wasm && !this.has_wasm()) {
      return Promise.reject(new Error('mathlib: only "wasm" was enabled, but it\'s not supported'));
    }
  
    var self = this;
  
    this.__init_promise = Promise.all(Object.keys(self.__modules).map(function (name) {
      var module = self.__modules[name];
  
      if (!self.options.wasm || !self.has_wasm() || !module.wasm_fn) return null;
  
      // If already compiled - exit
      if (self.__wasm[name]) return null;
  
      // Compile wasm source
      return WebAssembly.compile(self.__base64decode(module.wasm_src))
        .then(function (m) { self.__wasm[name] = m; });
    }))
      .then(function () { return self; });
  
    return this.__init_promise;
  };
  
  
  ////////////////////////////////////////////////////////////////////////////////
  // Methods below are for internal use from plugins
  
  
  // Simple decode base64 to typed array. Useful to load embedded webassembly
  // code. You probably don't need to call this method directly.
  //
  MultiMath.prototype.__base64decode = base64decode;
  
  
  // Increase current memory to include specified number of bytes. Do nothing if
  // size is already ok. You probably don't need to call this method directly,
  // because it will be invoked from `.__instance()`.
  //
  MultiMath.prototype.__reallocate = function mem_grow_to(bytes) {
    if (!this.__memory) {
      this.__memory = new WebAssembly.Memory({
        initial: Math.ceil(bytes / (64 * 1024))
      });
      return this.__memory;
    }
  
    var mem_size = this.__memory.buffer.byteLength;
  
    if (mem_size < bytes) {
      this.__memory.grow(Math.ceil((bytes - mem_size) / (64 * 1024)));
    }
  
    return this.__memory;
  };
  
  
  // Returns instantinated webassembly item by name, with specified memory size
  // and environment.
  // - use cache if available
  // - do sync module init, if async init was not called earlier
  // - allocate memory if not enougth
  // - can export functions to webassembly via "env_extra",
  //   for example, { exp: Math.exp }
  //
  MultiMath.prototype.__instance = function instance(name, memsize, env_extra) {
    if (memsize) this.__reallocate(memsize);
  
    // If .init() was not called, do sync compile
    if (!this.__wasm[name]) {
      var module = this.__modules[name];
      this.__wasm[name] = new WebAssembly.Module(this.__base64decode(module.wasm_src));
    }
  
    if (!this.__cache[name]) {
      var env_base = {
        memoryBase: 0,
        memory: this.__memory,
        tableBase: 0,
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
      };
  
      this.__cache[name] = new WebAssembly.Instance(this.__wasm[name], {
        env: assign(env_base, env_extra || {})
      });
    }
  
    return this.__cache[name];
  };
  
  
  // Helper to calculate memory aligh for pointers. Webassembly does not require
  // this, but you may wish to experiment. Default base = 8;
  //
  MultiMath.prototype.__align = function align(number, base) {
    base = base || 8;
    var reminder = number % base;
    return number + (reminder ? base - reminder : 0);
  };
  
  
  module.exports = MultiMath;
  
  },{"./lib/base64decode":20,"./lib/wa_detect":21,"object-assign":22}],"20":[function(_dereq_,module,exports){
  // base64 decode str -> Uint8Array, to load WA modules
  //
  'use strict';
  
  
  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  
  module.exports = function base64decode(str) {
    var input = str.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
        max   = input.length;
  
    var out = new Uint8Array((max * 3) >> 2);
  
    // Collect by 6*4 bits (3 bytes)
  
    var bits = 0;
    var ptr  = 0;
  
    for (var idx = 0; idx < max; idx++) {
      if ((idx % 4 === 0) && idx) {
        out[ptr++] = (bits >> 16) & 0xFF;
        out[ptr++] = (bits >> 8) & 0xFF;
        out[ptr++] = bits & 0xFF;
      }
  
      bits = (bits << 6) | BASE64_MAP.indexOf(input.charAt(idx));
    }
  
    // Dump tail
  
    var tailbits = (max % 4) * 6;
  
    if (tailbits === 0) {
      out[ptr++] = (bits >> 16) & 0xFF;
      out[ptr++] = (bits >> 8) & 0xFF;
      out[ptr++] = bits & 0xFF;
    } else if (tailbits === 18) {
      out[ptr++] = (bits >> 10) & 0xFF;
      out[ptr++] = (bits >> 2) & 0xFF;
    } else if (tailbits === 12) {
      out[ptr++] = (bits >> 4) & 0xFF;
    }
  
    return out;
  };
  
  },{}],"21":[function(_dereq_,module,exports){
  // Detect WebAssembly support.
  // - Check global WebAssembly object
  // - Try to load simple module (can be disabled via CSP)
  //
  'use strict';
  
  
  var wa;
  
  
  module.exports = function hasWebAssembly() {
    // use cache if called before;
    if (typeof wa !== 'undefined') return wa;
  
    wa = false;
  
    if (typeof WebAssembly === 'undefined') return wa;
  
    // If WebAssenbly is disabled, code can throw on compile
    try {
      // https://github.com/brion/min-wasm-fail/blob/master/min-wasm-fail.in.js
      // Additional check that WA internals are correct
  
      /* eslint-disable comma-spacing, max-len */
      var bin      = new Uint8Array([ 0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11 ]);
      var module   = new WebAssembly.Module(bin);
      var instance = new WebAssembly.Instance(module, {});
  
      // test storing to and loading from a non-zero location via a parameter.
      // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
      if (instance.exports.test(4) !== 0) wa = true;
  
      return wa;
    } catch (__) {}
  
    return wa;
  };
  
  },{}],"22":[function(_dereq_,module,exports){
  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  
  'use strict';
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  
  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }
  
    return Object(val);
  }
  
  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }
  
      // Detect buggy property enumeration order in older V8 versions.
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      }
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });
      if (order2.join('') !== '0123456789') {
        return false;
      }
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join('') !==
          'abcdefghijklmnopqrst') {
        return false;
      }
  
      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }
  
  module.exports = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;
  
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
  
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
  
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
  
    return to;
  };
  
  },{}],"bc1f48da":[function(require,module,exports){var f = require("17");(f.default ? f.default : f)(self);},{"17":"17"}]},{},["bc1f48da"])