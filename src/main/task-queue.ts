import {
  BYTES_PER_PIXEL,
  TaskType,
  TaskData1,
  TaskResult,
  TaskResult1,
  TaskResult2,
  PendingTask1,
  PendingTask2,
  TaskMessage1,
  TaskMessage2,
  TileOptions,
  SquishId,
  WorkspaceIndex,
  ResizeStage,
} from '../common'
import { placeTile } from './place-tile'
import { workerPool } from './worker-pool'
import { onTask1Message, onTask2Message } from '../worker/on-task-message'

type Workspace = {
  to: Uint8ClampedArray<ArrayBuffer>
  toWidth: number
  toHeight: number
  stages: ResizeStage[]
  remainingTileCount: number
}

type WorkspaceHandler = {
  resolve: (result: SquishResult) => void
  reject: (error: Error) => void
}

type WorkspaceMap = Map<WorkspaceIndex, Workspace>
type WorkspaceHandlerMap = Map<WorkspaceIndex, WorkspaceHandler>

type SquishContext = {
  tileOptions: TileOptions
  workspaces: WorkspaceMap
  workspaceHandlers: WorkspaceHandlerMap
  useMainThread: boolean
}

const createId = (() => {
  let count = 0
  return () => ++count
})()

class SquishResult {
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

class TaskQueue {
  #squishContexts: Map<SquishId, SquishContext>
  #priority1TaskQueue: PendingTask1[]
  #priority2TaskQueue: PendingTask2[]

  constructor() {
    this.#squishContexts = new Map()
    this.#priority1TaskQueue = []
    this.#priority2TaskQueue = []
  }

  #processPriority1Task(task: PendingTask1, worker?: Worker) {
    const taskId = createId()

    const taskMessage: TaskMessage1 = {
      taskId,
      squishId: task.squishId,
      taskType: TaskType.CreateResizeMetadata,
      data: task.data,
    }

    if (!worker) return onTask1Message(taskMessage).then(r => this.#onTaskComplete(r))

    const transfer = task.data.image instanceof ImageBitmap ? [task.data.image] : []
    workerPool.assignTask(worker, taskId, taskMessage, transfer)
  }

  #processPriority2Task(task: PendingTask2, worker?: Worker) {
    const taskId = createId()

    const taskMessage: TaskMessage2 = {
      taskId,
      squishId: task.squishId,
      workspaceIndex: task.workspaceIndex,
      taskType: TaskType.TransformTile,
      data: task.data,
    }

    if (!worker) return this.#onTaskComplete(onTask2Message(taskMessage))

    workerPool.assignTask(worker, taskId, taskMessage, [task.data.tileTransform.tile])
  }

