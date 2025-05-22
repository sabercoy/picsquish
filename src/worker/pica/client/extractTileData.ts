import { PicaTile, PicaTileOptions, StageEnv } from '../../..'

export function extractTileData(
  tile: PicaTile,
  from: ImageBitmap | OffscreenCanvas,
  opts: null,
  stageEnv: StageEnv,
  extractTo: PicaTileOptions,
) {
  const tmpCanvas = new OffscreenCanvas(tile.width, tile.height)
  const tmpCtx = tmpCanvas.getContext('2d')
  if (!tmpCtx) throw new Error('Pica: Canvas context is not supported')
    
  tmpCtx.globalCompositeOperation = 'copy'
  tmpCtx.drawImage(
    stageEnv.srcImageBitmap || from,
    tile.x,
    tile.y,
    tile.width,
    tile.height,
    0,
    0,
    tile.width,
    tile.height,
  )

  extractTo.src = tmpCtx.getImageData(0, 0, tile.width, tile.height).data

  // Safari 12 workaround
  // https://github.com/nodeca/pica/issues/199
  tmpCanvas.width = tmpCanvas.height = 0

  return extractTo
}
