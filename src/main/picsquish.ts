import { BYTES_PER_PIXEL, InitialImage, Options, ResizedImage, TileOptions } from '../common'
import { createResizeMetadata } from '../worker/create-resize-metadata'
import { transformTile } from '../worker/transform-tile'
import { placeTile } from './place-tile'
import { taskQueue } from './task-queue'

async function squishOnMainThread(image: InitialImage, maxDimension: number, tileOptions: TileOptions) {
  let resizedImage: ResizedImage | null = null
  let to: Uint8ClampedArray
  let toWidth: number
  let toHeight: number

  for (;;) {
    const metadata = await createResizeMetadata({ image: resizedImage || image, maxDimension, tileOptions })
    toWidth = metadata.stages[0].toWidth
    toHeight = metadata.stages[0].toHeight
    to = new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL)
    
    for (const tileTransform of metadata.tileTransforms) {
      tileTransform.tile = transformTile(tileTransform).buffer
      placeTile(to, toWidth, tileTransform)
    }

    metadata.stages.shift()
    resizedImage = { from: to, fromWidth: toWidth, fromHeight: toHeight, stages: metadata.stages }
    if (!metadata.stages[0]) break
  }

  const imageData = new ImageData(resizedImage.from, resizedImage.fromWidth, resizedImage.fromHeight)
  return await createImageBitmap(imageData)
}

export async function squish(image: InitialImage, maxDimension: number, options: Options = {}) {
  const tileSize = options.tileSize || 1024
  const filter = options.filter || 'mks2013'
  const unsharpAmount = options.unsharpAmount || 0
  const unsharpRadius = options.unsharpRadius || 0
  const unsharpThreshold = options.unsharpThreshold || 0
  const useMainThread = options.useMainThread
  const hardwareConcurrency = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency
  const maxWorkerPoolSize = options.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4)
  const maxWorkerPoolIdleTime = options.maxWorkerIdleTime || 2000

  const FILTER_PADDING = 3 // Max possible filter window size
  const filterPadding = Math.ceil(Math.max(FILTER_PADDING, 2.5 * unsharpRadius | 0))

  const tileOptions: TileOptions = {
    initialSize: tileSize,
    filterPadding,
    filter,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
  }

  if (useMainThread) return await squishOnMainThread(image, maxDimension, tileOptions)

  return taskQueue.add(
    { image, maxDimension, tileOptions },
    maxWorkerPoolSize,
    maxWorkerPoolIdleTime,
  )
}