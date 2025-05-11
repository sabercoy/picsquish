import { extractTileData } from './extractTileData'
import { createRegions } from './createRegions'
import { invokeResize } from './invokeResize'
import { landTileData } from './landTileData'
import * as utils from './utils'

export function tileAndResize(from, to, opts) {
  let stageEnv = {
    srcCtx: null,
    srcImageBitmap: null,
    isImageBitmapReused: false,
    toCtx: null
  };

  // const processTile = (tile => this.__limit(() => {
  //   if (opts.canceled) return opts.cancelToken;

  //   let tileOpts = {
  //     width:            tile.width,
  //     height:           tile.height,
  //     toWidth:          tile.toWidth,
  //     toHeight:         tile.toHeight,
  //     scaleX:           tile.scaleX,
  //     scaleY:           tile.scaleY,
  //     offsetX:          tile.offsetX,
  //     offsetY:          tile.offsetY,
  //     filter:           opts.filter,
  //     unsharpAmount:    opts.unsharpAmount,
  //     unsharpRadius:    opts.unsharpRadius,
  //     unsharpThreshold: opts.unsharpThreshold
  //   };

  //   this.debug('Invoke resize math');

  //   return Promise.resolve(tileOpts)
  //     .then(tileOpts => extractTileData(tile, from, opts, stageEnv, tileOpts))
  //     .then(tileOpts => {
  //       this.debug('Invoke resize math');
  //       return invokeResize(tileOpts, opts);
  //     })
  //     .then(result => {
  //       if (opts.canceled) return opts.cancelToken;
  //       stageEnv.srcImageData = null;
  //       return landTileData(tile, result, stageEnv);
  //     });
  // }));

  const processTile = (tile) => {
    // if (opts.canceled) return opts.cancelToken;

    let tileOpts = {
      width:            tile.width,
      height:           tile.height,
      toWidth:          tile.toWidth,
      toHeight:         tile.toHeight,
      scaleX:           tile.scaleX,
      scaleY:           tile.scaleY,
      offsetX:          tile.offsetX,
      offsetY:          tile.offsetY,
      filter:           opts.filter,
      unsharpAmount:    opts.unsharpAmount,
      unsharpRadius:    opts.unsharpRadius,
      unsharpThreshold: opts.unsharpThreshold
    };

    // this.debug('Invoke resize math');

    return Promise.resolve(tileOpts)
      .then(tileOpts => extractTileData(tile, from, opts, stageEnv, tileOpts))
      .then(tileOpts => {
        // this.debug('Invoke resize math');
        return invokeResize(tileOpts, opts);
      })
      // WEB WORKER WORKS HERE
      .then(result => {
        // if (opts.canceled) return opts.cancelToken;
        stageEnv.srcImageData = null;
        return landTileData(tile, result, stageEnv);
      });
  };

  // Need to normalize data source first. It can be canvas or image.
  // If image - try to decode in background if possible
  return Promise.resolve().then(() => {
    stageEnv.toCtx = to.getContext('2d');

    if (utils.isCanvas(from)) return null;

    if (utils.isImageBitmap(from)) {
      stageEnv.srcImageBitmap = from;
      stageEnv.isImageBitmapReused = true;
      return null;
    }

    // if (utils.isImage(from)) {
    //   // try do decode image in background for faster next operations;
    //   // if we're using offscreen canvas, cib is called per tile, so not needed here
    //   if (!CAN_CREATE_IMAGE_BITMAP) return null;

    //   this.debug('Decode image via createImageBitmap');

    //   return createImageBitmap(from)
    //     .then(imageBitmap => {
    //       stageEnv.srcImageBitmap = imageBitmap;
    //     })
    //     // Suppress error to use fallback, if method fails
    //     // https://github.com/nodeca/pica/issues/190
    //     /* eslint-disable no-unused-vars */
    //     .catch(e => null);
    // }

    throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap');
  })
  .then(() => {
    if (opts.canceled) return opts.cancelToken;

    // this.debug('Calculate tiles');

    //
    // Here we are with "normalized" source,
    // follow to tiling
    //

    let regions = createRegions({
      width:          opts.width,
      height:         opts.height,
      srcTileSize:    1024,
      toWidth:        opts.toWidth,
      toHeight:       opts.toHeight,
      destTileBorder: opts.__destTileBorder
    });

    let jobs = regions.map(tile => processTile(tile));

    function cleanup(stageEnv) {
      if (stageEnv.srcImageBitmap) {
        if (!stageEnv.isImageBitmapReused) stageEnv.srcImageBitmap.close();
        stageEnv.srcImageBitmap = null;
      }
    }

    // this.debug('Process tiles');

    return Promise.all(jobs).then(
      () => {
        // this.debug('Finished!');
        cleanup(stageEnv);
        return to;
      },
      err => { cleanup(stageEnv);
        throw err;
      }
    );
  });
};