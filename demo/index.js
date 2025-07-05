import { squish } from './picsquish.js'

const createResizedCanvas = (imageBitmap, maxDimension) => {
  const originalWidth = imageBitmap.width
  const originalHeight = imageBitmap.height

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

const imageUploadCanvas = document.getElementById('image-upload-canvas')
const imageUploadPica = document.getElementById('image-upload-pica')
const imageUploadPicsquish = document.getElementById('image-upload-picsquish')
const imageGrid1 = document.getElementById('image-grid-1')
const imageGrid2 = document.getElementById('image-grid-2')
const imageGrid3 = document.getElementById('image-grid-3')

let remainingCount = Infinity
let start

const addCanvasToGrid = (canvas, imageGrid) => {
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
}, 30)

const resizeWithCanvas = async (blob, maxDimension) => {
  const bitmap = await createImageBitmap(blob)
  const { width, height } = bitmap
  const scale = Math.min(maxDimension / width, maxDimension / height, 1)

  const scaledWidth = Math.round(width * scale)
  const scaledHeight = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = scaledWidth
  canvas.height = scaledHeight

  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, scaledWidth, scaledHeight)

  return canvas
}

const getInputs = () => {
  const maxDimension = parseInt(document.getElementById('max-dimension').textContent)
  const tileSize = parseInt(document.getElementById('tile-size').textContent)
  const poolSize = parseInt(document.getElementById('pool-size').textContent)
  const poolIdle = parseInt(document.getElementById('pool-idle').textContent)
  const selectedFilter = document.querySelector('input[name="filter"]:checked').value
  const unsharpAmount = parseInt(document.getElementById('unsharp-amount').textContent)
  const unsharpRadius = parseFloat(document.getElementById('unsharp-radius').textContent)
  const unsharpThreshold = parseInt(document.getElementById('unsharp-threshold').textContent)
  return { maxDimension, tileSize, poolSize, poolIdle, selectedFilter, unsharpAmount, unsharpRadius, unsharpThreshold }
}

imageUploadCanvas.addEventListener('change', async (event) => {
  const inputs = getInputs()

  imageGrid1.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  Array.from(event.target.files).map(file => resizeWithCanvas(file, inputs.maxDimension).then(resizedCanvas => {
    addCanvasToGrid(resizedCanvas, imageGrid1)
  }))
})

imageUploadPica.addEventListener('change', async (event) => {
  const inputs = getInputs()

  imageGrid2.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  const p = pica({
    features: ['js', 'ww'],
    tile: inputs.tileSize,
    concurrency: inputs.poolSize,
    idle: inputs.poolIdle,
  })

  const resize = (imageBitmap, toCanvas) => p.resize(imageBitmap, toCanvas, {
    filter: inputs.selectedFilter,
    unsharpAmount: inputs.unsharpAmount,
    unsharpRadius: inputs.unsharpRadius,
    unsharpThreshold: inputs.unsharpThreshold,
  })

  Array.from(event.target.files).forEach(file => createImageBitmap(file).then(imageBitmap => {
    return resize(imageBitmap, createResizedCanvas(imageBitmap, inputs.maxDimension))
  }).then(resizedCanvas => addCanvasToGrid(resizedCanvas, imageGrid2)))
})

imageUploadPicsquish.addEventListener('change', async (event) => {
  const inputs = getInputs()

  imageGrid3.innerHTML = ''
  remainingCount = event.target.files.length
  start = Date.now()

  Array.from(event.target.files).forEach(async file => {
    // const imageBitmap = await createImageBitmap(file)

    const all = (file) => squish(file, [inputs.maxDimension], {
      tileSize: inputs.tileSize,
      maxWorkerPoolSize: inputs.poolSize,
      maxWorkerIdleTime: inputs.poolIdle,
      filter: inputs.selectedFilter.value,
      unsharpAmount: inputs.unsharpAmount,
      unsharpRadius: inputs.unsharpRadius,
      unsharpThreshold: inputs.unsharpThreshold,
    })

    all(file).forEach(p => {
      p.then(result => result.toImageBitmap()).then(imageBitmap => {
        const canvas = document.createElement('canvas')
        document.body.appendChild(canvas)
        const context = canvas.getContext('2d')

        canvas.width = imageBitmap.width
        canvas.height = imageBitmap.height

        context.drawImage(imageBitmap, 0, 0)

        addCanvasToGrid(canvas, imageGrid3)
      }).catch(error => console.log(error))
    })
  })
})
