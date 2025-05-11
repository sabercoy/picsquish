export function extractTileData(tile, from, opts, stageEnv, extractTo) {
  let tmpCanvas = new OffscreenCanvas(tile.width, tile.height)

  let tmpCtx = tmpCanvas.getContext('2d')
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
