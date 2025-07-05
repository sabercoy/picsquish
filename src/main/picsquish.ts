import { DimensionLimit, InitialImage, TileOptions } from '../common'
import { taskQueue } from './task-queue'

type Options = {
  maxWorkerPoolSize?: number
  maxWorkerIdleTime?: number
  tileSize?: TileOptions['initialSize']
  filter?: TileOptions['filter']
  unsharpAmount?: TileOptions['unsharpAmount']
  unsharpRadius?: TileOptions['unsharpRadius']
  unsharpThreshold?: TileOptions['unsharpThreshold']
}

export function squish(image: InitialImage, dimensionLimits: DimensionLimit[], options: Options = {}) {
  const tileSize = options.tileSize || 1024
  const filter = options.filter || 'mks2013'
  const unsharpAmount = options.unsharpAmount || 0
  const unsharpRadius = options.unsharpRadius || 0
  const unsharpThreshold = options.unsharpThreshold || 0
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

  return taskQueue.add(
    { image, dimensionLimits, tileOptions },
    maxWorkerPoolSize,
    maxWorkerPoolIdleTime,
  )
}