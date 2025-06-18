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

export type ResizedImage = {
  from: Uint8ClampedArray
  fromWidth: number
  fromHeight: number
  stages: ResizeStage[]
}

export type CreateResizeMetadataParams = {
  image: Blob | ResizedImage
  maxDimension: number
  tileOptions: TileOptions
}

export const BYTES_PER_PIXEL = 4 // channels: RGBA

export async function createResizeMetadata(params: CreateResizeMetadataParams) {
  let from: Uint8ClampedArray
  let fromWidth: number
  let fromHeight: number
  let toWidth: number
  let toHeight: number
  let stages: ResizeStage[]

  if (params.image instanceof Blob) {
    const imageBitmap = await createImageBitmap(params.image)
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context not supported')
    context.drawImage(imageBitmap, 0, 0)
    const imageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
    from = imageData.data
    fromWidth = imageBitmap.width
    fromHeight = imageBitmap.height
    imageBitmap.close()
    const widthRatio = params.maxDimension / fromWidth
    const heightRatio = params.maxDimension / fromHeight
    const scaleFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
    const finalToWidth = Math.floor(fromWidth * scaleFactor)
    const finalToHeight = Math.floor(fromHeight * scaleFactor)
    stages = createResizeStages(
      fromWidth,
      fromHeight,
      finalToWidth,
      finalToHeight,
      params.tileOptions.initialSize,
      params.tileOptions.filterPadding,
    )
  } else {
    from = params.image.from
    fromWidth = params.image.fromWidth
    fromHeight = params.image.fromHeight
    stages = params.image.stages
  }

  toWidth = stages[0].toWidth
  toHeight = stages[0].toHeight

  const tileTransforms = createTileTransforms(
    from,
    fromWidth,
    fromHeight,
    toWidth,
    toHeight,
    params.tileOptions.initialSize,
    params.tileOptions.filterPadding,
    params.tileOptions.filter,
    params.tileOptions.unsharpAmount,
    params.tileOptions.unsharpRadius,
    params.tileOptions.unsharpThreshold,
  )

  return {
    from: from.buffer,
    fromWidth,
    fromHeight,
    tileTransforms,
    stages,
  }
}
