export const BYTES_PER_PIXEL = 4 // channels: RGBA

export class SquishResult {
  raw: Uint8ClampedArray<ArrayBuffer>
  width: number
  height: number

  constructor(raw: Uint8ClampedArray<ArrayBuffer>, width: number, height: number) {
    this.raw = raw
    this.width = width
    this.height = height
  }

  toImageData() {
    return new ImageData(this.raw, this.width, this.height)
  }

  toImageBitmap() {
    return createImageBitmap(this.toImageData())
  }

  toCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Picsquish error: canvas 2D context not supported')
    context.putImageData(this.toImageData(), 0, 0)
    return canvas
  }

  toBlob(type: string = 'image/png') {
    const canvas = new OffscreenCanvas(this.width, this.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Picsquish error: canvas 2D context not supported')
    context.putImageData(this.toImageData(), 0, 0)
    return canvas.convertToBlob({ type })
  }
}

export type InitialImage = Blob | ImageBitmap

export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013'

export type TileOptions = {
  initialSize: number,
  filterPadding: number,
  filter: Filter,
  unsharpAmount: number,
  unsharpRadius: number,
  unsharpThreshold: number,
}

export type ResizeStage = {
  toWidth: number
  toHeight: number
}

export type TileTransform = {
  tile: ArrayBuffer
  toX: number
  toY: number
  toWidth: number
  toHeight: number
  toInnerX: number
  toInnerY: number
  toInnerWidth: number
  toInnerHeight: number
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  x: number
  y: number
  width: number
  height: number
  initialSize: number
  filterPadding: number
  filter: Filter
  unsharpAmount: number
  unsharpRadius: number
  unsharpThreshold: number
}

export type ResizedImage = {
  from: Uint8ClampedArray
  fromWidth: number
  fromHeight: number
  stages: ResizeStage[]
}

export enum TaskType {
  CreateResizeMetadata,
  TransformTile,
}

export type TaskId = number

export type TaskData1 = {
  image: InitialImage | ResizedImage
  maxDimension: number
  tileOptions: TileOptions
}

type TaskData2 = {
  tileTransform: TileTransform
}

export type TaskMessage = {
  taskId: TaskId
  squishId: TaskId
  taskType: TaskType
}

export type TaskMessage1 = TaskMessage & TaskData1
export type TaskMessage2 = TaskMessage & TaskData2

export type PendingTask = {
  id: TaskId
  squishId: TaskId
}

export type PendingTask1 = PendingTask & {
  data: TaskData1
}

export type PendingTask2 = PendingTask & {
  data: TaskData2
}

export type TaskResult = {
  taskId: TaskId
  squishId: TaskId
  taskType: TaskType
  error?: Error
}

export type TaskResult1 = TaskResult & {
  output: {
    tileTransforms: TileTransform[]
    stages: ResizeStage[]
  }
}

export type TaskResult2 = TaskResult & {
  output: {
    tileTransform: TileTransform
  }
}
