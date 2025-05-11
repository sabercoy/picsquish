export function landTileData(tile, result, stageEnv) {
  let toImageData;

  // this.debug('Convert raw rgba tile result to ImageData');

  if (result.bitmap) {
    stageEnv.toCtx.drawImage(result.bitmap, tile.toX, tile.toY);
    return null;
  }

  // if (CAN_NEW_IMAGE_DATA) {
  //   // this branch is for modern browsers
  //   // If `new ImageData()` & Uint8ClampedArray suported
  //   toImageData = new ImageData(new Uint8ClampedArray(result.data), tile.toWidth, tile.toHeight);
  // } else {
  //   // fallback for `node-canvas` and old browsers
  //   // (IE11 has ImageData but does not support `new ImageData()`)
  //   toImageData = stageEnv.toCtx.createImageData(tile.toWidth, tile.toHeight);

  //   if (toImageData.data.set) {
  //     toImageData.data.set(result.data);
  //   } else {
  //     // IE9 don't have `.set()`
  //     for (let i = toImageData.data.length - 1; i >= 0; i--) {
  //       toImageData.data[i] = result.data[i];
  //     }
  //   }
  // }

  toImageData = new ImageData(new Uint8ClampedArray(result.data), tile.toWidth, tile.toHeight);

  // this.debug('Draw tile');

  // TODO: test if Safari still needs this
  const NEED_SAFARI_FIX = false;

  if (NEED_SAFARI_FIX) {
    // Safari draws thin white stripes between tiles without this fix
    stageEnv.toCtx.putImageData(toImageData, tile.toX, tile.toY,
      tile.toInnerX - tile.toX, tile.toInnerY - tile.toY,
      tile.toInnerWidth + 1e-5, tile.toInnerHeight + 1e-5);
  } else {
    stageEnv.toCtx.putImageData(toImageData, tile.toX, tile.toY,
      tile.toInnerX - tile.toX, tile.toInnerY - tile.toY,
      tile.toInnerWidth, tile.toInnerHeight);
  }

  return null;
};