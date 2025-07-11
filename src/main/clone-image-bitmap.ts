export function cloneImageBitmap(image: ImageBitmap) {
  const canvas = new OffscreenCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Picsquish error: no canvas 2D context')
  context.drawImage(image, 0, 0)
  return canvas.transferToImageBitmap()
}