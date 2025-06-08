import { createResizeMetadata, Options, TileOptions } from '..'
import { TaskQueue } from './task-queue'

export class PicSquish {
  #taskQueue: TaskQueue
  #globalOptions: Options

  constructor(options: Options) {
    const hardwareConcurrency = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency
    const maxWorkerPoolSize = options.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4)
    const maxWorkerIdleTime = options.maxWorkerIdleTime || 10000

    this.#taskQueue = new TaskQueue(maxWorkerPoolSize, maxWorkerIdleTime)
    this.#globalOptions = options
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

    if (useMainThread) {
      const result = await createResizeMetadata(blob, maxDimension, tileOptions)
      return result
    }

    return this.#taskQueue.add({ blob, maxDimension, tileOptions })
  }
}
