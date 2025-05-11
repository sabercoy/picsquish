export function isCanvas(element) {
  return element instanceof OffscreenCanvas
}

export function isImageBitmap(element) {
  return element instanceof ImageBitmap
}
