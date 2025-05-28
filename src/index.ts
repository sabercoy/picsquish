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

export async function createResizeMetadata(
  blob: Blob,
  maxDimension: number,
  tileOptions: TileOptions
) {
  const imageBitmap = await createImageBitmap(blob)
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

  const canvas = new OffscreenCanvas(fromWidth, fromHeight)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('PicSquish: Canvas context is not supported')
  context.drawImage(imageBitmap, 0, 0)

  const imageData = context.getImageData(0, 0, fromWidth, fromHeight)
  const fromBuffer = new SharedArrayBuffer(imageData.data.byteLength)
  const fromArray = new Uint8ClampedArray(fromBuffer)
  fromArray.set(imageData.data)

  const toBufferSize = toWidth * toHeight * 4
  const toBuffer = new SharedArrayBuffer(toBufferSize)

  return {
    from: fromBuffer,
    fromWidth,
    fromHeight,
    to: toBuffer,
    tileTransforms,
    stages,
  }
}