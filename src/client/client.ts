import { createResizeMetadata, Options, TileOptions } from '..'
import { TaskQueue } from './task-queue'

function isSharedArrayBufferUsable(): boolean {
  return typeof SharedArrayBuffer === 'function' && self.crossOriginIsolated === true
}

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
    console.log('SAB', isSharedArrayBufferUsable())

    const combinedOptions = localOptions ? { ...this.#globalOptions, ...localOptions } : this.#globalOptions
    const maxDimension = combinedOptions.maxDimension
    const srcTileSize = combinedOptions.srcTileSize || 1024
    const filter = combinedOptions.filter || 'mks2013'
    const unsharpAmount = combinedOptions.unsharpAmount || 0
    const unsharpRadius = combinedOptions.unsharpRadius || 0
    const unsharpThreshold = combinedOptions.unsharpThreshold || 0
    const useMainThread = combinedOptions.useMainThread

    const DEST_TILE_BORDER = 3 // Max possible filter window size
    const destTileBorder = Math.ceil(Math.max(DEST_TILE_BORDER, 2.5 * unsharpRadius | 0))

    const tileOptions: TileOptions = {
      srcTileSize,
      filter,
      unsharpAmount,
      unsharpRadius,
      unsharpThreshold,
      destTileBorder,
    }

    if (useMainThread) {
      const result = await createResizeMetadata(blob, maxDimension, tileOptions)
      console.log('here')
      console.log(result)
      return result
    }

    return this.#taskQueue.add({ blob, maxDimension, tileOptions })
  }
}
