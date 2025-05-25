import { TileData } from '../../..'

export function landTile(
  tileData: TileData,
  resizedTile: Uint8Array<ArrayBufferLike>,
  toContext: OffscreenCanvasRenderingContext2D,
) {
  const toImageData = new ImageData(new Uint8ClampedArray(resizedTile), tileData.toWidth, tileData.toHeight)

  // TODO: test if Safari still needs this
  const NEED_SAFARI_FIX = false

  if (NEED_SAFARI_FIX) {
    // Safari draws thin white stripes between tiles without this fix
    toContext.putImageData(
      toImageData,
      tileData.toX,
      tileData.toY,
      tileData.toInnerX - tileData.toX,
      tileData.toInnerY - tileData.toY,
      tileData.toInnerWidth + 1e-5,
      tileData.toInnerHeight + 1e-5,
    )
  } else {
    toContext.putImageData(
      toImageData,
      tileData.toX,
      tileData.toY,
      tileData.toInnerX - tileData.toX,
      tileData.toInnerY - tileData.toY,
      tileData.toInnerWidth,
      tileData.toInnerHeight,
    )
  }
}
