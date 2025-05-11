import { Options, resize } from '..'
import { TaskQueue } from './task-queue'

export class PicSquish {
  #taskQueue: TaskQueue
  #options: Options

  constructor(options: Options) {
    this.#taskQueue = new TaskQueue()
    this.#options = options
  }

  squish(blob: Blob, options?: Options) {
    const maxDimension = options?.maxDimension || this.#options.maxDimension
    const useMainThread = options?.useMainThread || this.#options.useMainThread

    if (useMainThread) return resize(blob, maxDimension)

    return this.#taskQueue.addTask({ blob, options: options || this.#options })
  }
}
