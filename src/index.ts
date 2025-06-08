import { createResizeStages } from './worker/pica/client/createResizeStages'
import { createTileTransforms } from './worker/pica/client/createTileTransforms'

export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013'

export type TileOptions = {
  initialSize: number,
  filterPadding: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
}

export type Options = {
  maxDimension: number
  useMainThread?: boolean
  maxWorkerPoolSize?: number
  maxWorkerIdleTime?: number
  tileSize?: TileOptions['initialSize']
  filter?: TileOptions['filter']
  unsharpAmount?: TileOptions['unsharpAmount']
  unsharpRadius?: TileOptions['unsharpRadius']
  unsharpThreshold?: TileOptions['unsharpThreshold']
}

export type ResizeStage = {
  toWidth: number
  toHeight: number
}

export type TileTransform = {
  tile: ArrayBuffer
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
  initialSize: number
  filterPadding: number
  filter: Filter
  unsharpAmount: number
  unsharpRadius: number
  unsharpThreshold: number
}

export const BYTES_PER_PIXEL = 4 // channels: RGBA

export async function createResizeMetadata(
  blob: Blob,
  maxDimension: number,
  tileOptions: TileOptions
) {
  const imageBitmap = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context not supported')
  context.drawImage(imageBitmap, 0, 0)
  const imageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
  const from = imageData.data

  const fromWidth = imageBitmap.width
  const fromHeight = imageBitmap.height
  const widthRatio = maxDimension / fromWidth
  const heightRatio = maxDimension / fromHeight
  const scaleFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
  const toWidth = Math.floor(fromWidth * scaleFactor)
  const toHeight = Math.floor(fromHeight * scaleFactor)
  
  const stages = createResizeStages(
    fromWidth,
    fromHeight,
    toWidth,
    toHeight,
    tileOptions.initialSize,
    tileOptions.filterPadding,
  )

  const tileTransforms = createTileTransforms(
    from,
    fromWidth,
    fromHeight,
    toWidth,
    toHeight,
    tileOptions.initialSize,
    tileOptions.filterPadding,
    tileOptions.filter,
    tileOptions.unsharpAmount,
    tileOptions.unsharpRadius,
    tileOptions.unsharpThreshold,
  )

  return {
    from: from.buffer,
    fromWidth,
    fromHeight,
    tileTransforms,
    stages,
  }
}
