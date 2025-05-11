import { createStages } from './worker/pica/client/createStages'
import { processStages } from './worker/pica/client/processStages'

export type Options = {
  maxDimension: number
  useMainThread?: boolean
}

export async function resize(blob: Blob, maxDimension: number) {
  const imageBitmap = await createImageBitmap(blob)
  const originalWidth = imageBitmap.width
  const originalHeight = imageBitmap.height
  const widthRatio = maxDimension / originalWidth
  const heightRatio = maxDimension / originalHeight
  const scalingFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
  const toWidth = Math.floor(originalWidth * scalingFactor)
  const toHeight = Math.floor(originalHeight * scalingFactor)

  const offscreenCanvas = new OffscreenCanvas(toWidth, toHeight)

  const opts = {
    filter: 'mks2013',
    unsharpAmount: 0,
    unsharpRadius: 0.0,
    unsharpThreshold: 0,
    width: originalWidth,
    height: originalHeight,
    toWidth: toWidth,
    toHeight: toHeight,
    canceled: false,
    __destTileBorder: 3,
  }
  
  const stages = createStages(
    opts.width,
    opts.height,
    opts.toWidth,
    opts.toHeight,
    1024,
    opts.__destTileBorder,
  )

  const result = await processStages(stages, imageBitmap, offscreenCanvas, opts)
  const resizedImageBitmap = result.transferToImageBitmap()

  return resizedImageBitmap as ImageBitmap
}