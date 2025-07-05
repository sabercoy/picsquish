import { createResizeStages } from './create-resize-stages'
import { createTileTransforms } from './create-tile-transforms'
import { DimensionLimit, InitialImage, ResizedImage, ResizeStage, TileOptions, TileTransform } from '../common'

type CreateResizeMetadataParams = {
  image: InitialImage | ResizedImage
  dimensionLimits: DimensionLimit[]
  tileOptions: TileOptions
}

type ResizeMetadata = {
  tileTransforms: TileTransform[]
  stages: ResizeStage[]
}

async function createResizeMetadataForInitialImage(
  image: InitialImage,
  tileOptions: TileOptions,
  dimensionLimits: DimensionLimit[],
): Promise<ResizeMetadata[]> {
  const imageBitmap = image instanceof ImageBitmap ? image : await createImageBitmap(image)
  const resizeMetadata: ResizeMetadata[] = []

  for (const dimensionLimit of dimensionLimits) {
    const from = imageBitmap
    const fromWidth = imageBitmap.width
    const fromHeight = imageBitmap.height
    const widthRatio = dimensionLimit / fromWidth
    const heightRatio = dimensionLimit / fromHeight
    const scaleFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
    const finalToWidth = Math.floor(fromWidth * scaleFactor)
    const finalToHeight = Math.floor(fromHeight * scaleFactor)

    const stages = createResizeStages(
      fromWidth,
      fromHeight,
      finalToWidth,
      finalToHeight,
      tileOptions.initialSize,
      tileOptions.filterPadding,
    )
    
    const tileTransforms = createTileTransforms(
      from,
      fromWidth,
      fromHeight,
      stages[0].toWidth,
      stages[0].toHeight,
      tileOptions,
    )

    resizeMetadata.push({ stages, tileTransforms })
  }

  imageBitmap.close()

  return resizeMetadata
}

function createResizeMetadataForResizedImage(
  image: ResizedImage,
  tileOptions: TileOptions,
): ResizeMetadata[] {
  const tileTransforms = createTileTransforms(
    image.from,
    image.fromWidth,
    image.fromHeight,
    image.stages[0].toWidth,
    image.stages[0].toHeight,
    tileOptions,
  )

  return [{ stages: image.stages, tileTransforms }]
}

export async function createResizeMetadata(params: CreateResizeMetadataParams) {
  if (params.image instanceof Blob || params.image instanceof ImageBitmap) {
    return createResizeMetadataForInitialImage(params.image, params.tileOptions, params.dimensionLimits)
  } else {
    return createResizeMetadataForResizedImage(params.image, params.tileOptions)
  }
}