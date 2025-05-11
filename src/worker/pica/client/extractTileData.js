import * as utils from './utils'

export function extractTileData(tile, from, opts, stageEnv, extractTo) {
  // if (this.features.ww && CAN_USE_OFFSCREEN_CANVAS &&
  //     // createImageBitmap doesn't work for images (Image, ImageBitmap) with Exif orientation in Chrome,
  //     // can use canvas because canvas doesn't have orientation;
  //     // see https://bugs.chromium.org/p/chromium/issues/detail?id=1220671
  //     (utils.isCanvas(from) || CAN_USE_CIB_REGION_FOR_IMAGE)) {
  //   // this.debug('Create tile for OffscreenCanvas');

  //   return createImageBitmap(stageEnv.srcImageBitmap || from, tile.x, tile.y, tile.width, tile.height)
  //     .then(bitmap => {
  //       extractTo.srcBitmap = bitmap;
  //       return extractTo;
  //     });
  // }

  // // Extract tile RGBA buffer, depending on input type
  // if (utils.isCanvas(from)) {
  //   if (!stageEnv.srcCtx) stageEnv.srcCtx = from.getContext('2d');

  //   // If input is Canvas - extract region data directly
  //   // this.debug('Get tile pixel data');
  //   extractTo.src = stageEnv.srcCtx.getImageData(tile.x, tile.y, tile.width, tile.height).data;
  //   return extractTo;
  // }

  // If input is Image or decoded to ImageBitmap,
  // draw region to temporary canvas and extract data from it
  //
  // Note! Attempt to reuse this canvas causes significant slowdown in chrome
  //
  // this.debug('Draw tile imageBitmap/image to temporary canvas');

  // let tmpCanvas = this.options.createCanvas(tile.width, tile.height);
  let tmpCanvas = new OffscreenCanvas(tile.width, tile.height);

  let tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.globalCompositeOperation = 'copy';
  tmpCtx.drawImage(stageEnv.srcImageBitmap || from,
    tile.x, tile.y, tile.width, tile.height,
    0, 0, tile.width, tile.height);

  // this.debug('Get tile pixel data');

  extractTo.src = tmpCtx.getImageData(0, 0, tile.width, tile.height).data;

  // Safari 12 workaround
  // https://github.com/nodeca/pica/issues/199
  tmpCanvas.width = tmpCanvas.height = 0;

  return extractTo;
};