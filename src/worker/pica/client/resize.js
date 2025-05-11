

// const DEFAULT_RESIZE_OPTS = {
//   filter:           'mks2013',
//   unsharpAmount:    0,
//   unsharpRadius:    0.0,
//   unsharpThreshold: 0
// };

// /**
//  * Resizes an image from a source to a destination canvas.
//  * @param {ImageBitmap} from - The source image to resize.
//  * @param {HTMLCanvasElement} to - The destination canvas.
//  * @param {*} options - Additional options for resizing.
//  */
// export function resize(from, to, options) {
//   // this.debug('Start resize...');

//   let opts = assign({}, DEFAULT_RESIZE_OPTS);

//   if (!isNaN(options)) {
//     opts = assign(opts, { quality: options });
//   } else if (options) {
//     opts = assign(opts, options);
//   }

//   opts.toWidth  = to.width;
//   opts.toHeight = to.height;
//   opts.width    = from.naturalWidth || from.width;
//   opts.height   = from.naturalHeight || from.height;

//   // Legacy `.quality` option
//   if (Object.prototype.hasOwnProperty.call(opts, 'quality')) {
//     if (opts.quality < 0 || opts.quality > 3) {
//       throw new Error(`Pica: .quality should be [0..3], got ${opts.quality}`);
//     }
//     opts.filter = filter_info.q2f[opts.quality];
//   }

//   // Prevent stepper from infinite loop
//   if (to.width === 0 || to.height === 0) {
//     return Promise.reject(new Error(`Invalid output size: ${to.width}x${to.height}`));
//   }

//   if (opts.unsharpRadius > 2) opts.unsharpRadius = 2;

//   opts.canceled = false;

//   if (opts.cancelToken) {
//     // Wrap cancelToken to avoid successive resolve & set flag
//     opts.cancelToken = opts.cancelToken.then(
//       data => { opts.canceled = true; throw data; },
//       err  => { opts.canceled = true; throw err; }
//     );
//   }

//   let DEST_TILE_BORDER = 3; // Max possible filter window size
//   opts.__destTileBorder = Math.ceil(Math.max(DEST_TILE_BORDER, 2.5 * opts.unsharpRadius|0));

//   return this.init().then(() => {
//     if (opts.canceled) return opts.cancelToken;

//     // if createImageBitmap supports resize, just do it and return
//     if (this.features.cib) {
//       if (filter_info.q2f.indexOf(opts.filter) >= 0) {
//         return this.__resizeViaCreateImageBitmap(from, to, opts);
//       }

//       // this.debug('cib is enabled, but not supports provided filter, fallback to manual math');
//     }

//     if (!CAN_USE_CANVAS_GET_IMAGE_DATA) {
//       let err = new Error('Pica: cannot use getImageData on canvas, ' +
//                           "make sure fingerprinting protection isn't enabled");
//       err.code = 'ERR_GET_IMAGE_DATA';
//       throw err;
//     }

//     //
//     // No easy way, let's resize manually via arrays
//     //

//     let stages = createStages(
//       opts.width,
//       opts.height,
//       opts.toWidth,
//       opts.toHeight,
//       this.options.tile,
//       opts.__destTileBorder
//     );

//     return this.__processStages(stages, from, to, opts);
//   });
// };