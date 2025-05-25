import { Filter, ResizeStage } from '../../..'
import { tileAndResize } from './tileAndResize'

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

    await tileAndResize(
      from,
      to,
      srcTileSize,
      destTileBorder,
      filter,
      unsharpAmount,
      unsharpRadius,
      unsharpThreshold,
    )

    const nextStage = stages[i + 1]
    if (!nextStage) break

    from = to
    to = new OffscreenCanvas(nextStage.toWidth, nextStage.toHeight)
  }

  return to
}
