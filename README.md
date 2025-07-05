picsquish - modern image resizer for browser
===========================================
[![NPM version](https://img.shields.io/npm/v/picsquish.svg)](https://www.npmjs.org/package/picsquish)

[__demo__](https://sabercoy.github.io/picsquish/demo/)

Rewrite of pica
---------------------------------
This project aims to be a modern rewrite of [__pica__](https://github.com/nodeca/pica) featuring:

  - all ESM
  - all TypeScript
  - easy to follow code
  - improved performance

Purpose
---------------------------------
This project is aimed for resizing images within the browser so that no external service is needed. The resize result from this project is an improvement on the result that would be given from the browser's Canvas API, for it features more detail, less artifacts/pixelation, and the computation is offloaded from the main thread.

Usage Examples
---------------------------------
```ts
import { squish } from 'picsquish'

// you can get a single resized image with one input image
const single = await squish(inputImage, 400)
const resizedBlob = await single.toBlob()

// you can get multiple resized images with one input image
const multi = squish(inputImage, [400, 600, 800])
multi.forEach(p => p.then(r => r.toBlob()))
```

API
---------------------------------
> The API is open for suggestions for 1.0.0 release
```ts
const squishResult = await squish(image, dimensionLimits, options)
```
- __image__ - can be `Blob` or `ImageBitmap`
- __dimensionLimits__ - can be a single input or an array specifying the dimension limit(s) for each resized image
- __options__ - options are not required and defaults are provided for those not specified
  - __useMainThread__ - if (for some reason) you want to resize on the main thread and not use web workers
  - __maxWorkerPoolSize__ - the max amount of web workers to allocate for resizing
  - __maxWorkerIdleTime__ - the max amount of idle time before web workers terminate
  - __tileSize__ - the target width and height of each tile for processing
  - __filter__ - box | hamming | lanczos2 | lanczos3 | mks2013
  - __unsharpAmount__ - (from pica): >=0. Default = 0 (off). Usually value between 100 to 200 is good. Note, mks2013 filter already does optimal sharpening.
  - __unsharpRadius__ - (from pica): 0.5..2.0. Radius of Gaussian blur. If it is less than 0.5, Unsharp Mask is off. Big values are clamped to 2.0.
  - __unsharpThreshold__ - (from pica): 0..255. Default = 0. Threshold for applying unsharp mask.

> For more context regarding options and intention you can refer to [__pica__](https://github.com/nodeca/pica)
- __SquishResult__ - the result the squish promise resolves to
  - __raw__ - result `Uint8ClampedArray<ArrayBuffer>`
  - __width__ - result width `number`
  - __height__ - result height `number`
  - __toImageData__ - turns result into `ImageData`
  - __toImageBitmap__ - turns result into `ImageBitmap`
  - __toCanvas__ - turns result into `HTMLCanvasElement`
  - __toBlob__ - turns result into `Blob`

Local Development
---------------------------------
> To develop locally you only need [__bun__](https://bun.sh)
```
bun install
bun run build
bun run demo
```

Firefox Bug
---------------------------------
There is a [__bug__](https://bugzilla.mozilla.org/show_bug.cgi?id=1969390) in Firefox regarding `createImageBitmap()` that causes images to be decoded on the main thread (this is blocking and causes visual stutters). This affects both pica and picsquish.
