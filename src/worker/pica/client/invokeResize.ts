import { PicaTileOptions } from '../../..'
import { resizeAndUnsharp } from '../worker/resizeAndUnsharp'

export function invokeResize(tileOpts: PicaTileOptions) {
  return Promise.resolve().then(() => {
    return { data: resizeAndUnsharp(tileOpts) }
  })
}
