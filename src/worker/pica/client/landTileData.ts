import { PicaTile, StageEnv } from '../../..'

export function landTileData(
  tile: PicaTile,
  result: { data: Uint8Array<ArrayBufferLike> },
  stageEnv: StageEnv
) {
  let toImageData

  // if (result.bitmap) {
  //   stageEnv.toCtx.drawImage(result.bitmap, tile.toX, tile.toY)
  //   return null
  // }

  toImageData = new ImageData(new Uint8ClampedArray(result.data), tile.toWidth, tile.toHeight)

  // TODO: test if Safari still needs this
  const NEED_SAFARI_FIX = false

  if (NEED_SAFARI_FIX) {
    // Safari draws thin white stripes between tiles without this fix
    stageEnv.toCtx?.putImageData(
      toImageData,
      tile.toX,
      tile.toY,
      tile.toInnerX - tile.toX,
      tile.toInnerY - tile.toY,
      tile.toInnerWidth + 1e-5,
      tile.toInnerHeight + 1e-5,
    )
  } else {
    stageEnv.toCtx?.putImageData(
      toImageData,
      tile.toX,
      tile.toY,
      tile.toInnerX - tile.toX,
      tile.toInnerY - tile.toY,
      tile.toInnerWidth,
      tile.toInnerHeight,
    )
  }

  return null
}
