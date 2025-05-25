import { PicSquish } from './picsquish.js'

const SM_IMAGE_MAX_DIMENSION = 800

const createResizedCanvas = async (imageElement, maxDimension) => {
  const originalWidth = imageElement.width
  const originalHeight = imageElement.height

  const widthRatio = maxDimension / originalWidth
  const heightRatio = maxDimension / originalHeight
  const scalingFactor = Math.min(widthRatio, heightRatio, 1) // 1 to not scale it up
  const newWidth = Math.floor(originalWidth * scalingFactor)
  const newHeight = Math.floor(originalHeight * scalingFactor)

  const canvas = document.createElement('canvas')
  canvas.width = newWidth
  canvas.height = newHeight

  return canvas
}

const imageUploadMainThread = document.getElementById('image-upload-main-thread')
const imageUploadPica = document.getElementById('image-upload-pica')
const imageUploadPicsquish = document.getElementById('image-upload-picsquish')
const imageGrid = document.getElementById('image-grid')

let remainingCount = Infinity
let start

const addCanvasToGrid = (canvas) => {
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.objectFit = 'contain'
  imageGrid.appendChild(canvas)
  remainingCount--

  if (remainingCount === 0) {
    console.log('time:', Date.now() - start)
  }
}

const count = document.getElementById('count')

setInterval(() => {
  count.innerText = parseInt(count.innerText) + 1
}, 50)

const useMainThread = async (blob) => {
  const imageBitmap = await createImageBitmap(blob)
  const newWidth = imageBitmap.width / 4
  const newHeight = imageBitmap.height / 4
  const offscreenCanvas = new OffscreenCanvas(newWidth, newHeight)
  const ctx = offscreenCanvas.getContext('2d')
  ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight)
  const resizedImageBitmap = offscreenCanvas.transferToImageBitmap()
  return resizedImageBitmap
}

imageUploadMainThread.addEventListener('change', async (event) => {
  imageGrid.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  Array.from(event.target.files).map(file => useMainThread(file).then(imageBitmap => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height
    context.drawImage(imageBitmap, 0, 0)
    addCanvasToGrid(canvas)
  }))
})

const p = pica({ features: ['js', 'ww'] })
const createResizedPicaCanvas = (originalImageElement, maxDimension) => new Promise((resolve, reject) => {
  createResizedCanvas(originalImageElement, maxDimension)
  .then(canvas => p.resize(originalImageElement, canvas))
  .then(resolve)
  .catch(reject)
})

imageUploadPica.addEventListener('change', async (event) => {
  imageGrid.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  const imageBitmapPromises = []
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]
    imageBitmapPromises.push(createImageBitmap(file))
  }
  
  const imageBitmaps = await Promise.all(imageBitmapPromises)
  imageBitmaps.forEach(imageBitmap => {
    createResizedPicaCanvas(imageBitmap, /* SM_IMAGE_MAX_DIMENSION */20)
    .then(addCanvasToGrid)
  })
})

const ps = new PicSquish({ maxDimension: 20 })
imageUploadPicsquish.addEventListener('change', async (event) => {
  imageGrid.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  Array.from(event.target.files).map(file => ps.squish(file).then(imageBitmap => {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    const context = canvas.getContext('2d')

    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height

    context.drawImage(imageBitmap, 0, 0)

    addCanvasToGrid(canvas)
  }).catch(error => console.log(error)))
})
