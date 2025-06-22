import { createResizeStages } from './create-resize-stages'
import { createTileTransforms } from './create-tile-transforms'
import { InitialImage, ResizedImage, ResizeStage, TileOptions } from '../common'

type CreateResizeMetadataParams = {
  image: InitialImage | ResizedImage
  maxDimension: number
  tileOptions: TileOptions
}

export async function createResizeMetadata(params: CreateResizeMetadataParams) {
  let from: ImageBitmap | Uint8ClampedArray
  let fromWidth: number
  let fromHeight: number
  let stages: ResizeStage[]
  let toWidth: number
  let toHeight: number

  if (params.image instanceof Blob || params.image instanceof ImageBitmap) {
    const imageBitmap = params.image instanceof ImageBitmap ? params.image : await createImageBitmap(params.image)
    from = imageBitmap
    fromWidth = imageBitmap.width
    fromHeight = imageBitmap.height
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

  if (from instanceof ImageBitmap) from.close()

  return { tileTransforms, stages }
}