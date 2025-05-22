import { PicaOptions, PicaTile, PicaTileOptions, StageEnv } from '../../..'
import { extractTileData } from './extractTileData'
import { createTiles } from './createTiles'
import { invokeResize } from './invokeResize'
import { landTileData } from './landTileData'
import * as utils from './utils'

const processTile = (
  tile: PicaTile,
  from: ImageBitmap | OffscreenCanvas,
  picaOptions: PicaOptions,
  stageEnv: StageEnv
) => {
  let tileOptions: PicaTileOptions = {
    width:            tile.width,
    height:           tile.height,
    toWidth:          tile.toWidth,
    toHeight:         tile.toHeight,
    scaleX:           tile.scaleX,
    scaleY:           tile.scaleY,
    offsetX:          tile.offsetX,
    offsetY:          tile.offsetY,
    filter:           picaOptions.filter,
    unsharpAmount:    picaOptions.unsharpAmount,
    unsharpRadius:    picaOptions.unsharpRadius,
    unsharpThreshold: picaOptions.unsharpThreshold,
  }

  return Promise.resolve(tileOptions)
    .then(tileOptions => extractTileData(tile, from, null, stageEnv, tileOptions))
    .then(tileOptions => invokeResize(tileOptions))
    // WEB WORKER WORKS HERE
    .then(result => landTileData(tile, result, stageEnv))
}

export function tileAndResize(
  from: ImageBitmap | OffscreenCanvas,
  to: ImageBitmap | OffscreenCanvas,
  picaOptions: PicaOptions,
) {
  let stageEnv: StageEnv = {
    srcCtx: null,
    srcImageBitmap: null,
    isImageBitmapReused: false,
    toCtx: null,
  }

  // Need to normalize data source first. It can be canvas or image.
  // If image - try to decode in background if possible
  return Promise.resolve().then(() => {
    stageEnv.toCtx = (to as OffscreenCanvas).getContext('2d')

    if (utils.isCanvas(from)) return null

    if (utils.isImageBitmap(from)) {
      stageEnv.srcImageBitmap = from
      stageEnv.isImageBitmapReused = true
      return null
    }

    throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap')
  })
  .then(() => {
    //
    // Here we are with "normalized" source,
    // follow to tiling
    //

    let tiles = createTiles({
      width:          picaOptions.width,
      height:         picaOptions.height,
      srcTileSize:    1024,
      toWidth:        picaOptions.toWidth,
      toHeight:       picaOptions.toHeight,
      destTileBorder: picaOptions.destTileBorder,
    })

    let jobs = tiles.map(tile => processTile(tile, from, picaOptions, stageEnv))

    function cleanup(stageEnv: StageEnv) {
      if (stageEnv.srcImageBitmap) {
        if (!stageEnv.isImageBitmapReused) stageEnv.srcImageBitmap.close()
        stageEnv.srcImageBitmap = null
      }
    }

    return Promise.all(jobs).then(
      () => {
        cleanup(stageEnv)
        return to
      },
      err => {
        cleanup(stageEnv)
        throw err
      }
    )
  })
}
