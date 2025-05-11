import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

export function invokeResize(tileOpts, opts) {
  return Promise.resolve().then(() => {
    return { data: resizeAndUnsharp(tileOpts, opts.__mathCache) }
  })
}
