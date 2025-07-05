import {
  BYTES_PER_PIXEL,
  ResizeStage,
  TaskType,
  TaskData1,
  TaskResult,
  TaskResult1,
  TaskResult2,
  PendingTask1,
  PendingTask2,
  TaskMessage1,
  TaskMessage2,
  SquishResult,
  TileOptions,
  SquishId,
  WorkspaceIndex,
} from '../common'
import { placeTile } from './place-tile'
import { workerPool } from './worker-pool'

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

type SquishContext = {
  tileOptions: TileOptions
  workspaces: Map<WorkspaceIndex, Workspace>
  workspaceHandlers: Map<WorkspaceIndex, WorkspaceHandler>
}

const createId = (() => {
  let count = 0
  return () => ++count
})()

class TaskQueue {
  #squishContexts: Map<SquishId, SquishContext>
  #priority1TaskQueue: PendingTask1[]
  #priority2TaskQueue: PendingTask2[]

  constructor() {
    this.#squishContexts = new Map()
    this.#priority1TaskQueue = []
    this.#priority2TaskQueue = []
  }

  #assignPriority1Task(worker: Worker, task: PendingTask1) {
    const taskId = createId()

    const taskMessage: TaskMessage1 = {
      taskId,
      squishId: task.squishId,
      taskType: TaskType.CreateResizeMetadata,
      data: task.data,
    }

    const transfer = task.data.image instanceof ImageBitmap ? [task.data.image] : []
    workerPool.assignTask(worker, taskId, taskMessage, transfer)
  }

  #assignPriority2Task(worker: Worker, task: PendingTask2) {
    const taskId = createId()

    const taskMessage: TaskMessage2 = {
      taskId,
      squishId: task.squishId,
      workspaceIndex: task.workspaceIndex,
      taskType: TaskType.TransformTile,
      data: task.data,
    }

    workerPool.assignTask(worker, taskId, taskMessage, [task.data.tileTransform.tile])
  }

  #attemptAssignTask(worker: Worker) {
    const priority1Task = this.#priority1TaskQueue.shift()
    if (priority1Task) return this.#assignPriority1Task(worker, priority1Task)
    const priority2Task = this.#priority2TaskQueue.shift()
    if (priority2Task) return this.#assignPriority2Task(worker, priority2Task)
  }

  #processQueue() {
    const noTasks = this.#priority1TaskQueue.length === 0 && this.#priority2TaskQueue.length === 0
    if (noTasks) return workerPool.setTimeout()

    const availableWorkers = workerPool.getAvailableWorkers()
    for (const availableWorker of availableWorkers) {
      this.#attemptAssignTask(availableWorker)
    }
  }

  #onTask1Complete(squishContext: SquishContext, taskResult: TaskResult1) {
    const { squishId, output, error } = taskResult

    // if errored on task 1 then consider all workspaces for this squish context rejected
    if (error) return squishContext.workspaceHandlers.forEach(h => h.reject(error))
      
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

  // if I reject a resize, how to make sure further tasks in the queue dont execute for it
  #onTask2Complete(squishContext: SquishContext, taskResult: TaskResult2) {
    const { squishId, workspaceIndex, output, error } = taskResult

    // check if workspace exists: it is possible that it errored and cleared while this task was being processed
    if (!squishContext.workspaces.has(workspaceIndex)) return undefined

    const workspace = squishContext.workspaces.get(workspaceIndex)
    if (!workspace) throw new Error('Picsquish error: workspace not found')
    const workspaceHandler = squishContext.workspaceHandlers.get(workspaceIndex)
    if (!workspaceHandler) throw new Error('Picsquish error: workspaceHandler not found')
    
    // if error then clear the workspace and all remaining associated tasks
    if (error) {
      squishContext.workspaces.delete(workspaceIndex)
      this.#priority2TaskQueue = this.#priority2TaskQueue.filter(t => !(t.squishId === squishId && t.workspaceIndex === workspaceIndex))
      return workspaceHandler.reject(error)
    }

    placeTile(workspace.to, workspace.toWidth, output.tileTransform)
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
  
  #onTaskComplete(event: MessageEvent<TaskResult>) {
    const squishContext = this.#squishContexts.get(event.data.squishId)
    if (!squishContext) throw new Error('Picsquish error: squishContext not found')

    switch (event.data.taskType) {
      case TaskType.CreateResizeMetadata:
        this.#onTask1Complete(squishContext, event.data as TaskResult1)
        break
      case TaskType.TransformTile:
        this.#onTask2Complete(squishContext, event.data as TaskResult2)
        break
    }

    // if all workspaces are cleared after being resolved or rejected then remove the squishContext
    if (!squishContext.workspaces.size) this.#squishContexts.delete(event.data.squishId)

    workerPool.removeTask(event.data.taskId)
    this.#processQueue()
  }

  add(taskData: TaskData1, maxWorkerPoolSize: number, maxWorkerPoolIdleTime: number) {
    workerPool.prepare(
      (event: MessageEvent<TaskResult>) => this.#onTaskComplete(event),
      maxWorkerPoolSize,
      maxWorkerPoolIdleTime,
    )

    const squishPromises: Promise<SquishResult>[] = []
    const workspaceHandlers: Map<WorkspaceIndex, WorkspaceHandler> = new Map()

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
    })

    this.#priority1TaskQueue.push({ squishId, data: taskData })

    queueMicrotask(() => this.#processQueue())

    return squishPromises
  }
}

export const taskQueue = new TaskQueue()
