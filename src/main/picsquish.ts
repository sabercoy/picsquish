import { BYTES_PER_PIXEL, Options, ResizedImage, TileOptions } from '../common'
import { createResizeMetadata } from '../worker/create-resize-metadata'
import { placeTile } from './place-tile'
import { transformTile } from '../worker/transform-tile'
import { taskQueue } from './task-queue'

export class PicSquish {
  #globalOptions: Options

  constructor(globalOptions: Options) {
    this.#globalOptions = globalOptions
  }

  async #squishOnMainThread(blob: Blob, maxDimension: number, tileOptions: TileOptions) {
    let resizedImage: ResizedImage | null = null
    let from: Uint8ClampedArray
    let fromWidth: number
    let fromHeight: number
    let to: Uint8ClampedArray
    let toWidth: number
    let toHeight: number

    for (;;) {
      const metadata = await createResizeMetadata({ image: resizedImage || blob, maxDimension, tileOptions })
      from = new Uint8ClampedArray(metadata.from)
      fromWidth = metadata.fromWidth
      fromHeight = metadata.fromHeight
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

  async squish(blob: Blob, localOptions?: Options) {
    const combinedOptions = localOptions ? { ...this.#globalOptions, ...localOptions } : this.#globalOptions
    const maxDimension = combinedOptions.maxDimension
    const tileSize = combinedOptions.tileSize || 1024
    const filter = combinedOptions.filter || 'mks2013'
    const unsharpAmount = combinedOptions.unsharpAmount || 0
    const unsharpRadius = combinedOptions.unsharpRadius || 0
    const unsharpThreshold = combinedOptions.unsharpThreshold || 0
    const useMainThread = combinedOptions.useMainThread
    const hardwareConcurrency = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency
    const maxWorkerPoolSize = combinedOptions.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4)
    const maxWorkerPoolIdleTime = combinedOptions.maxWorkerIdleTime || 2000

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

    if (useMainThread) return await this.#squishOnMainThread(blob, maxDimension, tileOptions)

    return taskQueue.add(
      { image: blob, maxDimension, tileOptions },
      maxWorkerPoolSize,
      maxWorkerPoolIdleTime,
    )
  }
}
