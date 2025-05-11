import { tileAndResize } from './tileAndResize'

export function processStages(stages, from, to, opts) {
  if (opts.canceled) return opts.cancelToken

  let [ toWidth, toHeight ] = stages.shift()

  let isLastStage = (stages.length === 0)

  // // Optimization for legacy filters -
  // // only use user-defined quality for the last stage,
  // // use simpler (Hamming) filter for the first stages where
  // // scale factor is large enough (more than 2-3)
  // //
  // // For advanced filters (mks2013 and custom) - skip optimization,
  // // because need to apply sharpening every time

  opts.toWidth = toWidth
  opts.toHeight = toHeight

  let tmpCanvas

  if (!isLastStage) {
    // create temporary canvas
    tmpCanvas = new OffscreenCanvas(toWidth, toHeight)
  }

  return tileAndResize(from, (isLastStage ? to : tmpCanvas), opts)
    .then(() => {
      if (isLastStage) return to

      opts.width = toWidth
      opts.height = toHeight
      return processStages(stages, tmpCanvas, to, opts)
    })
    .then(res => {
      if (tmpCanvas) {
        // Safari 12 workaround
        // https://github.com/nodeca/pica/issues/199
        tmpCanvas.width = tmpCanvas.height = 0
      }

      return res
    })
}
