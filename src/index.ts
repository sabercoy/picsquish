import { createStages } from './worker/pica/client/createStages'
import { processStages } from './worker/pica/client/processStages'

export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013'

export type Options = {
  maxDimension: number
  useMainThread?: boolean
  maxWorkerPoolSize?: number
  maxWorkerIdleTime?: number
  tileSize?: number
  unsharpAmount?: number
  unsharpRadius?: number
  unsharpThreshold?: number
  filter?: Filter
}

export type TileData = {
  toX: number
  toY: number
  toWidth: number
  toHeight: number
  toInnerX: number
  toInnerY: number
  toInnerWidth: number
  toInnerHeight: number
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  x: number
  y: number
  width: number
  height: number
}

export type ResizeStage = {
  toWidth: number
  toHeight: number
}

export async function resize(blob: Blob, options: Options) {
  const maxDimension = options.maxDimension
  const tileSize = options.tileSize || 1024
  const filter = options.filter || 'mks2013'

  const unsharpAmount = options.unsharpAmount || 0
  const unsharpRadius = options.unsharpRadius || 0
  const unsharpThreshold = options.unsharpThreshold || 0

  const imageBitmap = await createImageBitmap(blob)
  const originalWidth = imageBitmap.width
  const originalHeight = imageBitmap.height
  const widthRatio = maxDimension / originalWidth
  const heightRatio = maxDimension / originalHeight
  const scaleFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
  const toWidth = Math.floor(originalWidth * scaleFactor)
  const toHeight = Math.floor(originalHeight * scaleFactor)

  const DEST_TILE_BORDER = 3 // Max possible filter window size
  const destTileBorder = Math.ceil(Math.max(DEST_TILE_BORDER, 2.5 * unsharpRadius | 0))
  
  const stages = createStages(
    originalWidth,
    originalHeight,
    toWidth,
    toHeight,
    tileSize,
    destTileBorder,
  )

  const result = await processStages(
    stages,
    imageBitmap,
    tileSize,
    destTileBorder,
    filter,
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
  )

  return result.transferToImageBitmap()
}
