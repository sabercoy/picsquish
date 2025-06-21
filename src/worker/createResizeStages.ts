// Add intermediate resizing steps when scaling down by a very large factor.
//
// For example, when resizing 10000x10000 down to 10x10, it'll resize it to
// 300x300 first.
//
// It's needed because tiler has issues when the entire tile is scaled down
// to a few pixels (1024px source tile with border size 3 should result in
// at least 3+3+2 = 8px target tile, so max scale factor is 128 here).
//
// Also, adding intermediate steps can speed up processing if we use lower
// quality algorithms for first stages.
//

import { ResizeStage } from '../common'

// min size = 0 results in infinite loop,
// min size = 1 can consume large amount of memory
const MIN_INNER_TILE_SIZE = 2

export function createResizeStages(
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number,
  initialTileSize: number,
  filterPadding: number,
): ResizeStage[] {
  const scaleX = toWidth / fromWidth
  const scaleY = toHeight / fromHeight

  // derived from createRegions equation:
  // innerTileWidth = pixelFloor(initialTileSize * scaleX) - 2 * filterPadding;
  const minScale = (2 * filterPadding + MIN_INNER_TILE_SIZE + 1) / initialTileSize

  // refuse to scale image multiple times by less than twice each time,
  // it could only happen because of invalid options
  if (minScale > 0.5) return [{ toWidth, toHeight }]

  const stageCount = Math.ceil(Math.log(Math.min(scaleX, scaleY)) / Math.log(minScale))

  // no additional resizes are necessary,
  // stageCount can be zero or be negative when enlarging the image
  if (stageCount <= 1) return [{ toWidth, toHeight }]

  const stages: ResizeStage[] = []

  for (let i = 0; i < stageCount; i++) {
    const width = Math.round(
      Math.pow(
        Math.pow(fromWidth, stageCount - i - 1) * Math.pow(toWidth, i + 1),
        1 / stageCount
      )
    )

    const height = Math.round(
      Math.pow(
        Math.pow(fromHeight, stageCount - i - 1) * Math.pow(toHeight, i + 1),
        1 / stageCount
      )
    )

    stages.push({ toWidth: width, toHeight: height })
  }

  return stages
}