  #processTask(worker?: Worker) {
    const priority1Task = this.#priority1TaskQueue.shift()
    if (priority1Task) return this.#processPriority1Task(priority1Task, worker)
    const priority2Task = this.#priority2TaskQueue.shift()
    if (priority2Task) return this.#processPriority2Task(priority2Task, worker)
  }

  #processQueue(useMainThread?: boolean) {
    const noTasks = this.#priority1TaskQueue.length === 0 && this.#priority2TaskQueue.length === 0
    if (noTasks) return workerPool.setTimeout()
    
    if (useMainThread) return this.#processTask()    

    const availableWorkers = workerPool.getAvailableWorkers()

    for (const availableWorker of availableWorkers) {
      this.#processTask(availableWorker)
    }
  }

  #onTask1Complete(squishContext: SquishContext, taskResult: TaskResult1) {
    const { squishId, output } = taskResult

    // if errored on task 1 then consider all workspaces for this squish context rejected
    if (output instanceof Error) return squishContext.workspaceHandlers.forEach(h => h.reject(output))
      
    for (const [workspaceIndex, resizeMetadata] of output.entries()) {
      const toWidth = resizeMetadata.stages[0].toWidth
      const toHeight = resizeMetadata.stages[0].toHeight
      squishContext.workspaces.set(workspaceIndex, {
        to: new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL),
        toWidth,
        toHeight,
        stages: resizeMetadata.stages,
        remainingTileCount: resizeMetadata.tileTransforms.length,
      })

      for (const tileTransform of resizeMetadata.tileTransforms) {
        this.#priority2TaskQueue.push({
          squishId,
          workspaceIndex,
          data: { tileTransform },
        })
      }
    }
  }

  #onTask2Complete(squishContext: SquishContext, taskResult: TaskResult2) {
    const { squishId, workspaceIndex, output } = taskResult

    // check if workspace exists: it is possible that it errored and cleared while this task was being processed
    if (!squishContext.workspaces.has(workspaceIndex)) return undefined

    const workspace = squishContext.workspaces.get(workspaceIndex)
    if (!workspace) throw new Error('Picsquish error: workspace not found')
    const workspaceHandler = squishContext.workspaceHandlers.get(workspaceIndex)
    if (!workspaceHandler) throw new Error('Picsquish error: workspaceHandler not found')
    
    // if error then clear the workspace and all remaining associated tasks
    if (output instanceof Error) {
      squishContext.workspaces.delete(workspaceIndex)
      this.#priority2TaskQueue = this.#priority2TaskQueue.filter(t => !(t.squishId === squishId && t.workspaceIndex === workspaceIndex))
      return workspaceHandler.reject(output)
    }

    placeTile(workspace.to, workspace.toWidth, output)
    --workspace.remainingTileCount

    if (workspace.remainingTileCount) return undefined

    workspace.stages.shift()
    const nextStage = workspace.stages[0]

    if (!nextStage) {
      squishContext.workspaces.delete(workspaceIndex)
      return workspaceHandler.resolve(new SquishResult(
        workspace.to,
        workspace.toWidth,
        workspace.toHeight
      ))
    }

    this.#priority1TaskQueue.push({
      squishId,
      data: {
        image: {
          from: workspace.to,
          fromWidth: workspace.toWidth,
          fromHeight: workspace.toHeight,
          stages: workspace.stages,
        },
        dimensionLimits: [], // only needed for initial resize
        tileOptions: squishContext.tileOptions
      },
    })
  }
  
  #onTaskComplete(taskResult: TaskResult) {
    const squishContext = this.#squishContexts.get(taskResult.squishId)
    if (!squishContext) throw new Error('Picsquish error: squishContext not found')

    switch (taskResult.taskType) {
      case TaskType.CreateResizeMetadata:
        this.#onTask1Complete(squishContext, taskResult as TaskResult1)
        break
      case TaskType.TransformTile:
        this.#onTask2Complete(squishContext, taskResult as TaskResult2)
        break
    }

    // if all workspaces are cleared after being resolved or rejected then remove the squishContext
    if (!squishContext.workspaces.size) this.#squishContexts.delete(taskResult.squishId)

    workerPool.removeTask(taskResult.taskId)
    this.#processQueue(squishContext.useMainThread)
  }

  add(
    taskData: TaskData1,
    maxWorkerPoolSize: number,
    maxWorkerPoolIdleTime: number,
    useMainThread: boolean,
  ) {
    if (!useMainThread) workerPool.prepare(
      (event: MessageEvent<TaskResult>) => this.#onTaskComplete(event.data),
      maxWorkerPoolSize,
      maxWorkerPoolIdleTime,
    )

    const squishPromises: Promise<SquishResult>[] = []
    const workspaceHandlers: WorkspaceHandlerMap = new Map()

    for (let workspaceIndex = 0; workspaceIndex < taskData.dimensionLimits.length; workspaceIndex++) {
      squishPromises.push(new Promise<SquishResult>((resolve, reject) => {
        workspaceHandlers.set(workspaceIndex, { resolve, reject })
      }))
    }

    const squishId = createId()

    this.#squishContexts.set(squishId, {
      tileOptions: taskData.tileOptions,
      workspaces: new Map(),
      workspaceHandlers,
      useMainThread,
    })

    this.#priority1TaskQueue.push({ squishId, data: taskData })

    queueMicrotask(() => this.#processQueue(useMainThread))

    return squishPromises
  }
}

export const taskQueue = new TaskQueue()
