import { Filter, ResizeStage } from '../../..'
import { createTileDatas } from './createTileDatas'
import { landTile } from './landTile'
import { resizeTile } from './resizeTile'

export async function processStages(
  stages: ResizeStage[],
  original: ImageBitmap,
  srcTileSize: number,
  destTileBorder: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
) {
  let from: ImageBitmap | OffscreenCanvas = original
  let to = new OffscreenCanvas(stages[0].toWidth, stages[0].toHeight)

  for (let i = 0; i < stages.length; i++) {
    const toContext = to.getContext('2d')
    if (!toContext) throw new Error('PicSquish: Canvas context is not supported')
  
    const tileDatas = createTileDatas(
      from.width,
      from.height,
      srcTileSize,
      to.width,
      to.height,
      destTileBorder,
    )
  
    for (const tileData of tileDatas) {
      const resizedTile = resizeTile(
        tileData,
        from,
        filter,
        unsharpAmount,
        unsharpRadius,
        unsharpThreshold,
      )

      landTile(tileData, resizedTile, toContext)
    }

    const nextStage = stages[i + 1]
    if (!nextStage) break

    from = to
    to = new OffscreenCanvas(nextStage.toWidth, nextStage.toHeight)
  }

  return to
}
