import { PicaOptions } from '../../..'
import { tileAndResize } from './tileAndResize'

export async function processStages(
  stages: number[][],
  from: ImageBitmap | OffscreenCanvas,
  to: ImageBitmap | OffscreenCanvas,
  picaOptions: PicaOptions,
) {
  let [toWidth, toHeight] = stages.shift() as [number, number]

  let isLastStage = (stages.length === 0)

  // // Optimization for legacy filters -
  // // only use user-defined quality for the last stage,
  // // use simpler (Hamming) filter for the first stages where
  // // scale factor is large enough (more than 2-3)
  // //
  // // For advanced filters (mks2013 and custom) - skip optimization,
  // // because need to apply sharpening every time

  picaOptions.toWidth = toWidth
  picaOptions.toHeight = toHeight

  let tempCanvas!: OffscreenCanvas

  if (!isLastStage) {
    // create temporary canvas
    tempCanvas = new OffscreenCanvas(toWidth, toHeight)
  }

  await tileAndResize(from, (isLastStage ? to : tempCanvas), picaOptions)
  if (isLastStage) return to
  picaOptions.width = toWidth
  picaOptions.height = toHeight
  const result: any = await processStages(stages, from, tempCanvas, picaOptions)
  if (tempCanvas) {
    // Safari 12 workaround
    // https://github.com/nodeca/pica/issues/199
    tempCanvas.width = tempCanvas.height = 0
  }

  return result

  // return tileAndResize(from, (isLastStage ? to : tempCanvas), picaOptions)
  //   .then(() => {
  //     if (isLastStage) return to

  //     picaOptions.width = toWidth
  //     picaOptions.height = toHeight
  //     return processStages(stages, tempCanvas, to, picaOptions)
  //   })
  //   .then(res => {
  //     if (tempCanvas) {
  //       // Safari 12 workaround
  //       // https://github.com/nodeca/pica/issues/199
  //       tempCanvas.width = tempCanvas.height = 0
  //     }

  //     return res
  //   })
}
