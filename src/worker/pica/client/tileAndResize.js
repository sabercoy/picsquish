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
    toCtx: null,
  }

  const processTile = (tile) => {
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
      unsharpThreshold: opts.unsharpThreshold,
    }

    return Promise.resolve(tileOpts)
      .then(tileOpts => extractTileData(tile, from, opts, stageEnv, tileOpts))
      .then(tileOpts => {
        return invokeResize(tileOpts, opts)
      })
      // WEB WORKER WORKS HERE
      .then(result => {
        // if (opts.canceled) return opts.cancelToken;
        stageEnv.srcImageData = null
        return landTileData(tile, result, stageEnv)
      })
  }

  // Need to normalize data source first. It can be canvas or image.
  // If image - try to decode in background if possible
  return Promise.resolve().then(() => {
    stageEnv.toCtx = to.getContext('2d')

    if (utils.isCanvas(from)) return null

    if (utils.isImageBitmap(from)) {
      stageEnv.srcImageBitmap = from
      stageEnv.isImageBitmapReused = true
      return null
    }

    throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap')
  })
  .then(() => {
    if (opts.canceled) return opts.cancelToken

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
      destTileBorder: opts.__destTileBorder,
    })

    let jobs = regions.map(tile => processTile(tile))

    function cleanup(stageEnv) {
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
      err => { cleanup(stageEnv)
        throw err
      }
    )
  })
}
