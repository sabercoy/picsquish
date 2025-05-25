import { TileData } from '../../..'

export function extractTile(
  tileData: TileData,
  from: ImageBitmap | OffscreenCanvas,
) {
  const tileCanvas = new OffscreenCanvas(tileData.width, tileData.height)
  const tileContext = tileCanvas.getContext('2d')
  if (!tileContext) throw new Error('PicSquish: Canvas context is not supported')
    
  tileContext.globalCompositeOperation = 'copy'
  tileContext.drawImage(
    from,
    tileData.x,
    tileData.y,
    tileData.width,
    tileData.height,
    0,
    0,
    tileData.width,
    tileData.height,
  )

  return tileContext.getImageData(0, 0, tileData.width, tileData.height).data
}
