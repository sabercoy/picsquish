import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

export function invokeResize(tileOpts, opts) {
  // // Share cache between calls:
  // //
  // // - wasm instance
  // // - wasm memory object
  // //
  // opts.__mathCache = opts.__mathCache || {};

  return Promise.resolve().then(() => {
    return { data: resizeAndUnsharp(tileOpts, opts.__mathCache) };

    if (!this.features.ww) {
      // not possible to have ImageBitmap here if user disabled WW
      return { data: this.__mathlib.resizeAndUnsharp(tileOpts, opts.__mathCache) };
    }

    return new Promise((resolve, reject) => {
      let w = this.__workersPool.acquire();

      if (opts.cancelToken) opts.cancelToken.catch(err => reject(err));

      w.value.onmessage = ev => {
        w.release();

        if (ev.data.err) reject(ev.data.err);
        else resolve(ev.data);
      };

      let transfer = [];

      if (tileOpts.src) transfer.push(tileOpts.src.buffer);
      if (tileOpts.srcBitmap) transfer.push(tileOpts.srcBitmap);

      w.value.postMessage({
        opts: tileOpts,
        features: this.__requested_features,
        preload: {
          wasm_nodule: this.__mathlib.__
        }
      }, transfer);
    });
  });
};