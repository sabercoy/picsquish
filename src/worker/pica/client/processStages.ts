import { Filter, PicaOptions, ResizeStage } from '../../..'
import { tileAndResize } from './tileAndResize'

function processStage() {

}

export async function processStages(
  stages: ResizeStage[],
  from: ImageBitmap | OffscreenCanvas,
  to: ImageBitmap | OffscreenCanvas,
  currentWidth: number,
  currentHeight: number,
  currentToWidth: number,
  currentToHeight: number,
  srcTileSize: number,
  destTileBorder: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
) {
  // for (const stage in stages) {
  //   await tileAndResize(
  //     from, to, picaOptions)
  // }

  const stage = stages.shift()
  if (!stage) throw new Error('Pica: Stages are empty')

  const [toWidth, toHeight] = stage

  let isLastStage = stages.length === 0

  // // Optimization for legacy filters -
  // // only use user-defined quality for the last stage,
  // // use simpler (Hamming) filter for the first stages where
  // // scale factor is large enough (more than 2-3)
  // //
  // // For advanced filters (mks2013 and custom) - skip optimization,
  // // because need to apply sharpening every time

  currentToWidth = toWidth
  currentToHeight = toHeight

  let tempCanvas!: OffscreenCanvas

  if (!isLastStage) {
    // create temporary canvas
    tempCanvas = new OffscreenCanvas(toWidth, toHeight)
  }

  // const nextTo = stages.length === 0 ? to : new OffscreenCanvas(toWidth, toHeight)

  await tileAndResize(
    from,
    isLastStage ? to : tempCanvas,
    currentWidth,
    currentHeight,
    currentToWidth,
    currentToHeight,
    srcTileSize,
    destTileBorder,
    filter,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
  )

  if (isLastStage) return to
  
  currentWidth = toWidth
  currentHeight = toHeight

  const result: any = await processStages(
    stages,
    tempCanvas,
    to,
    currentWidth,
    currentHeight,
    currentToWidth,
    currentToHeight,
    srcTileSize,
    destTileBorder,
    filter,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
  )

  // if (tempCanvas) {
  //   // Safari 12 workaround
  //   // https://github.com/nodeca/pica/issues/199
  //   tempCanvas.width = tempCanvas.height = 0
  // }

  return result
}
