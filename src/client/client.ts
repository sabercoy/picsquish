import { Options, resize } from '..'
import { TaskQueue } from './task-queue'

export class PicSquish {
  #taskQueue: TaskQueue
  #globalOptions: Options

  constructor(options: Options) {
    const hardwareConcurrency = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency
    const maxWorkerPoolSize = options.maxWorkerPoolSize || Math.min(hardwareConcurrency, 4)
    const maxWorkerIdleTime = options.maxWorkerIdleTime || 2000

    this.#taskQueue = new TaskQueue(maxWorkerPoolSize, maxWorkerIdleTime)
    this.#globalOptions = options
  }

  squish(blob: Blob, localOptions?: Options) {
    const options = localOptions ? { ...this.#globalOptions, ...localOptions } : this.#globalOptions

    if (options.useMainThread) return resize(blob, options)

    return this.#taskQueue.addTask({ blob, options })
  }
}
