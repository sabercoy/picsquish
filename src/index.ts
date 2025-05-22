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
}

export type PicaBaseOptions = {
  width: number
  height: number
  toWidth: number
  toHeight: number
  destTileBorder: number
}

export type PicaOptions = PicaBaseOptions & Required<Pick<Options, 'unsharpAmount' | 'unsharpRadius' | 'unsharpThreshold'>> & {
  filter: Filter
}

export type PicaTileOptions = {
  width: number
  height: number
  toWidth: number
  toHeight: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  filter: Filter
  unsharpAmount: number
  unsharpRadius: number
  unsharpThreshold: number
  src?: Uint8ClampedArray<ArrayBufferLike>
  dest?: Uint8Array
}

export type PicaTile = {
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

export type StageEnv = {
  srcCtx: OffscreenCanvasRenderingContext2D | null
  srcImageBitmap: ImageBitmap | null
  isImageBitmapReused: boolean
  toCtx: OffscreenCanvasRenderingContext2D | null
}

export async function resize(blob: Blob, options: Options) {
  const maxDimension = options.maxDimension
  const tileSize = options.tileSize ?? 1024

  const unsharpAmount = options.unsharpAmount ?? 0
  const unsharpRadius = options.unsharpRadius ?? 0
  const unsharpThreshold = options.unsharpThreshold ?? 0

  const imageBitmap = await createImageBitmap(blob)
  const originalWidth = imageBitmap.width
  const originalHeight = imageBitmap.height
  const widthRatio = maxDimension / originalWidth
  const heightRatio = maxDimension / originalHeight
  const scaleFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
  const toWidth = Math.floor(originalWidth * scaleFactor)
  const toHeight = Math.floor(originalHeight * scaleFactor)

  const offscreenCanvas = new OffscreenCanvas(toWidth, toHeight)

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

  const picaOptions: PicaOptions = {
    filter: 'mks2013',
    unsharpAmount,
    unsharpRadius,
    unsharpThreshold,
    width: originalWidth,
    height: originalHeight,
    toWidth: toWidth,
    toHeight: toHeight,
    destTileBorder,
  }

  const result = await processStages(stages, imageBitmap, offscreenCanvas, picaOptions)
  const resizedImageBitmap = result.transferToImageBitmap()

  return resizedImageBitmap as ImageBitmap
}