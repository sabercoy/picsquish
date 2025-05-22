export function isCanvas(element: ImageBitmap | OffscreenCanvas) {
  return element instanceof OffscreenCanvas
}

export function isImageBitmap(element: ImageBitmap | OffscreenCanvas) {
  return element instanceof ImageBitmap
}
